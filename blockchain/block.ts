import { GENESIS_DATA, MINE_RATE } from "../config";
import { keccakHash } from "../util";

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
	public blockHeaders: any;

	constructor({ blockHeaders }: any) {
		this.blockHeaders = blockHeaders;
	}

	static calculateBlockTargetHash({ lastBlock }: any) {
		const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(
			16
		);

		if (value.length > HASH_LENGTH) {
			return "f".repeat(HASH_LENGTH);
		}
		return "0".repeat(HASH_LENGTH - value.length) + value;
	}

	static adjustDifficulty({ lastBlock, timestamp }: any) {
		const { difficulty } = lastBlock.blockHeaders;

		if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE) {
			return difficulty - 1;
		}

		if (difficulty < 1) {
			return 1;
		}

		return difficulty + 1;
	}

	static mineBlock({ lastBlock, beneficiary }: any) {
		const target = this.calculateBlockTargetHash({ lastBlock });
		let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;

		do {
			timestamp = Date.now();
			truncatedBlockHeaders = {
				parentHash: keccakHash(lastBlock.blockHeaders),
				beneficiary,
				difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
				number: lastBlock.blockHeaders.number + 1,
				timestamp,
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
		});
	}

	static genesis() {
		return new this(GENESIS_DATA);
	}
}

export default Block;
