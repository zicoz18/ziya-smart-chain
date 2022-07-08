import * as _ from "lodash";

import { keccakHash } from "../util";

class Node {
	public value: any;
	public childMap: any;

	constructor() {
		this.value = null;
		this.childMap = {};
	}
}

class Trie {
	public head: any;
	public rootHash: any;

	constructor() {
		this.head = new Node();
		this.generateRootHash();
	}

	generateRootHash() {
		this.rootHash = keccakHash(this.head);
	}

	get({ key }: any) {
		let node = this.head;

		for (let character of key) {
			if (!node.childMap[character]) {
				return null;
			} else {
				node = node.childMap[character];
			}
		}

		return _.cloneDeep(node.value);
	}

	put({ key, value }: any) {
		let node = this.head;

		for (let character of key) {
			if (!node.childMap[character]) {
				node.childMap[character] = new Node();
			}

			node = node.childMap[character];
		}

		node.value = value;
		this.generateRootHash();
	}

	static buildTrie({ items }: any): Trie {
		const trie = new this();

		for (let item of items.sort((a: any, b: any) => {
			keccakHash(a) > keccakHash(b);
		})) {
			trie.put({ key: keccakHash(item), value: item });
		}

		return trie;
	}
}

export default Trie;
