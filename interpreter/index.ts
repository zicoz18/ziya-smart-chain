const STOP = "STOP";
const ADD = "ADD";
const PUSH = "PUSH";

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
						const a = this.state.stack.pop() as number; // Wrong, fix this. Should check if stack is empty
						const b = this.state.stack.pop() as number;
						this.state.stack.push(a + b);
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

const code = [PUSH, 2, PUSH, 3, ADD, STOP];

const interpreter = new Interpreter();
const val = interpreter.runCode(code);
console.log("val => ", val);
