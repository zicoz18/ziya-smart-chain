class TransactionQueue {
	public transactionMap: any;

	constructor() {
		this.transactionMap = {};
	}

	add(transaction: any) {
		this.transactionMap[transaction.id] = transaction;
	}

	getTransactionSeries() {
		return Object.values(this.transactionMap);
	}

	clearBlockTransactions({ transactionSeries }: any) {
		for (let transaction of transactionSeries) {
			delete this.transactionMap[transaction.id];
		}
	}
}

export default TransactionQueue;
