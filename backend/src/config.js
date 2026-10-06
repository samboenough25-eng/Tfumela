const REQUIRED = [
  "BNB_RPC_URL",
  "TFUMELA_CONTRACT_ADDRESS",
  "USDT_CONTRACT_ADDRESS",
  "USDC_CONTRACT_ADDRESS",
  "TREASURY_ADDRESS"
];

function loadConfig(env = process.env) {
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing required configuration: ${missing.join(", ")}`);

  const chainId = Number(env.BNB_CHAIN_ID || 97);
  if (!Number.isInteger(chainId) || chainId <= 0) throw new Error("BNB_CHAIN_ID must be a positive integer");

  return Object.freeze({
    nodeEnv: env.NODE_ENV || "development",
    port: Number(env.PORT || 3000),
    chainId,
    rpcUrl: env.BNB_RPC_URL,
    contractAddress: env.TFUMELA_CONTRACT_ADDRESS,
    tokens: Object.freeze({ USDT: env.USDT_CONTRACT_ADDRESS, USDC: env.USDC_CONTRACT_ADDRESS }),
    treasuryAddress: env.TREASURY_ADDRESS,
    databaseUrl: env.DATABASE_URL || null
  });
}

module.exports = { loadConfig };
