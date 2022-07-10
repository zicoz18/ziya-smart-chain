import { ec, keccakHash } from "../util";

import { STARTING_BALANCE } from "../config";
import { ec as EC } from "elliptic";
import { Code } from "../interpreter";

class Account {
	private keyPair: EC.KeyPair;
	public address: string;
	public balance: number;
	public code: Code[];
	public codeHash: string | null | undefined;

	constructor({ code }: any = {}) {
		this.keyPair = ec.genKeyPair();
		this.address = this.keyPair.getPublic().encode("hex", false);
		this.balance = STARTING_BALANCE;
		this.code = code || [];
		this.generateCodeHash();
	}

	generateCodeHash(): void {
		this.codeHash =
			this.code.length > 0 ? keccakHash(this.address + this.code) : null;
	}

	sign(data: any): EC.Signature {
		return this.keyPair.sign(keccakHash(data));
	}

	static verifySignature({
		publicKey,
		data,
		signature,
	}: {
		publicKey: string;
		data: any;
		signature: EC.Signature | string;
	}): boolean {
		const keyFromPublic = ec.keyFromPublic(publicKey, "hex");
		return keyFromPublic.verify(keccakHash(data), signature);
	}

	toJSON(): {
		address: string;
		balance: number;
		code: Code[];
		codeHash: string;
	} {
		return {
			address: this.address,
			balance: this.balance,
			code: this.code,
			codeHash: this.codeHash as string,
		};
	}

	static calculateBalance({ address, state }: any) {
		return state.getAccount({ address }).balance;
	}
}

export default Account;
