import axios from "axios";

import { OPCODE_MAP } from "./interpreter";
const { STOP, ADD, PUSH, STORE, LOAD } = OPCODE_MAP;

const BASE_UREL = "http://localhost:3000";

const postTransact = async ({ code, to, value, gasLimit }: any) => {
	return (
		await axios.post(`${BASE_UREL}/account/transact`, {
			code,
			to,
			value,
			gasLimit,
		})
	).data;
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
	let smartContractAccountData: any;
	const postTransactResponse = await postTransact({});
	console.log(
		"postTransactResponse: (Create account transaction) ",
		postTransactResponse
	);

	let toAccountData = postTransactResponse.transaction.data.accountData;

	setTimeout(async () => {
		await getMine();

		const postTransactResponse2 = await postTransact({
			to: toAccountData.address,
			value: 20,
		});
		console.log(
			"postTransactResponse2: (Standard Transaction) ",
			postTransactResponse2
		);

		const key = "foo";
		const value = "bar";
		const code = [PUSH, value, PUSH, key, STORE, PUSH, key, LOAD, STOP];

		const postTransactResponse3 = await postTransact({
			code,
		});
		console.log(
			"postTransactResponse3: (Smart Contract) ",
			postTransactResponse3
		);

		smartContractAccountData =
			postTransactResponse3.transaction.data.accountData;

		setTimeout(async () => {
			await getMine();

			const postTransactResponse4 = await postTransact({
				to: smartContractAccountData.codeHash,
				value: 0,
				gasLimit: 100,
			});
			console.log(
				"postTransactResponse4: (to the smart contract) ",
				postTransactResponse4
			);
			setTimeout(async () => {
				await getMine();

				const getAccountBalanceRespone = await getAccountBalance({
					address: toAccountData.address,
				});
				const getAccountBalanceRespone2 = await getAccountBalance();
			}, 3000);
		}, 3000);
	}, 3000);
};

main().then().catch(console.error);
