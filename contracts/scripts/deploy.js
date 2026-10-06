const { ethers } = require("hardhat");

const ZERO = ethers.ZeroAddress;
const REQUIRED_CHAIN_ID = 97;
const FEE_BPS = 50;
const FIXED_FEE_UNITS = 500_000n; // 0.5 token with 6 decimals (USDT/USDC)

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required deployment environment variable: ${name}`);
  return value;
}

function address(name) {
  const value = required(name);
  if (!ethers.isAddress(value) || value === ZERO) throw new Error(`${name} must be a non-zero EVM address`);
  return ethers.getAddress(value);
}

async function main() {
  const network = await ethers.provider.getNetwork();
  if (Number(network.chainId) !== REQUIRED_CHAIN_ID) {
    throw new Error(`Refusing deployment: expected BNB testnet chain ID 97, got ${network.chainId}`);
  }

  const treasury = address("TREASURY_ADDRESS");
  const usdt = address("USDT_CONTRACT_ADDRESS");
  const usdc = address("USDC_CONTRACT_ADDRESS");
  if (usdt === usdc) throw new Error("USDT_CONTRACT_ADDRESS and USDC_CONTRACT_ADDRESS must differ");

  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("No deployer signer available");

  const TokenReader = [
    "function decimals() view returns (uint8)"
  ];
  for (const [symbol, token] of [["USDT", usdt], ["USDC", usdc]]) {
    const reader = new ethers.Contract(token, TokenReader, ethers.provider);
    const decimals = Number(await reader.decimals());
    if (decimals !== 6) throw new Error(`${symbol} at ${token} reports ${decimals} decimals; expected 6`);
  }

  const Factory = await ethers.getContractFactory("TfumelaTransfer");
  const tfumela = await Factory.deploy(deployer.address, treasury);
  await tfumela.waitForDeployment();
  const contractAddress = await tfumela.getAddress();

  const maxFee = BigInt(process.env.TFUMELA_MAX_FEE_UNITS || "100000000");
  if (maxFee < FIXED_FEE_UNITS) throw new Error("TFUMELA_MAX_FEE_UNITS must be >= 500000");

  for (const token of [usdt, usdc]) {
    await (await tfumela.setSupportedToken(token, true)).wait();
    await (await tfumela.setFeeConfig(token, true, FEE_BPS, FIXED_FEE_UNITS, maxFee)).wait();
  }

  console.log(JSON.stringify({
    network: "BNB Smart Chain Testnet",
    chainId: Number(network.chainId),
    contract: contractAddress,
    treasury,
    tokens: { USDT: usdt, USDC: usdc },
    fee: { fixedUnits: FIXED_FEE_UNITS.toString(), feeBps: FEE_BPS, maxFeeUnits: maxFee.toString() }
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
