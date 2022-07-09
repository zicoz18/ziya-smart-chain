import { ec, keccakHash } from "../util";

import { STARTING_BALANCE } from "../config";

class Account {
	private keyPair: any;
	public address: string;
	public balance: number;
	public code: any;
	public codeHash: any;

	constructor({ code }: any = {}) {
		this.keyPair = ec.genKeyPair();
		this.address = this.keyPair.getPublic().encode("hex");
		this.balance = STARTING_BALANCE;
		this.code = code || [];
		this.generateCodeHash();
	}

	generateCodeHash() {
		this.codeHash =
			this.code.length > 0 ? keccakHash(this.address + this.code) : null;
	}

	sign(data: any) {
		return this.keyPair.sign(keccakHash(data));
	}

	static verifySignature({ publicKey, data, signature }: any) {
		const keyFromPublic = ec.keyFromPublic(publicKey, "hex");
		return keyFromPublic.verify(keccakHash(data), signature);
	}

	toJSON() {
		return {
			address: this.address,
			balance: this.balance,
			code: this.code,
			codeHash: this.codeHash,
		};
	}

	static calculateBalance({ address, state }: any) {
		return state.getAccount({ address }).balance;
	}
}

export default Account;
