import { ec, keccakHash } from "../util";

import { STARTING_BALANCE } from "../config";

class Account {
	private keyPair: any;
	public address: string;
	public balance: number;

	constructor() {
		this.keyPair = ec.genKeyPair();
		this.address = this.keyPair.getPublic().encode("hex");
		this.balance = STARTING_BALANCE;
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
		};
	}
}

export default Account;
