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

const getAccountBalance = async ({ address }: any = {}) => {
	const getAccountBalanceResponse = (
		address
			? await axios.get(`${BASE_UREL}/account/balance?address=${address}`)
			: await axios.get(`${BASE_UREL}/account/balance`)
	).data;
	console.log("getAccountBalanceResponse: ", getAccountBalanceResponse);
	return getAccountBalanceResponse;
};

const main = async () => {
	const postTransactResponse = await postTransact({});
	console.log(
		"postTransactResponse: (Create account transaction) ",
		postTransactResponse
	);

	let toAccountData = postTransactResponse.transaction.data.accountData;

	setTimeout(async () => {
		await getMine();

		// const toAccountData = postTransactResponse.transaction.data.accountData;

		const postTransactResponse2 = await postTransact({
			to: toAccountData.address,
			value: 20,
		});
		console.log(
			"postTransactResponse2: (Standard Transaction) ",
			postTransactResponse2
		);

		setTimeout(async () => {
			await getMine();

			const getAccountBalanceRespone = await getAccountBalance({
				address: toAccountData.address,
			});
			const getAccountBalanceRespone2 = await getAccountBalance();
		}, 2000);
	}, 2000);
};

main().then().catch(console.error);
