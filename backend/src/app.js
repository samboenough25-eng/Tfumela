const express = require("express");

function createApp({ health = () => ({ status: "ok" }), readiness = async () => ({ status: "ready" }) } = {}) {
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
      const statusCode = result?.status === "ready" ? 200 : 503;
      return res.status(statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  });

  app.use((err, _req, res, _next) => {
    if (err?.type === "entity.too.large") return res.status(413).json({ error: "request_too_large" });
    return res.status(500).json({ error: "internal_error" });
  });

  return app;
}

module.exports = { createApp };
