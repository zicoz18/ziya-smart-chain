import axios from "axios";

const BASE_UREL = "http://localhost:3000";

const postTransact = async ({ to, value }: any) => {
	return (await axios.post(`${BASE_UREL}/account/transact`, { to, value }))
		.data;
};

const getMine = async () => {
	const getMineResponse = (await axios.get(`${BASE_UREL}/blockchain/mine`))
		.data;
	console.log("getMineResponse: ", getMineResponse);
	return getMineResponse;
};

const main = async () => {
	const postTransactResponse = await postTransact({});
	console.log(
		"postTransactResponse: (Create account transaction) ",
		postTransactResponse
	);

	const toAccountData = postTransactResponse.transaction.data.accountData;

	const postTransactResponse2 = await postTransact({
		to: toAccountData.address,
		value: 20,
	});
	console.log(
		"postTransactResponse2: (Standard Transaction) ",
		postTransactResponse2
	);

	setTimeout(() => {
		getMine();
	}, 1000);
};

main().then().catch(console.error);
