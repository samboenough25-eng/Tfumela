require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  paths: { sources: "./src", tests: "./test" },
  networks: {
    hardhat: {},
    bscTestnet: {
      url: process.env.BNB_TESTNET_RPC_URL || "",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    }
  }
};
