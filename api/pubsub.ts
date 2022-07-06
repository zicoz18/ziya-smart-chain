import PubNub from "pubnub";
import dotenv from "dotenv";
import { v4 as uuidv4, v4 } from "uuid";
import Blockchain from "../blockchain";

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
};

class PubSub {
	public pubnub: PubNub;
	public blockchain: any;

	constructor({ blockchain }: any) {
		this.pubnub = new PubNub(credentials as any);
		this.blockchain = blockchain;
		this.subscribeToChannels();
		this.listen();
	}

	subscribeToChannels() {
		this.pubnub.subscribe({ channels: Object.values(CHANNELS_MAP) });
	}

	publish({ channel, message }: any) {
		this.pubnub.publish({ channel, message });
	}

	listen() {
		this.pubnub.addListener({
			message: (messageObject: any) => {
				const { message, channel } = messageObject;
				const parsedMessage = JSON.parse(message);

				console.log("Message recieved. Channel: ", channel);

				switch (channel) {
					case CHANNELS_MAP.BLOCK:
						console.log("block message: ", message);
						this.blockchain
							.addBlock({ block: parsedMessage })
							.then(() => console.log("New block accepted"))
							.catch((error: any) =>
								console.error("New block rejected: ", error.message)
							);
						break;
					default:
						return;
				}
			},
		});
	}

	broadcastBlock(block: any) {
		this.publish({
			channel: CHANNELS_MAP.BLOCK,
			message: JSON.stringify(block),
		});
	}
}

export default PubSub;
