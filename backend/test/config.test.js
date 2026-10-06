const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../src/config");

const base = {
  BNB_RPC_URL: "https://example.invalid",
  TFUMELA_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000001",
  USDT_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000002",
  USDC_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000003",
  TREASURY_ADDRESS: "0x0000000000000000000000000000000000000004"
};

test("loads BNB testnet defaults safely", () => {
  const c = loadConfig(base);
  assert.equal(c.chainId, 97);
  assert.equal(c.tokens.USDT, base.USDT_CONTRACT_ADDRESS);
});

test("fails closed when blockchain configuration is incomplete", () => {
  assert.throws(() => loadConfig({ ...base, USDC_CONTRACT_ADDRESS: "" }), /USDC_CONTRACT_ADDRESS/);
});
