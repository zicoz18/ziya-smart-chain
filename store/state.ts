import Account from "../account";
import Trie from "./trie";

class State {
	public stateTrie: Trie;
	public storageTrieMap: any;

	constructor() {
		this.stateTrie = new Trie();
		this.storageTrieMap = {};
	}

	putAccount({
		address,
		accountData,
	}: {
		address: string;
		accountData: Account;
	}): void {
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

	getAccount({ address }: { address: string }): Account {
		return this.stateTrie.get({ key: address });
	}

	getStateRoot(): string {
		return this.stateTrie.rootHash;
	}
}

export default State;
