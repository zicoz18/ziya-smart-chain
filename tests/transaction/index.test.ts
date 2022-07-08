import Transaction from "../../transaction";
import Account from "../../account";

describe("Transaction", () => {
	let account: any, standardTransaction: any, createAccountTransaction: any;

	beforeEach(() => {
		account = new Account();
		standardTransaction = Transaction.createTransaction({
			account,
			to: "foo-recipient",
			value: 50,
		});
		createAccountTransaction = Transaction.createTransaction({
			account,
		});
	});

	describe("validateStandardTransaction()", () => {
		it("validates a valid transaction", () => {
			expect(
				Transaction.validateStandardTransaction({
					transaction: standardTransaction,
				})
			).resolves;
		});
		it("does no validate a malformed transaction", () => {
			standardTransaction.to = "different-recipient;";
			expect(
				Transaction.validateStandardTransaction({
					transaction: standardTransaction,
				})
			).rejects.toMatchObject({ message: /Transaction/ });
		});
	});

	describe("validateCreateAccountTransaction()", () => {
		it("validates a create account transaction", () => {
			expect(
				Transaction.validateCreteAccountTransaction({
					transaction: createAccountTransaction,
				})
			).resolves;
		});
		it("does not validate a non create account transaction", () => {
			expect(
				Transaction.validateCreteAccountTransaction({
					transaction: standardTransaction,
				})
			).rejects.toMatchObject({ message: /incorrect/ });
		});
	});
});
