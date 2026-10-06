const { ethers } = require("ethers");

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

const TFUMELA_ABI = [
  "function quote(address token,uint256 amount) view returns (uint256 fee,uint256 total)",
  "function supportedToken(address token) view returns (bool)",
  "function feeConfig(address token) view returns (bool enabled,uint16 feeBps,uint256 fixedFee,uint256 maxFee)",
  "function treasury() view returns (address)",
  "function paused() view returns (bool)"
];

function createBlockchain(config) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
  const tfumela = new ethers.Contract(config.contractAddress, TFUMELA_ABI, provider);

  async function quote(symbol, amountText) {
    const address = config.tokens[symbol];
    if (!address) throw new Error("Unsupported token symbol.");
    const token = new ethers.Contract(address, ERC20_ABI, provider);
    const decimals = Number(await token.decimals());
    if (decimals !== 6) throw new Error(symbol + " token must use 6 decimals.");
    const amount = ethers.parseUnits(String(amountText), decimals);
    if (amount <= 0n) throw new Error("Amount must be greater than zero.");
    if (!(await tfumela.supportedToken(address))) throw new Error(symbol + " is not enabled by the contract.");
    const result = await tfumela.quote(address, amount);
    const feeConfig = await tfumela.feeConfig(address);
    return Object.freeze({
      symbol,
      tokenAddress: address,
      decimals,
      amount: amount.toString(),
      fee: result[0].toString(),
      total: result[1].toString(),
      feeBps: Number(feeConfig.feeBps),
      fixedFee: feeConfig.fixedFee.toString(),
      maxFee: feeConfig.maxFee.toString(),
      treasury: await tfumela.treasury(),
      paused: await tfumela.paused()
    });
  }

  async function health() {
    const network = await provider.getNetwork();
    const block = await provider.getBlockNumber();
    return {
      chainId: Number(network.chainId),
      blockNumber: block,
      contractAddress: config.contractAddress,
      paused: await tfumela.paused()
    };
  }

  return Object.freeze({ quote, health, provider });
}

module.exports = { createBlockchain };
