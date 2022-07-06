import Block from "./block";

class Blockchain {
	public chain: Block[];

	constructor() {
		this.chain = [Block.genesis()];
	}
}

export default Blockchain;
