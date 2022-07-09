import { v4 as uuidv4, v4 } from "uuid";
import Account from "../account";
import { MINING_REWARD } from "../config";
import Interpreter from "../interpreter";

const TRANSACTION_TYPE_MAP = {
	CREATE_ACCOUNT: "CREATE_ACCOUNT",
	TRANSACT: "TRANSACT",
	MINING_REWARD: "MINING_REWARD",
};

class Transaction {
	public id: any;
	public from: any;
	public to: any;
	public value: any;
	public data: any;
	public signature: any;
	public gasLimit: any;

	constructor({ id, from, to, value, data, signature, gasLimit }: any) {
		this.id = id || v4();
		this.from = from || "-";
		this.to = to || "-";
		this.value = value || 0;
		this.data = data || "-";
		this.signature = signature || "-";
		this.gasLimit = gasLimit || 0;
	}

	static createTransaction({ account, to, value, beneficiary, gasLimit }: any) {
		if (beneficiary) {
			return new Transaction({
				to: beneficiary,
				value: MINING_REWARD,
				gasLimit,
				data: {
					type: TRANSACTION_TYPE_MAP.MINING_REWARD,
				},
			});
		}

		if (to) {
			const transactionData = {
				id: v4(),
				from: account.address,
				to,
				value: value || 0,
				gasLimit: gasLimit || 0,
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

	static validateStandardTransaction({ transaction, state }: any) {
		return new Promise<void>((resolve, reject) => {
			const { id, from, signature, value, to, gasLimit } = transaction;
			const transactionData = { ...transaction };
			delete transactionData.signature;

			if (
				!Account.verifySignature({
					publicKey: from,
					data: transactionData,
					signature,
				})
			) {
				return reject(new Error(`Transaction: ${id} signature is invalid`));
			}

			const fromBalance = state.getAccount({ address: from }).balance;
			if (value + gasLimit > fromBalance) {
				return reject(
					new Error(
						`Transaction value and gasLimit: ${value} exceeds balance: ${fromBalance}`
					)
				);
			}

			const toAccount = state.getAccount({ address: to });
			if (!toAccount) {
				return reject(new Error(`The to field ${to} does not exist`));
			}

			if (toAccount.codeHash) {
				const gasUsed = new Interpreter({
					storageTrie: state.storageTrieMap[toAccount.codeHash],
				}).runCode(toAccount.code)?.gasUsed as any;

				if (gasUsed > gasLimit) {
					return reject(
						new Error(
							`Transaction needs more gas. Provided: ${gasLimit}. Needs: ${gasUsed}.`
						)
					);
				}
			}

			return resolve();
		});
	}

	static validateCreateAccountTransaction({ transaction }: any) {
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

	static validateMiningRewardTransaction({ transaction }: any) {
		return new Promise<void>((resolve, reject) => {
			const { value } = transaction;

			if (value !== MINING_REWARD) {
				return reject(
					new Error(
						`The provided mining reward value: ${value} does not equal the official value: ${MINING_REWARD}`
					)
				);
			}

			return resolve();
		});
	}

	static validateTransactionSeries({ transactionSeries, state }: any) {
		return new Promise<void>(async (resolve, reject) => {
			for (let transaction of transactionSeries) {
				try {
					switch (transaction.data.type) {
						case TRANSACTION_TYPE_MAP.CREATE_ACCOUNT:
							await Transaction.validateCreateAccountTransaction({
								transaction,
							});
							break;
						case TRANSACTION_TYPE_MAP.TRANSACT:
							await Transaction.validateStandardTransaction({
								transaction,
								state,
							});
							break;
						case TRANSACTION_TYPE_MAP.MINING_REWARD:
							await Transaction.validateMiningRewardTransaction({
								transaction,
							});
							break;
						default:
							break;
					}
				} catch (error) {
					return reject(error);
				}
			}

			return resolve();
		});
	}

	static runTransaction({ transaction, state }: any) {
		switch (transaction.data.type) {
			case TRANSACTION_TYPE_MAP.TRANSACT:
				Transaction.runStandardTransaction({ transaction, state });
				console.log(
					" -- Updated account data to reflect the standard transaction"
				);
				break;
			case TRANSACTION_TYPE_MAP.CREATE_ACCOUNT:
				Transaction.runCreateAccountTransaction({ transaction, state });
				console.log(" -- Stored the account data");
				break;
			case TRANSACTION_TYPE_MAP.MINING_REWARD:
				Transaction.runMiningRewardTransaction({ transaction, state });
				console.log(
					" -- Updated the account data to reflect the mining reward"
				);
				break;
			default:
				break;
		}
	}

	static runStandardTransaction({ transaction, state }: any) {
		const fromAccount = state.getAccount({ address: transaction.from });
		const toAccount = state.getAccount({ address: transaction.to });

		let gasUsed = 0;
		let result;

		if (toAccount.codeHash) {
			console.log("toAccount: ", toAccount);
			const interpreter = new Interpreter({
				storageTrie: state.storageTrieMap[toAccount.codeHash],
			});
			({ result, gasUsed } = interpreter.runCode(toAccount.code) as any);
			console.log(
				` -*- Smart contract execution: ${transaction.id} - RESULT: ${result}`
			);
		}

		const { value, gasLimit } = transaction;
		const refund = gasLimit - gasUsed;

		fromAccount.balance -= value;
		fromAccount.balance -= gasLimit;
		fromAccount.balance += refund;
		toAccount.balance += value;
		toAccount.balance += gasUsed;

		state.putAccount({ address: transaction.from, accountData: fromAccount });
		state.putAccount({ address: transaction.to, accountData: toAccount });
	}

	static runCreateAccountTransaction({ transaction, state }: any) {
		const { accountData } = transaction.data;
		const { address, codeHash } = accountData;

		state.putAccount({ address: codeHash ? codeHash : address, accountData });
	}

	static runMiningRewardTransaction({ transaction, state }: any) {
		const { to, value } = transaction;
		const accountData = state.getAccount({ address: to });
		accountData.balance += value;

		state.putAccount({ address: to, accountData });
	}
}

export default Transaction;
