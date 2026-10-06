# Tfumela

WhatsApp-first peer-to-peer stablecoin money transfer product powered by BNB Smart Chain.

## V1 mission

Tfumela enables people to send **USDT or USDC** to other people on BNB Smart Chain. The customer uses WhatsApp to initiate and track transfers, while a connected customer wallet authorizes blockchain transactions.

**V1 is a working testnet product first. KYC/AML provider integration is deliberately deferred to a later production/compliance stage.**

## Core principles

- Stablecoins only: USDT and USDC.
- BNB is used only for network gas where required; it is not a customer transfer asset.
- Customer funds remain in the customer's wallet until the customer authorizes a transaction.
- WhatsApp never receives or controls customer private keys.
- The smart contract is the on-chain financial authority for supported transfers and fees.
- Tfumela charges a transparent, configurable transfer fee.
- Admin controls must never provide a hidden ability to move customer principal.
- Testnet before mainnet.
- A completely new Render PostgreSQL database will be used; no Liholiswano database is reused.
- Token/network addresses are configuration, never guessed or hard-coded from unrelated projects.

## Target V1 flow

1. Customer registers a Tfumela account.
2. Customer links a wallet.
3. Customer registers or selects a recipient.
4. Customer chooses USDT or USDC and enters the amount.
5. Tfumela calculates and displays the fee and total.
6. Customer confirms in WhatsApp.
7. Tfumela opens/prepares the wallet authorization flow.
8. Customer signs the transaction with the wallet.
9. The smart contract transfers the requested stablecoin and collects the Tfumela fee.
10. Backend monitors the blockchain and records the result.
11. WhatsApp reports pending, confirmed, or failed status.

## Planned system

- **Customer interface:** WhatsApp + lightweight web wallet/signing dApp.
- **Backend:** TypeScript/Node.js API.
- **Database:** dedicated Render PostgreSQL.
- **Blockchain:** BNB Smart Chain.
- **Smart contract:** Solidity, using established audited libraries where appropriate.
- **Testing:** unit, integration, security/property, and full E2E tests.
- **Deployment:** GitHub Actions + Render + BNB testnet.
- **Admin:** operations, fees, limits, system health, reconciliation; never customer principal custody.

## Important product boundary

The first release is intentionally not a fiat remittance/off-ramp product. It transfers supported stablecoins on-chain. Fiat on/off-ramp partnerships, expanded compliance, and additional assets are future work.

## Build stages

1. Product/economic/technical specification
2. Repository and infrastructure foundation
3. Smart contract implementation
4. Contract security and automated testing
5. Customer web signing dApp
6. Backend and PostgreSQL
7. Recipient/account security
8. WhatsApp adapter and Cloud API integration
9. Admin/operations dashboard
10. BNB testnet deployment
11. Full E2E and failure/recovery testing
12. Security/economic audit and production gate
13. KYC/AML and regulatory production layer
14. Mainnet controlled launch

## Status

**Stage 1 — specification and foundation: IN PROGRESS**

See:
- [docs/TFUMELA_V1_SPECIFICATION.md](docs/TFUMELA_V1_SPECIFICATION.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
