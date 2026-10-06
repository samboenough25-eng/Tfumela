const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../src/app");

async function request(app, path, method = "GET", body = null) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "127.0.0.1", port, path, method,
      headers: body ? { "content-type": "application/json" } : {}
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", async () => {
        await new Promise((r) => server.close(r));
        resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
      });
    });
    req.on("error", async (err) => { await new Promise((r) => server.close(r)); reject(err); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test("health endpoint returns service health", async () => {
  const result = await request(createApp({ health: () => ({ status: "ok", service: "test" }) }), "/health");
  assert.equal(result.status, 200);
  assert.equal(result.body.service, "test");
});

test("readiness returns 503 when dependency is not ready", async () => {
  const result = await request(createApp({ readiness: async () => ({ status: "degraded" }) }), "/ready");
  assert.equal(result.status, 503);
});

test("oversized JSON requests are rejected", async () => {
  const result = await request(createApp(), "/health", "POST", { value: "x".repeat(40000) });
  assert.equal(result.status, 413);
});
