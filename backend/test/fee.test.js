const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateFee, quote } = require("../src/fee");

test("Option B calculates 0.5 fixed + 0.5%", () => {
  assert.equal(calculateFee(100_000_000n, 500_000n, 50n), 1_000_000n);
  assert.equal(calculateFee(50_000_000n, 500_000n, 50n), 750_000n);
});

test("quote adds fee on top of recipient amount", () => {
  assert.deepEqual(quote(100_000_000n, 500_000n, 50n), {
    amount: 100_000_000n,
    fee: 1_000_000n,
    total: 101_000_000n
  });
});

test("fee ceiling is enforced", () => {
  assert.throws(() => calculateFee(10_000_000n, 500_000n, 1000n, 500_000n), /maximum/);
});

test("protocol fee rate cannot exceed 10%", () => {
  assert.throws(() => calculateFee(1n, 0n, 1001n), /ceiling/);
});
