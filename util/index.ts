import { keccak_256 } from "js-sha3";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

const sortCharacters = (data: any) => {
	return JSON.stringify(data).split("").sort().join("");
};

const keccakHash = (data: any) => {
	const hash = keccak_256.create();
	hash.update(sortCharacters(data));

	return hash.hex();
};

export { sortCharacters, keccakHash, ec };
