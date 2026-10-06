# Tfumela Build Roadmap

## Stage 1 — Specification and foundation
**Status: STARTED**

- Product scope
- USDT/USDC-only policy
- Non-custodial wallet model
- Fee/revenue model
- Transfer lifecycle
- Security boundaries
- New Render PostgreSQL requirement
- KYC deferred

## Stage 2 — Repository and development foundation
- TypeScript/Node backend
- Web dApp
- Solidity contract workspace
- Shared configuration
- Environment templates
- CI
- lint/typecheck/test gates

## Stage 3 — Smart contract
- Supported USDT/USDC configuration
- Transfer function
- Fee calculation
- Treasury
- limits
- pause
- events
- access control

## Stage 4 — Contract verification
- unit tests
- edge cases
- adversarial tests
- gas review
- security review
- testnet deployment

## Stage 5 — Customer wallet dApp
- connect wallet
- verify wallet ownership
- token balances
- recipient selection
- quote
- approve
- transfer
- confirmation
- history

## Stage 6 — Backend + new Render PostgreSQL
- schema/migrations
- authentication
- wallet/recipient records
- transfer orchestration
- blockchain monitoring
- reconciliation
- audit logs

## Stage 7 — WhatsApp
- adapter
- local simulator
- webhook processing
- customer commands/conversation
- secure signing handoff
- transaction status messages

## Stage 8 — Admin
- operational dashboard
- transfer monitoring
- revenue
- limits
- supported tokens
- contract state
- reconciliation
- system health

## Stage 9 — BNB testnet E2E
Prove:

Customer A -> USDT -> Customer B

and:

Customer A -> USDC -> Customer B

including fee collection and failure recovery.

## Stage 10 — Full audit
- economic audit
- smart-contract security audit
- backend security audit
- WhatsApp security audit
- database audit
- secrets audit
- deployment audit
- failure/recovery audit

## Stage 11 — Production preparation
- regulatory/legal determination
- compliance architecture
- KYC/AML if required
- production infrastructure
- monitoring
- support
- incident response
- wallet/gas strategy

## Stage 12 — Controlled mainnet launch
Only after all production gates pass.

### Immediate milestone

The first concrete engineering milestone is:

**A complete, tested USDT/USDC transfer engine on BNB testnet with automatic Tfumela fee collection.**
