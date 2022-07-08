import { v4 as uuidv4, v4, v5 } from "uuid";
import Account from "../account";

const TRANSACTION_TYPE_MAP = {
	CREATE_ACCOUNT: "CREATE_ACCOUNT",
	TRANSACT: "TRANSACT",
};

class Transaction {
	public id: any;
	public from: any;
	public to: any;
	public value: any;
	public data: any;
	public signature: any;

	constructor({ id, from, to, value, data, signature }: any) {
		this.id = id || v4();
		this.from = from || "-";
		this.to = to || "-";
		this.value = value || 0;
		this.data = data || "-";
		this.signature = signature || "-";
	}

	static createTransaction({ account, to, value }: any) {
		if (to) {
			const transactionData = {
				id: v4(),
				from: account.address,
				to,
				value,
				data: { type: TRANSACTION_TYPE_MAP.TRANSACT },
			};

			return new Transaction({
				...transactionData,
				signature: account.sign(transactionData),
			});
		}

		return new Transaction({
			data: {
				type: TRANSACTION_TYPE_MAP.CREATE_ACCOUNT,
				accountData: account.toJSON(),
			},
		});
	}

	static validateStandardTransaction({ transaction }: any) {
		return new Promise<void>((resolve, reject) => {
			const { id, from, signature } = transaction;
			const transactionData = { ...transaction };
			delete transactionData.signature;

			if (
				!Account.verifySignature({
					publicKey: from,
					data: transactionData,
					signature,
				})
			) {
				return reject(new Error(`Transaction: ${id}`));
			}
			return resolve();
		});
	}

	static validateCreteAccountTransaction({ transaction }: any) {
		return new Promise<void>((resolve, reject) => {
			const expectedAccountDataFields = Object.keys(new Account().toJSON());
			const fileds = Object.keys(transaction.data.accountData);

			if (fileds.length !== expectedAccountDataFields.length) {
				return reject(
					new Error(
						"The transaction account data has an incorrect number of fields"
					)
				);
			}

			fileds.forEach((field) => {
				if (!expectedAccountDataFields.includes(field)) {
					return reject(
						new Error(`The filed: ${field} is  unexpected for account data`)
					);
				}
			});

			return resolve();
		});
	}
}

export default Transaction;
