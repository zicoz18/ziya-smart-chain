import express from "express";
import axios from "axios";

import Blockchain from "../blockchain";
import Block from "../blockchain/block";
import PubSub from "./pubsub";

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

app.get("/blockchain", (req, res, next) => {
	const { chain } = blockchain;
	res.json({ chain });
});

app.get("/blockchain/mine", (req, res, next) => {
	const lastBlock = blockchain.chain[blockchain.chain.length - 1];
	const block = Block.mineBlock({ lastBlock });

	blockchain
		.addBlock({ block })
		.then(() => {
			pubsub.broadcastBlock(block);
			res.json({ block });
		})
		.catch(next);
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
