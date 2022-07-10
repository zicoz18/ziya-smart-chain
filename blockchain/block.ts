import { GENESIS_DATA, MINE_RATE } from "../config";
import { keccakHash } from "../util";
import Transaction from "../transaction";
import Trie from "../store/trie";
import State from "../store/state";

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

interface BlockHeaders {
	parentHash: string;
	beneficiary: string;
	difficulty: number;
	number: number;
	timestamp: number;
	transactionsRoot: string;
	stateRoot: string;
	nonce: number;
}

class Block {
	public blockHeaders: BlockHeaders;
	public transactionSeries: Transaction[];

	constructor({
		blockHeaders,
		transactionSeries,
	}: {
		blockHeaders: BlockHeaders;
		transactionSeries: Transaction[];
	}) {
		this.blockHeaders = blockHeaders;
		this.transactionSeries = transactionSeries;
	}

	static calculateBlockTargetHash({ lastBlock }: { lastBlock: Block }): string {
		const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(
			16
		);

		if (value.length > HASH_LENGTH) {
			return "f".repeat(HASH_LENGTH);
		}
		return "0".repeat(HASH_LENGTH - value.length) + value;
	}

	static adjustDifficulty({
		lastBlock,
		timestamp,
	}: {
		lastBlock: Block;
		timestamp: number;
	}): number {
		const { difficulty } = lastBlock.blockHeaders;

		if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE) {
			return difficulty - 1;
		}

		if (difficulty < 1) {
			return 1;
		}

		return difficulty + 1;
	}

	static mineBlock({
		lastBlock,
		beneficiary,
		transactionSeries,
		stateRoot,
	}: {
		lastBlock: Block;
		beneficiary: string;
		transactionSeries: Transaction[];
		stateRoot: string;
	}): Block {
		const target = this.calculateBlockTargetHash({ lastBlock });
		const miningRewardTransaction = Transaction.createTransaction({
			beneficiary,
		});
		transactionSeries.push(miningRewardTransaction);
		const transactionsTrie = Trie.buildTrie({ items: transactionSeries });
		let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;

		do {
			timestamp = Date.now();
			truncatedBlockHeaders = {
				parentHash: keccakHash(lastBlock.blockHeaders),
				beneficiary,
				difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
				number: lastBlock.blockHeaders.number + 1,
				timestamp,
				transactionsRoot: transactionsTrie.rootHash,
				stateRoot,
			};
			header = keccakHash(truncatedBlockHeaders);
			nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

			underTargetHash = keccakHash(header + nonce);
		} while (underTargetHash > target);

		return new this({
			blockHeaders: {
				...truncatedBlockHeaders,
				nonce,
			},
			transactionSeries,
		});
	}

	static genesis(): Block {
		return new this(GENESIS_DATA as any as Block);
	}

	static validateBlock({
		lastBlock,
		block,
		state,
	}: {
		lastBlock: Block;
		block: Block;
		state: State;
	}): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (keccakHash(block) === keccakHash(Block.genesis())) {
				return resolve();
			}

			if (
				keccakHash(lastBlock.blockHeaders) !== block.blockHeaders.parentHash
			) {
				return reject(
					new Error("The parent has must be a hash of the last block's headers")
				);
			}

			if (block.blockHeaders.number !== lastBlock.blockHeaders.number + 1) {
				return reject(new Error("The block must increment the number by 1"));
			}

			if (
				Math.abs(
					lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty
				) > 1
			) {
				return reject(new Error("The difficulty must only adjust by 1"));
			}

			const target = Block.calculateBlockTargetHash({ lastBlock });
			const { blockHeaders } = block;
			const { nonce } = blockHeaders;
			const truncatedBlockHeaders = { ...blockHeaders };
			delete (truncatedBlockHeaders as any).nonce;
			const header = keccakHash(truncatedBlockHeaders);
			const underTargetHash = keccakHash(header + nonce);

			if (underTargetHash > target) {
				return reject(
					new Error("The block does not meet the proof of work requirement")
				);
			}

			const rebuiltTransactionsTrie = Trie.buildTrie({
				items: block.transactionSeries,
			});
			console.log("block.blockHeader: ", block.blockHeaders);
			if (
				rebuiltTransactionsTrie.rootHash !== block.blockHeaders.transactionsRoot
			) {
				return reject(
					new Error(
						`The rebuild transactions root does not match the block's transactions root: ${block.blockHeaders.transactionsRoot}`
					)
				);
			}

			Transaction.validateTransactionSeries({
				state,
				transactionSeries: block.transactionSeries,
			})
				.then(resolve)
				.catch(reject);
		});
	}

	static runBlock({ block, state }: { block: Block; state: State }): void {
		for (let transaction of block.transactionSeries) {
			Transaction.runTransaction({ transaction, state });
		}
	}
}

export default Block;
