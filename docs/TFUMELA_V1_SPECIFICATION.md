# Tfumela V1 Product, Economic and Technical Specification

## 1. Product definition

Tfumela is a peer-to-peer stablecoin transfer service. Its V1 purpose is simple:

> A person can send USDT or USDC to another person on BNB Smart Chain, using WhatsApp as the primary customer conversation interface and a customer-controlled wallet for transaction authorization.

This specification deliberately excludes KYC provider integration from V1 development. KYC/AML and other regulated production controls are a later gate, not a reason to stop building and testing the product.

## 2. Supported assets

V1 supports exactly two customer transfer assets:

- USDT
- USDC

The supported token contract addresses are environment/network configuration and must be verified for the selected BNB network before deployment. The application must never assume that an address from another network is valid.

The smart contract must maintain an explicit allow-list of supported token contracts. Any unsupported token must be rejected.

BNB is not a Tfumela customer payment asset. Customers may still need BNB to pay blockchain gas unless a later sponsored-gas design is introduced.

## 3. Transfer economics

### 3.1 Amount semantics

The customer enters the **recipient amount**.

Example:

- Recipient amount: 100 USDT
- Tfumela fee: 1 USDT
- Customer total: 101 USDT
- Recipient receives: 100 USDT
- Tfumela treasury receives: 1 USDT

The exact fee schedule is configurable and must be shown before authorization.

### 3.2 Fee requirements

Fees must be:

- explicit before signing;
- denominated in the same supported stablecoin as the transfer;
- bounded by a contract-enforced maximum;
- configurable only through authorized administration;
- emitted in on-chain events;
- separately recorded in the backend ledger.

No hidden spread or silent deduction is permitted in V1.

### 3.3 Revenue model

Primary V1 revenue is the transfer fee.

Business reporting must distinguish:
- gross transfer volume;
- fee revenue;
- blockchain/gas costs;
- infrastructure/WhatsApp costs;
- refunds/adjustments where applicable;
- net contribution.

## 4. Non-custodial security model

Tfumela must not collect or store customer private keys in the normal V1 architecture.

The backend may:
- identify the customer;
- resolve recipients;
- calculate fees;
- prepare transaction parameters;
- monitor blockchain events;
- report status.

The backend must not:
- sign customer transfers;
- hold a universal private key capable of draining customer wallets;
- fabricate successful transaction status;
- alter a confirmed blockchain transaction.

The customer wallet signs the transaction.

## 5. Smart contract responsibilities

The contract is the financial authority for the supported transfer operation.

Core responsibilities:

- maintain supported-token allow-list;
- validate recipient;
- validate amount;
- calculate/enforce fee;
- enforce fee ceiling;
- transfer recipient amount;
- route fee to treasury;
- emit complete transfer/fee events;
- support controlled pause;
- expose safe configuration functions;
- prevent unauthorized configuration;
- never withdraw customer principal as an administrative operation.

### 5.1 Suggested interface

Names may change during implementation, but the contract should provide equivalent capabilities:

- sendToken(token, recipient, amount)
- calculateFee(token, amount)
- isSupportedToken(token)
- setSupportedToken(token, enabled)
- setFeeConfig(...)
- setTreasury(address)
- pause()
- unpause()

Fee withdrawal, if needed, must only withdraw accumulated protocol fees and must be designed so customer transfer principal cannot be mistaken for protocol revenue.

### 5.2 Administrative model

Testnet may use a single controlled owner account.

Production should use stronger administration, preferably multisig or equivalent protected governance.

No upgrade proxy is required for V1 unless security analysis later demonstrates a strong need. Simpler contracts reduce upgrade-related risk.

## 6. Transfer lifecycle

Every transfer has a durable lifecycle:

CREATED -> AUTHORIZATION_PENDING -> SUBMITTED -> CONFIRMED

Failure paths include:

AUTHORIZATION_REJECTED
SUBMISSION_FAILED
REVERTED
EXPIRED
RECONCILIATION_REQUIRED

A transaction is not marked successful merely because the backend submitted it. Confirmation must be based on blockchain evidence.

The backend must be idempotent so repeated WhatsApp messages, webhooks, or blockchain event observations do not create duplicate financial records.

## 7. Customer account model

A Tfumela customer record should support:

- internal customer ID;
- phone/WhatsApp identifier where available;
- email where used;
- linked wallet address;
- display name;
- account status;
- created/updated timestamps.

Wallet linking must include proof of wallet control through a signed message or equivalent wallet authorization. A typed wallet address alone is insufficient for ownership.

## 8. Recipient model

Recipients may be:

1. another registered Tfumela customer selected by name/identifier; or
2. an external wallet address.

For registered recipients, the system should resolve:

customer identity -> verified wallet address

Wallet changes must require strong reauthorization and create an audit event.

Before authorization, Tfumela must display the final recipient address in shortened and full-verification-friendly form so the customer can detect mistakes.

## 9. WhatsApp architecture

WhatsApp is a customer interface, not a blockchain signing authority.

Example:

Customer:
Send 100 USDT to Kabelo

Tfumela:
- resolves recipient;
- calculates fee;
- displays amount, fee, total, asset and network;
- asks for confirmation;
- provides a secure wallet authorization path.

The blockchain transaction is signed outside WhatsApp by the customer's wallet.

The WhatsApp adapter must be replaceable so the core transfer engine can also be tested through a web/API simulator before production WhatsApp credentials are available.

## 10. Backend architecture

The backend should contain separate modules for:

- authentication/account management;
- wallet linking;
- recipient resolution;
- quote/fee calculation;
- transfer orchestration;
- blockchain RPC interaction;
- event/indexing/reconciliation;
- transaction history;
- WhatsApp messaging;
- admin operations;
- audit logging;
- configuration.

Business logic must not depend directly on WhatsApp-specific message formatting.

## 11. Database

Tfumela will use a **new dedicated Render PostgreSQL database**.

No Liholiswano database, tables, credentials, migrations or connection strings are reused.

Initial logical entities:

- users
- wallets
- recipients
- transfers
- transfer_events
- fees
- webhook_events
- audit_logs
- system_settings

Blockchain transaction hashes must have unique constraints where appropriate.

Database records are an operational index; the blockchain remains authoritative for on-chain settlement.

## 12. Reconciliation

The system must periodically reconcile:

- database transfer records;
- blockchain transaction receipts;
- contract transfer events;
- fee events;
- token balances relevant to protocol fees.

Discrepancies must become visible operational alerts rather than being silently corrected.

## 13. Limits and abuse controls

V1 must support configuration for:

- maximum transfer amount;
- maximum fee;
- optional per-wallet/day limits;
- minimum transfer amount;
- supported networks;
- supported tokens.

Any limit that must be impossible to bypass by direct contract calls belongs in the smart contract. Backend-only limits are appropriate for operational controls but cannot be treated as blockchain enforcement.

## 14. Failure handling

The product must explicitly handle:

- insufficient token balance;
- insufficient allowance;
- insufficient gas;
- rejected wallet signature;
- user cancellation;
- invalid recipient;
- unsupported token;
- contract pause;
- RPC outage;
- WhatsApp delivery failure;
- transaction stuck/pending;
- reverted transaction;
- duplicate webhook;
- duplicate customer request;
- backend restart during a transfer;
- blockchain reorganization/finality uncertainty.

No failure may result in a false "completed" message.

## 15. Security requirements

At minimum:

- OpenZeppelin or similarly trusted primitives where appropriate;
- reentrancy protection where applicable;
- checks-effects-interactions discipline;
- safe ERC-20/BEP-20 transfer handling;
- strict access control;
- bounded fees;
- pause mechanism;
- validated token allow-list;
- validated non-zero addresses;
- no arbitrary token rescue to admin that can compromise customer funds;
- secrets only in deployment secret stores;
- no private keys in source control;
- rate limiting on sensitive APIs;
- webhook authenticity verification;
- idempotency keys;
- audit logging;
- dependency scanning;
- automated contract tests.

## 16. Testing strategy

### Contract tests

Test:
- USDT transfer;
- USDC transfer;
- fee calculation;
- fee collection;
- unsupported token rejection;
- zero amount rejection;
- invalid recipient rejection;
- fee ceiling;
- unauthorized administration;
- pause/unpause;
- allowance failures;
- insufficient balance;
- event correctness;
- repeated calls;
- edge values.

### Backend tests

Test:
- account creation;
- wallet ownership;
- recipient resolution;
- quote calculation;
- transfer state machine;
- idempotency;
- database constraints;
- webhook processing;
- reconciliation.

### E2E

At minimum:

Customer A -> Tfumela -> USDT -> Customer B

and:

Customer A -> Tfumela -> USDC -> Customer B

Then test failed and recovery scenarios.

## 17. Observability

Production-style telemetry should include:

- API health;
- database health;
- blockchain RPC health;
- pending transactions;
- confirmation latency;
- failed transactions;
- reconciliation discrepancies;
- WhatsApp webhook failures;
- fee revenue;
- transfer volume.

Sensitive personal data and secrets must never be written to ordinary logs.

## 18. Deployment environments

At minimum:

- local development;
- BNB testnet;
- production/mainnet later.

Configuration must be environment-specific.

Testnet credentials, token addresses and treasury addresses must never accidentally be used in production.

## 19. Render infrastructure

Tfumela will receive its own Render resources:

- Tfumela Web;
- Tfumela API;
- **new Tfumela PostgreSQL database**.

No Liholiswano Render database is reused.

Database credentials must be injected as environment variables/secrets.

## 20. Production gate

A successful testnet transfer is not automatically authorization for a public money-transfer launch.

Before unrestricted public production use, the project must complete:
- contract security review/audit;
- operational security review;
- regulatory/legal determination;
- required licensing/registration where applicable;
- production compliance/KYC/AML layer as required;
- incident response;
- monitoring;
- customer support;
- final wallet/gas strategy;
- mainnet deployment review.

## 21. V1 non-goals

Not part of the initial working product:

- KYC provider;
- biometric verification;
- fiat deposits;
- fiat withdrawals;
- lending;
- staking;
- yield;
- swaps;
- multi-chain transfers;
- arbitrary tokens;
- customer custody by Tfumela;
- hidden administrative access to customer funds.

These may be considered later without changing the core transfer architecture.

## 22. Definition of done for V1

V1 is technically complete when a controlled testnet user can:

1. register;
2. link and prove control of a wallet;
3. select USDT or USDC;
4. select a recipient;
5. receive an exact fee quote;
6. authorize the transfer with their wallet;
7. have the contract transfer the stablecoin;
8. have the contract collect the Tfumela fee;
9. have the backend observe and reconcile the transaction;
10. see the final status through web and WhatsApp;
11. retrieve the transaction from history;
12. repeat the process safely without duplicate settlement.

All automated tests and E2E gates must pass before calling the product V1-complete.
