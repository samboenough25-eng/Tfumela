# Tfumela customer wallet dApp

This is the customer-controlled signing interface for Tfumela.

## What it does

- connects to MetaMask;
- switches/adds BNB Smart Chain Testnet when necessary;
- reads USDT and USDC balances;
- obtains the fee quote directly from the Tfumela contract;
- approves only the exact amount + fee;
- asks the customer to sign the transfer;
- waits for blockchain confirmation.

The browser never receives or stores a private key.

## Required build variables

Set these in the Vite/Render build environment after the BNB testnet deployment is verified:

- VITE_TFUMELA_CONTRACT_ADDRESS
- VITE_USDT_CONTRACT_ADDRESS
- VITE_USDC_CONTRACT_ADDRESS

These values must be real BNB Smart Chain Testnet addresses. Never copy mainnet addresses into a testnet deployment.

## Local development

From this directory:

    npm install
    npm run dev

The app expects MetaMask and BNB Smart Chain Testnet. A wallet needs tBNB for gas and the selected test stablecoin for transfers.

## Important current limitation

The dApp currently proves the direct wallet-to-contract transfer path. It does not yet persist transfer records to the Tfumela API, perform wallet ownership challenge/verification, or display backend transaction history. Those are required before V1 can be called complete.
