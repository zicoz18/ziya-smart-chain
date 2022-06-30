const STOP = "STOP";
const ADD = "ADD";
const SUB = "SUB";
const MUL = "MUL";
const DIV = "DIV";
const PUSH = "PUSH";
const LT = "LT";
const GT = "GT";
const EQ = "EQ";
const AND = "AND";
const OR = "OR";

type Code = string | number;

interface IState {
	programCounter: number;
	stack: number[];
	code: Code[];
}

class Interpreter {
	private state: IState;

	constructor() {
		this.state = {
			programCounter: 0,
			stack: [],
			code: [],
		};
	}

	runCode(code: Code[]) {
		this.state.code = code;

		while (this.state.programCounter < this.state.code.length) {
			const opCode = this.state.code[this.state.programCounter];

			try {
				switch (opCode) {
					case STOP:
						throw new Error("Execution complete");
					case PUSH:
						this.state.programCounter++;
						const value = this.state.code[this.state.programCounter] as number;
						this.state.stack.push(value);
						break;
					case ADD:
					case SUB:
					case MUL:
					case DIV:
					case LT:
					case GT:
					case EQ:
					case AND:
					case OR:
						const a = this.state.stack.pop() as number; // Wrong, fix this. Should check if stack is empty
						const b = this.state.stack.pop() as number;

						let result;

						if (opCode === ADD) result = a + b;
						if (opCode === SUB) result = a - b;
						if (opCode === MUL) result = a * b;
						if (opCode === DIV) result = a / b;
						if (opCode === LT) result = a < b ? 1 : 0;
						if (opCode === GT) result = a > b ? 1 : 0;
						if (opCode === EQ) result = a === b ? 1 : 0;
						if (opCode === AND) result = a && b;
						if (opCode === OR) result = a || b;

						this.state.stack.push(result as number);
						break;
					default:
						break;
				}
			} catch (err) {
				return this.state.stack[this.state.stack.length - 1];
			}

			this.state.programCounter++;
		}
	}
}

let code;
let result;

code = [PUSH, 2, PUSH, 3, ADD, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 3 ADD 2 => ", result);

code = [PUSH, 2, PUSH, 3, SUB, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 3 SUB 2 => ", result);

code = [PUSH, 2, PUSH, 3, MUL, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 3 MUL 2 => ", result);

code = [PUSH, 2, PUSH, 3, DIV, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 3 DIV 2 => ", result);

code = [PUSH, 2, PUSH, 3, LT, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 3 LT 2 => ", result);

code = [PUSH, 2, PUSH, 3, GT, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 3 GT 2 => ", result);

code = [PUSH, 2, PUSH, 2, EQ, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 2 EQ 2 => ", result);

code = [PUSH, 1, PUSH, 0, AND, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 0 AND 1 => ", result);

code = [PUSH, 1, PUSH, 0, OR, STOP];
result = new Interpreter().runCode(code);
console.log("Result of 0 OR 1 => ", result);
