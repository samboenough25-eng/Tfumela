const { createApp } = require("./app");
const { loadConfig } = require("./config");

const config = loadConfig();
const app = createApp({ health: () => ({ status: "ok", service: "tfumela-api", chainId: config.chainId }) });

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Tfumela API listening on port ${config.port}`);
});
