# Tfumela engineering audit — 2026-10-06

## Audit scope

Reviewed the current GitHub repository across contract, deployment script, backend, database foundation, customer dApp, CI, documentation and SADC configuration.

## Fixed in this audit

### Smart contract
- Added bytecode existence validation before accepting a token.
- Kept six-decimal token validation.
- Added a hard absolute fee ceiling in addition to the 10% rate ceiling.
- Expanded adversarial coverage for wrong decimals, non-contract addresses, fee caps, pause, replay, atomic failure, allowance failure and treasury ownership.
- Removed the duplicate test-only ERC20 mock.

### Deployment
- Deployment now refuses token addresses with no bytecode.
- Deployment remains locked to BNB Smart Chain Testnet chain ID 97.
- Deployment validates non-zero and distinct token/treasury addresses.
- Option B defaults remain 0.5 stablecoin + 0.5%.

### Backend
- Hardened address, port, RPC and chain-ID configuration validation.
- Added truthful degraded readiness behavior.
- Added read-only BNB blockchain service.
- Added on-chain quote endpoint.
- Added blockchain network health endpoint.
- Added API tests for quote validation and readiness/health.
- Added ethers dependency for blockchain reads.

### Customer dApp
- Replaced the empty web placeholder with a real Vite dApp.
- Added MetaMask connection.
- Added BNB testnet switch/add flow.
- Added USDT/USDC balance display.
- Added direct on-chain quote.
- Added exact allowance approval for amount + fee.
- Added customer-signed contract transfer and confirmation.
- Invalidates stale quotes when recipient, amount or token changes.
- Added accessible safety messaging.
- Added web CI build gate.

### Documentation
- Synchronized README and roadmap with actual engineering state.
- Documented the dApp's current limitations.
- Removed legacy Liholiswano/Stellar references from the Tfumela code/documentation search.

## Remaining blockers

1. **Backend transfer orchestration is not complete.**
   Persistent transfer creation, idempotency enforcement at the API boundary, wallet ownership challenge, status state machine, receipt indexing and reconciliation still need implementation.

2. **PostgreSQL migration execution is not complete.**
   The schema and hardening migration exist, but an application migration runner and production database initialization still need to be wired.

3. **Dedicated Render PostgreSQL is not yet provisioned.**
   It must be a new Tfumela database and must not reuse any Liholiswano resource.

4. **WhatsApp adapter is not implemented.**
   The provider-neutral interface, local simulator, webhook authenticity and secure wallet handoff remain.

5. **BNB testnet contract deployment is not complete.**
   Real verified BNB testnet USDT and USDC addresses must be supplied. No address is guessed or invented.

6. **Full E2E is not complete.**
   Both USDT and USDC flows, failures, duplicate requests, restart recovery and reconciliation need testnet evidence.

7. **Production controls are not complete.**
   Legal/regulatory determination, KYC/AML if required, monitoring, incident response, support and production wallet/gas strategy remain mandatory gates.

## Current completion assessment

The project has moved beyond a placeholder foundation: the contract, backend read-only chain integration and customer signing dApp now exist.

It is **not V1-complete and is not ready for public money movement** until the remaining blockers above are closed and the complete testnet E2E/security gates pass.

## Deployment rule

Never configure a testnet or Render deployment with guessed stablecoin addresses, private keys committed to Git, or a Liholiswano database connection.
