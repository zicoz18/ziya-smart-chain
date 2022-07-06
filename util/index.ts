import { keccak_256 } from "js-sha3";

const sortCharacters = (data: any) => {
	return JSON.stringify(data).split("").sort().join("");
};

const keccakHash = (data: any) => {
	const hash = keccak_256.create();
	hash.update(sortCharacters(data));

	return hash.hex();
};

export { sortCharacters, keccakHash };
