const express = require("express");

function createApp({
  health = async () => ({ status: "ok" }),
  readiness = async () => ({ status: "ready" }),
  blockchain = null
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", async (_req, res, next) => {
    try {
      return res.status(200).json(await health());
    } catch (error) {
      return next(error);
    }
  });

  app.get("/ready", async (_req, res, next) => {
    try {
      const result = await readiness();
      return res.status(result?.status === "ready" ? 200 : 503).json(result);
    } catch (error) {
      return next(error);
    }
  });

  if (blockchain) {
    app.get("/v1/network", async (_req, res, next) => {
      try {
        return res.status(200).json(await blockchain.health());
      } catch (error) {
        return next(error);
      }
    });

    app.get("/v1/quote", async (req, res, next) => {
      try {
        const symbol = String(req.query.token || "").toUpperCase();
        const amount = String(req.query.amount || "");
        if (!["USDT", "USDC"].includes(symbol)) return res.status(400).json({ error: "unsupported_token" });
        if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(amount) || Number(amount) <= 0) {
          return res.status(400).json({ error: "invalid_amount" });
        }
        return res.status(200).json(await blockchain.quote(symbol, amount));
      } catch (error) {
        return next(error);
      }
    });
  }

  app.use((err, _req, res, _next) => {
    if (err?.type === "entity.too.large") return res.status(413).json({ error: "request_too_large" });
    if (err?.code === "INVALID_ARGUMENT" || /unsupported|invalid|must be|enabled/i.test(err?.message || "")) {
      return res.status(400).json({ error: "invalid_request", message: err.message });
    }
    return res.status(500).json({ error: "internal_error" });
  });

  return app;
}

module.exports = { createApp };
