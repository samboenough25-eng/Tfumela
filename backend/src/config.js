const REQUIRED = [
  "BNB_RPC_URL",
  "TFUMELA_CONTRACT_ADDRESS",
  "USDT_CONTRACT_ADDRESS",
  "USDC_CONTRACT_ADDRESS",
  "TREASURY_ADDRESS"
];

const ADDRESS_KEYS = [
  "TFUMELA_CONTRACT_ADDRESS",
  "USDT_CONTRACT_ADDRESS",
  "USDC_CONTRACT_ADDRESS",
  "TREASURY_ADDRESS"
];

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || "");
}

function loadConfig(env = process.env) {
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing required configuration: ${missing.join(", ")}`);

  for (const key of ADDRESS_KEYS) {
    if (!isAddress(env[key]) || /^0x0{40}$/i.test(env[key])) {
      throw new Error(`${key} must be a non-zero EVM address`);
    }
  }

  const chainId = Number(env.BNB_CHAIN_ID || 97);
  if (!Number.isInteger(chainId) || chainId !== 97) {
    throw new Error("BNB_CHAIN_ID must be BNB Smart Chain Testnet chain ID 97 for V1");
  }

  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be 1-65535");

  if (!/^https?:\/\//i.test(env.BNB_RPC_URL)) throw new Error("BNB_RPC_URL must be an HTTP(S) URL");

  if (env.DATABASE_URL && !/^postgres(?:ql)?:\/\//i.test(env.DATABASE_URL)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }

  return Object.freeze({
    nodeEnv: env.NODE_ENV || "development",
    port,
    chainId,
    rpcUrl: env.BNB_RPC_URL,
    contractAddress: env.TFUMELA_CONTRACT_ADDRESS,
    tokens: Object.freeze({
      USDT: env.USDT_CONTRACT_ADDRESS,
      USDC: env.USDC_CONTRACT_ADDRESS
    }),
    treasuryAddress: env.TREASURY_ADDRESS,
    databaseUrl: env.DATABASE_URL || null
  });
}

module.exports = { loadConfig, isAddress };
