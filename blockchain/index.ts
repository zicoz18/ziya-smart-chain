import Block from "./block";

class Blockchain {
	public chain: Block[];

	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock({ block }: any) {
		this.chain.push(block);
	}
}

export default Blockchain;
