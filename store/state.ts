import Trie from "./trie";

class State {
	public stateTrie: Trie;
	public storageTrieMap: any;

	constructor() {
		this.stateTrie = new Trie();
		this.storageTrieMap = {};
	}

	putAccount({ address, accountData }: any) {
		if (!this.storageTrieMap[address]) {
			this.storageTrieMap[address] = new Trie();
		}
		this.stateTrie.put({
			key: address,
			value: {
				...accountData,
				storageRoot: this.storageTrieMap[address].rootHash,
			},
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
