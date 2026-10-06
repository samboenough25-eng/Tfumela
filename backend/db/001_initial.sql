CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  whatsapp_phone TEXT UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  ownership_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING','ACTIVE','REVOKED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chain_id, address)
);

CREATE TABLE IF NOT EXISTS recipients (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES users(id),
  label TEXT,
  address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chain_id, address)
);

CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id),
  wallet_id TEXT NOT NULL REFERENCES wallets(id),
  token_symbol TEXT NOT NULL CHECK (token_symbol IN ('USDT','USDC')),
  token_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  amount_units NUMERIC(78,0) NOT NULL CHECK (amount_units > 0),
  fee_units NUMERIC(78,0) NOT NULL CHECK (fee_units >= 0),
  total_units NUMERIC(78,0) NOT NULL CHECK (total_units = amount_units + fee_units),
  transfer_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('CREATED','AUTHORIZATION_PENDING','SUBMITTED','CONFIRMED','AUTHORIZATION_REJECTED','SUBMISSION_FAILED','REVERTED','EXPIRED','RECONCILIATION_REQUIRED')),
  tx_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_events (
  id BIGSERIAL PRIMARY KEY,
  transfer_id TEXT NOT NULL REFERENCES transfers(id),
  event_type TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('API','WALLET','BLOCKCHAIN','WHATSAPP','SYSTEM')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fees (
  id BIGSERIAL PRIMARY KEY,
  transfer_id TEXT NOT NULL UNIQUE REFERENCES transfers(id),
  token_symbol TEXT NOT NULL CHECK (token_symbol IN ('USDT','USDC')),
  amount_units NUMERIC(78,0) NOT NULL CHECK (amount_units >= 0),
  treasury_address TEXT NOT NULL,
  tx_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE (provider, external_event_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('CUSTOMER','ADMIN','SYSTEM','WEBHOOK')),
  actor_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_user_created ON transfers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfer_events_transfer ON transfer_events(transfer_id, created_at);
