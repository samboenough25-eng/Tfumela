const express = require("express");

function createApp({ health = () => ({ status: "ok" }) } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_req, res) => res.status(200).json(health()));
  app.get("/ready", (_req, res) => res.status(200).json({ status: "ready" }));

  app.use((err, _req, res, _next) => {
    if (err?.type === "entity.too.large") return res.status(413).json({ error: "request_too_large" });
    return res.status(500).json({ error: "internal_error" });
  });

  return app;
}

module.exports = { createApp };
