import { ethers } from "ethers";

const CHAIN_ID = 97n;
const ABI = [
  "function quote(address token,uint256 amount) view returns (uint256 fee,uint256 total)",
  "function sendToken(address token,address recipient,uint256 amount,bytes32 transferId)"
];
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)"
];

const config = {
  contract: import.meta.env.VITE_TFUMELA_CONTRACT_ADDRESS || "",
  USDT: import.meta.env.VITE_USDT_CONTRACT_ADDRESS || "",
  USDC: import.meta.env.VITE_USDC_CONTRACT_ADDRESS || ""
};

let provider;
let signer;
let account;
let selectedQuote;

const $ = (id) => document.getElementById(id);
const setStatus = (message) => { $("status").textContent = message; };

function requireConfig() {
  for (const [key, value] of Object.entries(config)) {
    if (!ethers.isAddress(value) || value === ethers.ZeroAddress) {
      throw new Error("Missing or invalid blockchain configuration for " + key + ".");
    }
  }
}

function tokenAddress(symbol) {
  return config[symbol];
}

async function connect() {
  requireConfig();
  if (!window.ethereum) throw new Error("MetaMask is required for wallet signing.");
  provider = new ethers.BrowserProvider(window.ethereum);
  let network = await provider.getNetwork();
  if (network.chainId !== CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x61" }]
      });
    } catch (error) {
      if (error?.code !== 4902) throw error;
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x61",
          chainName: "BNB Smart Chain Testnet",
          nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
          rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org"],
          blockExplorerUrls: ["https://testnet.bscscan.com"]
        }]
      });
    }
    network = await provider.getNetwork();
  }
  if (network.chainId !== CHAIN_ID) throw new Error("Please switch MetaMask to BNB Smart Chain Testnet.");
  signer = await provider.getSigner();
  account = await signer.getAddress();
  $("wallet-status").textContent = "Connected: " + account;
  $("send").disabled = false;
  await refreshBalances();
}

async function refreshBalances() {
  const lines = [];
  for (const symbol of ["USDT", "USDC"]) {
    const token = new ethers.Contract(tokenAddress(symbol), ERC20_ABI, provider);
    const decimals = await token.decimals();
    const balance = await token.balanceOf(account);
    lines.push(symbol + ": " + ethers.formatUnits(balance, decimals));
  }
  $("balances").textContent = lines.join(" • ");
}

async function getQuote() {
  requireConfig();
  if (!signer) throw new Error("Connect MetaMask first.");
  const symbol = $("token").value;
  const recipient = $("recipient").value.trim();
  const amountText = $("amount").value.trim();
  if (!ethers.isAddress(recipient) || recipient === ethers.ZeroAddress) throw new Error("Enter a valid non-zero recipient address.");
  if (recipient.toLowerCase() === account.toLowerCase()) throw new Error("Recipient must be different from your wallet.");
  if (!amountText || Number(amountText) <= 0) throw new Error("Enter an amount greater than zero.");

  const token = new ethers.Contract(tokenAddress(symbol), ERC20_ABI, provider);
  const decimals = await token.decimals();
  const amount = ethers.parseUnits(amountText, decimals);
  const tfumela = new ethers.Contract(config.contract, ABI, provider);
  const result = await tfumela.quote(tokenAddress(symbol), amount);

  selectedQuote = { symbol, recipient, amount, fee: result[0], total: result[1], decimals };
  $("quote-result").textContent =
    "Recipient: " + recipient +
    " | Send amount: " + ethers.formatUnits(amount, decimals) + " " + symbol +
    " | Fee: " + ethers.formatUnits(result[0], decimals) + " " + symbol +
    " | Total: " + ethers.formatUnits(result[1], decimals) + " " + symbol;
}

async function send() {
  try {
    if (!selectedQuote) await getQuote();
    const { symbol, recipient, amount, fee, total } = selectedQuote;
    const token = new ethers.Contract(tokenAddress(symbol), ERC20_ABI, signer);
    const tfumela = new ethers.Contract(config.contract, ABI, signer);
    const balance = await token.balanceOf(account);
    if (balance < total) throw new Error("Insufficient token balance for amount plus fee.");

    setStatus("Checking allowance...");
    const allowance = await token.allowance(account, config.contract);
    if (allowance < total) {
      setStatus("Approve the exact transfer total in MetaMask...");
      await (await token.approve(config.contract, total)).wait();
    }

    const transferId = ethers.keccak256(
      ethers.toUtf8Bytes(account + ":" + symbol + ":" + recipient + ":" + amount.toString() + ":" + Date.now() + ":" + crypto.randomUUID())
    );
    setStatus("Confirm the transfer in MetaMask...");
    const tx = await tfumela.sendToken(tokenAddress(symbol), recipient, amount, transferId);
    setStatus("Submitted: " + tx.hash);
    await tx.wait();
    setStatus("Confirmed: " + tx.hash);
    selectedQuote = null;
    await refreshBalances();
  } catch (error) {
    setStatus(error?.shortMessage || error?.message || "Transaction failed.");
  }
}

$("connect").addEventListener("click", () => connect().catch((e) => setStatus(e.message)));
$("quote").addEventListener("click", () => getQuote().catch((e) => setStatus(e.message)));
$("send").addEventListener("click", send);
$("token").addEventListener("change", () => {
  selectedQuote = null;
  $("quote-result").textContent = "";
});
$("recipient").addEventListener("input", () => {
  selectedQuote = null;
  $("quote-result").textContent = "";
});
$("amount").addEventListener("input", () => {
  selectedQuote = null;
  $("quote-result").textContent = "";
});
