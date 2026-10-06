const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../src/app");

async function request(app, path) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: "127.0.0.1", port, path }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", async () => {
        await new Promise((done) => server.close(done));
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });
    req.on("error", async (error) => {
      await new Promise((done) => server.close(done));
      reject(error);
    });
  });
}

test("quote endpoint validates and returns the on-chain quote service result", async () => {
  const app = createApp({
    blockchain: {
      quote: async (token, amount) => ({ symbol: token, amount }),
      health: async () => ({ chainId: 97, blockNumber: 1 })
    }
  });
  const result = await request(app, "/v1/quote?token=USDT&amount=100.25");
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { symbol: "USDT", amount: "100.25" });
});

test("quote endpoint rejects unsupported tokens", async () => {
  const app = createApp({ blockchain: { quote: async () => ({}), health: async () => ({}) } });
  const result = await request(app, "/v1/quote?token=DAI&amount=1");
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "unsupported_token");
});
