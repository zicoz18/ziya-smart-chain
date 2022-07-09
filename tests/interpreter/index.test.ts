import Interpreter from "../../interpreter";
import Trie from "../../store/trie";

const {
	STOP,
	ADD,
	SUB,
	MUL,
	DIV,
	PUSH,
	LT,
	GT,
	EQ,
	AND,
	OR,
	JUMP,
	JUMPI,
	STORE,
	LOAD,
} = Interpreter.OPCODE_MAP;

describe("Interpreter", () => {
	describe("runCode()", () => {
		describe("and the code includes ADD", () => {
			it("adds two values", () => {
				const code = [PUSH, 2, PUSH, 3, ADD, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(5);
			});
		});

		describe("and the code includes SUB", () => {
			it("subtracts one value from another", () => {
				const code = [PUSH, 2, PUSH, 3, SUB, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(1);
			});
		});

		describe("and the code includes MUL", () => {
			it("products two values", () => {
				const code = [PUSH, 2, PUSH, 3, MUL, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(6);
			});
		});

		describe("and the code includes DIV", () => {
			it("divides one value from another", () => {
				const code = [PUSH, 2, PUSH, 3, DIV, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(1.5);
			});
		});

		describe("and the code includes LT", () => {
			it("checks if one value is less than another", () => {
				const code = [PUSH, 2, PUSH, 3, LT, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(0);
			});
		});

		describe("and the code includes GT", () => {
			it("checks if one value is greater than another", () => {
				const code = [PUSH, 2, PUSH, 3, GT, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(1);
			});
		});

		describe("and the code includes EQ", () => {
			it("checks if one value equals to another", () => {
				const code = [PUSH, 2, PUSH, 3, EQ, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(0);
			});
		});

		describe("and the code includes AND", () => {
			it("ands two conditions", () => {
				const code = [PUSH, 1, PUSH, 0, AND, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(0);
			});
		});

		describe("and the code includes OR", () => {
			it("ors two conditions", () => {
				const code = [PUSH, 1, PUSH, 0, OR, STOP];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual(1);
			});
		});

		describe("and the code includes JUMP", () => {
			it("jumps to a destination two conditions", () => {
				const code = [
					PUSH,
					6,
					JUMP,
					PUSH,
					0,
					JUMP,
					PUSH,
					"jump successful",
					STOP,
				];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual("jump successful");
			});
		});

		describe("and the code includes JUMPI", () => {
			it("jumps to a destination two conditions", () => {
				const code = [
					PUSH,
					8,
					PUSH,
					1,
					JUMPI,
					PUSH,
					0,
					JUMP,
					PUSH,
					"jump successful",
					STOP,
				];
				const result = new Interpreter().runCode(code)?.result;
				expect(result).toEqual("jump successful");
			});
		});

		describe("and the code includes STORE", () => {
			it("stores a value", () => {
				const interpreter = new Interpreter({
					storageTrie: new Trie(),
				});
				const key = "foo";
				const value = "bar";

				interpreter.runCode([PUSH, value, PUSH, key, STORE, STOP]);

				expect(interpreter.storageTrie.get({ key })).toEqual(value);
			});
		});

		describe("and the code includes LOAD", () => {
			it("loads a stored value", () => {
				const interpreter = new Interpreter({
					storageTrie: new Trie(),
				});
				const key = "foo";
				const value = "bar";

				expect(
					interpreter.runCode([
						PUSH,
						value,
						PUSH,
						key,
						STORE,
						PUSH,
						key,
						LOAD,
						STOP,
					])?.result
				).toEqual(value);
			});
		});

		describe("and the code includes an invalid JUMP destination", () => {
			it("throws and error", () => {
				const code = [
					PUSH,
					99,
					JUMP,
					PUSH,
					0,
					JUMP,
					PUSH,
					"jump successful",
					STOP,
				];
				expect(() => new Interpreter().runCode(code)).toThrowError(
					"Invalid destination: 99"
				);
			});
		});

		describe("and the code includes an invalid PUSH value", () => {
			it("throws and error", () => {
				const code = [PUSH, 0, PUSH];
				expect(() => new Interpreter().runCode(code)).toThrowError(
					"The 'PUSH' instruction cannot be last"
				);
			});
		});

		describe("and the code includes an infinite loop", () => {
			it("throws and error", () => {
				const code = [PUSH, 0, JUMP];
				expect(() => new Interpreter().runCode(code)).toThrowError(
					"Check for an infinite loop. Execution limit of 10000 exceeded"
				);
			});
		});
	});
});
