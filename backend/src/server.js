const { createApp } = require("./app");
const { loadConfig } = require("./config");
const { createBlockchain } = require("./blockchain");

const config = loadConfig();
const blockchain = createBlockchain(config);

const app = createApp({
  blockchain,
  health: () => ({
    status: "ok",
    service: "tfumela-api",
    chainId: config.chainId
  }),
  readiness: async () => {
    try {
      const chain = await blockchain.health();
      return {
        status: config.databaseUrl ? "ready" : "degraded",
        service: "tfumela-api",
        chainId: config.chainId,
        databaseConfigured: Boolean(config.databaseUrl),
        blockchain: chain
      };
    } catch (error) {
      return {
        status: "degraded",
        service: "tfumela-api",
        chainId: config.chainId,
        databaseConfigured: Boolean(config.databaseUrl),
        blockchain: { status: "unavailable" }
      };
    }
  }
});

app.listen(config.port, "0.0.0.0", () => {
  console.log("Tfumela API listening on port " + config.port);
});
