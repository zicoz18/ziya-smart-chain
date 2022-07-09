import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

import Account from "../account";
import Blockchain from "../blockchain";
import Block from "../blockchain/block";
import PubSub from "./pubsub";
import State from "../store/state";
import Transaction from "../transaction";
import TransactionQueue from "../transaction/transaction-queue";

const app = express();
app.use(bodyParser.json());

const state = new State();
const blockchain = new Blockchain({ state });
const transactionQueue = new TransactionQueue();
const pubsub = new PubSub({ blockchain, transactionQueue });
const account = new Account();
const transaction = Transaction.createTransaction({ account });

setTimeout(() => {
	pubsub.broadcastTransaction(transaction);
}, 500);

app.get("/blockchain", (req, res, next) => {
	const { chain } = blockchain;
	res.json({ chain });
});

app.get("/blockchain/mine", (req, res, next) => {
	const lastBlock = blockchain.chain[blockchain.chain.length - 1];
	const block = Block.mineBlock({
		lastBlock,
		beneficiary: account.address,
		transactionSeries: transactionQueue.getTransactionSeries(),
		stateRoot: state.getStateRoot(),
	});

	blockchain
		.addBlock({ block, transactionQueue })
		.then(() => {
			pubsub.broadcastBlock(block);
			res.json({ block });
		})
		.catch(next);
});

app.post("/account/transact", (req, res, next) => {
	const { code, gasLimit, to, value } = req.body;
	const transaction = Transaction.createTransaction({
		account: !to ? new Account({ code }) : account,
		gasLimit,
		to,
		value,
	});
	pubsub.broadcastTransaction(transaction);

	res.json({ transaction });
});

app.get("/account/balance", (req, res, next) => {
	const { address } = req.query;

	const balance = Account.calculateBalance({
		address: address || account.address,
		state,
	});
	res.json({ balance });
});

app.use((err: any, req: any, res: any, next: any) => {
	console.error("Internal server errro: ", err);
	res.status(500).json({ message: err.message });
});

const peer = process.argv.includes("--peer");
const PORT = peer ? Math.floor(2000 + Math.random() * 1000) : 3000;

if (peer) {
	axios("http://localhost:3000/blockchain").then((res) => {
		const { chain } = res.data;
		blockchain
			.replaceChain({ chain })
			.then(() => console.log("Syncronized blockchain with the root node"))
			.catch((error) => console.error("Syncronization error: ", error.message));
	});
}

app.listen(PORT, () => {
	console.log(`Listening at PORT: ${PORT}`);
});
