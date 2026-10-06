# Tfumela

WhatsApp-first peer-to-peer stablecoin money transfer product powered by BNB Smart Chain.

## V1 mission

Tfumela enables people to send **USDT or USDC** to other people on BNB Smart Chain. WhatsApp is the primary customer interaction channel, while a connected customer wallet authorizes blockchain transactions.

**V1 is a working testnet product first. KYC/AML provider integration is deliberately deferred to the production/compliance stage.**

## Core principles

- Stablecoins only: USDT and USDC.
- BNB is used only for network gas; it is not a customer transfer asset.
- Customer funds remain in the customer's wallet until the customer authorizes a transaction.
- WhatsApp never receives or controls customer private keys.
- The smart contract is the on-chain financial authority for supported transfers and fees.
- Tfumela uses transparent **Option B fees: 0.5 stablecoin fixed + 0.5% variable**, charged on top of the recipient amount.
- Contract fee configuration is bounded by hard protocol ceilings and is observable through events.
- Admin controls must never provide a hidden ability to move customer principal.
- Testnet before mainnet.
- A completely new Render PostgreSQL database will be used; no Liholiswano database is reused.
- Token/network addresses are configuration, never guessed or copied from unrelated projects.

## Current customer dApp

The repository now contains a real Vite wallet dApp under web/ with:

1. MetaMask connection.
2. BNB Smart Chain Testnet switching/setup.
3. USDT and USDC balance display.
4. On-chain fee quote using the deployed contract.
5. Exact allowance approval for amount + fee.
6. Customer-signed contract transfer.
7. Transaction confirmation feedback.

The dApp requires these build-time Render/static-site variables:

- VITE_TFUMELA_CONTRACT_ADDRESS
- VITE_USDT_CONTRACT_ADDRESS
- VITE_USDC_CONTRACT_ADDRESS

Do not populate these with guessed addresses. They must come from a successful BNB testnet deployment and independent verification.

## Economic model

Option B:

fee = fixedFee + floor(amount × 50 / 10,000)

Default fixed fee is **0.5 USDT/USDC** with six-decimal tokens.

Example:

- Recipient amount: 100 USDT
- Fee: 1 USDT
- Customer wallet total: 101 USDT
- Recipient receives: 100 USDT
- Treasury receives: 1 USDT

The contract and backend both treat the on-chain quote as authoritative. The backend arithmetic helper is for deterministic validation/tests and must not replace an on-chain quote.

## System boundary

Customer -> WhatsApp -> Tfumela API -> wallet authorization -> Tfumela contract -> BNB Smart Chain.

The backend prepares, records, monitors and reconciles. It does not hold customer private keys or sign customer transfers.

## SADC readiness

The architecture is configuration-driven for all 16 SADC countries. Country support is independent from blockchain network, token choice and legal authorization. A country may be PLANNED, TESTNET, PILOT, LIVE, RESTRICTED or DISABLED.

Technical readiness is not legal authorization. Production launch requires country-by-country regulatory/legal determination and any required compliance, licensing, consumer-protection, tax, data and local-partner controls.

## Build stages

1. Specification and economic model
2. Repository/infrastructure foundation
3. Smart contract implementation
4. Contract security and automated testing
5. Customer wallet dApp
6. Backend and dedicated PostgreSQL
7. Recipient/account security
8. WhatsApp adapter and Cloud API integration
9. Admin/operations dashboard
10. BNB testnet deployment
11. Full E2E and failure/recovery testing
12. Full security/economic/deployment audit
13. Production regulatory/compliance gate
14. Controlled mainnet launch

## Current status

**Engineering foundation: substantially built. Customer dApp: first working implementation built. Testnet deployment: NOT YET COMPLETE.**

The remaining critical gates are backend blockchain orchestration/reconciliation, dedicated Render PostgreSQL, WhatsApp adapter, verified BNB testnet deployment, full USDT/USDC E2E, failure/recovery testing, and final security/economic audit.

See:
- docs/TFUMELA_V1_SPECIFICATION.md
- docs/ROADMAP.md
- docs/SADC_REGIONAL_DESIGN.md
