import Block from "./block";

class Blockchain {
	public chain: Block[];

	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock({ block }: any) {
		return new Promise<void>((resolve, reject) => {
			Block.validateBlock({
				lastBlock: this.chain[this.chain.length - 1],
				block,
			})
				.then(() => {
					this.chain.push(block);
					return resolve();
				})
				.catch(reject);
		});
	}
}

export default Blockchain;
