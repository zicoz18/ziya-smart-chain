import State from "../store/state";
import TransactionQueue from "../transaction/transaction-queue";
import Block from "./block";

class Blockchain {
	public chain: Block[];
	public state: State;

	constructor({ state }: { state: State }) {
		this.chain = [Block.genesis()];
		this.state = state;
	}

	addBlock({
		block,
		transactionQueue,
	}: {
		block: Block;
		transactionQueue: TransactionQueue;
	}): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			Block.validateBlock({
				lastBlock: this.chain[this.chain.length - 1],
				block,
				state: this.state,
			})
				.then(() => {
					this.chain.push(block);
					Block.runBlock({ block, state: this.state });

					transactionQueue.clearBlockTransactions({
						transactionSeries: block.transactionSeries,
					});
					return resolve();
				})
				.catch(reject);
		});
	}

	replaceChain({ chain }: { chain: Block[] }): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			for (let i = 0; i < chain.length; i++) {
				const block = chain[i];
				const lastBlockIndex = i - 1;
				const lastBlock = (lastBlockIndex >= 0 ? chain[i - 1] : null) as Block;

				try {
					await Block.validateBlock({
						lastBlock,
						block,
						state: this.state,
					});

					Block.runBlock({ block, state: this.state });
				} catch (error) {
					return reject(error);
				}

				console.log(`*-- Validated block number: ${block.blockHeaders.number}`);
			}
			this.chain = chain;
			return resolve();
		});
	}
}

export default Blockchain;
