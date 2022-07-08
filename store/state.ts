import Trie from "./trie";

class State {
	public stateTrie: Trie;

	constructor() {
		this.stateTrie = new Trie();
	}

	putAccount({ address, accountData }: any) {
		this.stateTrie.put({
			key: address,
			value: accountData,
		});
	}

	getAccount({ address }: any) {
		return this.stateTrie.get({ key: address });
	}

	getStateRoot() {
		return this.stateTrie.rootHash;
	}
}

export default State;
