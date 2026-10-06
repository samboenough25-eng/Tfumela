# Tfumela Build Roadmap

## Stage 1 — Specification and economic model
**Status: COMPLETE for V1 engineering scope**

- Product scope
- USDT/USDC-only policy
- Non-custodial wallet model
- Option B fee model
- Transfer lifecycle
- Security boundaries
- New Render PostgreSQL requirement
- SADC configuration model
- KYC deferred to production/compliance gate

## Stage 2 — Repository and development foundation
**Status: COMPLETE / HARDENING CONTINUES**

- Contract workspace
- Node backend foundation
- Vite customer dApp
- Environment templates
- Separate CI workflows
- Automated contract/backend/web test/build gates

## Stage 3 — Smart contract
**Status: IMPLEMENTED — SECURITY TESTING IN PROGRESS**

- USDT/USDC allow-list
- Six-decimal token verification
- Transfer function
- Option B fee calculation
- Treasury
- bounded fee rate/fixed fee/max fee
- replay protection
- pause
- events
- ownership/access control
- atomic failure behavior
- expanded adversarial tests

## Stage 4 — Contract verification
**Status: IN PROGRESS**

- unit tests
- adversarial tests
- token-contract validation
- deployment-script validation
- gas/security review
- independent testnet deployment and verification still required

## Stage 5 — Customer wallet dApp
**Status: FIRST WORKING IMPLEMENTATION COMPLETE — INTEGRATION HARDENING REQUIRED**

Implemented:
- MetaMask connection
- BNB testnet switching/setup
- USDT/USDC balances
- on-chain quote
- exact approval
- customer-signed transfer
- confirmation feedback

Still required:
- backend transfer creation/idempotency
- wallet ownership proof
- persistent history
- backend status reconciliation
- production-grade error UX

## Stage 6 — Backend + dedicated Render PostgreSQL
**Status: FOUNDATION IN PROGRESS**

Implemented:
- API health/readiness foundation
- hardened configuration validation
- Option B fee arithmetic helper
- initial database schema
- hardening migration fields
- SADC country configuration

Still required:
- database migration execution service
- authentication/session security
- wallet challenge/ownership verification
- recipient management
- transfer orchestration
- RPC provider integration
- blockchain event indexing
- finality/reorg handling
- reconciliation worker
- persistent transfer history

## Stage 7 — WhatsApp
**Status: NOT STARTED**

- provider-neutral adapter
- local simulator
- webhook authenticity/idempotency
- customer commands/conversation
- secure signing handoff
- transaction status messages

## Stage 8 — Admin
**Status: NOT STARTED**

- operations dashboard
- transfer monitoring
- revenue
- limits
- supported tokens
- contract state
- reconciliation
- system health
- audit log review

## Stage 9 — BNB testnet E2E
**Status: BLOCKED UNTIL VERIFIED TOKEN/CONTRACT ADDRESSES EXIST**

Required:
- deploy Tfumela contract on BNB testnet
- verify USDT and USDC token contracts independently
- configure API and web
- Customer A -> USDT -> Customer B
- Customer A -> USDC -> Customer B
- fee collection
- approval failure
- insufficient balance
- rejected signature
- reverted transaction
- duplicate/idempotency recovery
- restart/reconciliation recovery

## Stage 10 — Full audit
**Status: NOT STARTED**

- economic audit
- smart-contract security audit
- backend security audit
- dApp security audit
- WhatsApp security audit
- database audit
- secrets audit
- deployment audit
- failure/recovery audit

## Stage 11 — Production preparation
**Status: NOT STARTED**

- country-by-country regulatory/legal determination
- compliance architecture
- KYC/AML if required
- production infrastructure
- monitoring
- support
- incident response
- wallet/gas strategy

## Stage 12 — Controlled mainnet launch
**Status: NOT ELIGIBLE YET**

Only after every production gate, independent security review, operational runbook, legal/compliance determination and successful controlled testnet E2E.

## Immediate engineering milestone

**Complete the backend blockchain orchestration/reconciliation layer, create the separate Render PostgreSQL, deploy the verified BNB testnet contract, and prove both USDT and USDC end-to-end.**
