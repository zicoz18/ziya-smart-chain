import { GENESIS_DATA } from "../config";

class Block {
	public blockHeaders: any;

	constructor({ blockHeaders }: any) {
		this.blockHeaders = blockHeaders;
	}

	static mineBlock({ lastBlock }: any) {}

	static genesis() {
		return new this(GENESIS_DATA);
	}
}

export default Block;
