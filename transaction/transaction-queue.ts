import Transaction from ".";

class TransactionQueue {
	public transactionMap: any;

	constructor() {
		this.transactionMap = {};
	}

	add(transaction: Transaction): void {
		this.transactionMap[transaction.id] = transaction;
	}

	getTransactionSeries(): Transaction[] {
		return Object.values(this.transactionMap);
	}

	clearBlockTransactions({
		transactionSeries,
	}: {
		transactionSeries: Transaction[];
	}): void {
		for (let transaction of transactionSeries) {
			delete this.transactionMap[transaction.id];
		}
	}
}

export default TransactionQueue;
