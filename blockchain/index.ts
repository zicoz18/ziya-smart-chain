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

	replaceChain({ chain }: any) {
		return new Promise<void>(async (resolve, reject) => {
			for (let i = 0; i < chain.length; i++) {
				const block = chain[i];
				const lastBlockIndex = i - 1;
				const lastBlock = lastBlockIndex >= 0 ? chain[i - 1] : null;

				try {
					await Block.validateBlock({
						lastBlock,
						block,
					});
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
