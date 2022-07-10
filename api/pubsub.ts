import PubNub from "pubnub";
import dotenv from "dotenv";
import Transaction from "../transaction";
import Blockchain from "../blockchain";
import TransactionQueue from "../transaction/transaction-queue";
import Block from "../blockchain/block";

dotenv.config();

const credentials = {
	publishKey: process.env.PUBLISH_KEY,
	subscribeKey: process.env.SUBSCRIBE_KEY,
	secretKey: process.env.SECRET_KEY,
	uuid: process.env.UUID,
};

const CHANNELS_MAP = {
	TEST: "TEST",
	BLOCK: "BLOCK",
	TRANSACTION: "TRANSACTION",
};

class PubSub {
	public pubnub: PubNub;
	public blockchain: Blockchain;
	public transactionQueue: TransactionQueue;

	constructor({
		blockchain,
		transactionQueue,
	}: {
		blockchain: Blockchain;
		transactionQueue: TransactionQueue;
	}) {
		this.pubnub = new PubNub(credentials as any);
		this.blockchain = blockchain;
		this.transactionQueue = transactionQueue;
		this.subscribeToChannels();
		this.listen();
	}

	subscribeToChannels(): void {
		this.pubnub.subscribe({ channels: Object.values(CHANNELS_MAP) });
	}

	publish({ channel, message }: { channel: string; message: string }): void {
		this.pubnub.publish({ channel, message });
	}

	listen(): void {
		this.pubnub.addListener({
			message: (messageObject: any) => {
				const { message, channel } = messageObject;
				const parsedMessage = JSON.parse(message);

				console.log("Message recieved. Channel: ", channel);

				switch (channel) {
					case CHANNELS_MAP.BLOCK:
						console.log("block message: ", message);
						this.blockchain
							.addBlock({
								block: parsedMessage,
								transactionQueue: this.transactionQueue,
							})
							.then(() => console.log("New block accepted", parsedMessage))
							.catch((error: any) =>
								console.error("New block rejected: ", error.message)
							);
						break;
					case CHANNELS_MAP.TRANSACTION:
						console.log(`Recieved transaction: ${parsedMessage.id}`);
						this.transactionQueue.add(new Transaction(parsedMessage));
						break;
					default:
						return;
				}
			},
		});
	}

	broadcastBlock(block: Block): void {
		this.publish({
			channel: CHANNELS_MAP.BLOCK,
			message: JSON.stringify(block),
		});
	}

	broadcastTransaction(transaction: Transaction): void {
		this.publish({
			channel: CHANNELS_MAP.TRANSACTION,
			message: JSON.stringify(transaction),
		});
	}
}

export default PubSub;
