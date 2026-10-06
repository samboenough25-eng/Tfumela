const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig, isAddress } = require("../src/config");

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
  assert.equal(c.port, 3000);
  assert.equal(c.tokens.USDT, base.USDT_CONTRACT_ADDRESS);
});

test("fails closed when blockchain configuration is incomplete", () => {
  assert.throws(() => loadConfig({ ...base, USDC_CONTRACT_ADDRESS: "" }), /USDC_CONTRACT_ADDRESS/);
});

test("rejects malformed or zero addresses", () => {
  assert.equal(isAddress(base.USDT_CONTRACT_ADDRESS), true);
  assert.equal(isAddress("not-an-address"), false);
  assert.throws(() => loadConfig({ ...base, TREASURY_ADDRESS: "0x0000000000000000000000000000000000000000" }), /TREASURY_ADDRESS/);
});

test("rejects non-testnet chain ids", () => {
  assert.throws(() => loadConfig({ ...base, BNB_CHAIN_ID: "56" }), /chain ID 97/);
});

test("rejects invalid ports and RPC URLs", () => {
  assert.throws(() => loadConfig({ ...base, PORT: "0" }), /PORT/);
  assert.throws(() => loadConfig({ ...base, BNB_RPC_URL: "ftp://example.invalid" }), /HTTP/);
});
