import { GENESIS_DATA } from "../config";

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH), 16);

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

	static mineBlock({ lastBlock, beneficiary }: any) {}

	static genesis() {
		return new this(GENESIS_DATA);
	}
}

export default Block;
