-- La capacite accounts 1.0.0 d odoro-cloud, telle que le gestionnaire l installe.

-- GENERE depuis packages/manager/src/features/accounts.ts (odoro-cloud) : ne pas editer a la main.

CREATE SCHEMA IF NOT EXISTS accounts;

-- 0001-comptes : Les comptes, leurs sessions, et les liens envoyes par courriel.
CREATE TABLE IF NOT EXISTS accounts.users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL CHECK (email = lower(email) AND position('@' in email) > 1 AND length(email) <= 254),
  -- scrypt, et rien d'autre : sel et parametres dans la chaine elle-meme.
  password_hash text CHECK (password_hash IS NULL OR password_hash ~ '^scrypt[$][0-9]+[$][0-9]+[$][0-9]+[$][A-Za-z0-9_-]{22,}[$][A-Za-z0-9_-]{43,}$'),
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS comptes_par_adresse ON accounts.users (email);

CREATE TABLE IF NOT EXISTS accounts.sessions (
  fingerprint text PRIMARY KEY CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  user_id     uuid NOT NULL REFERENCES accounts.users (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_du_compte ON accounts.sessions (user_id);

CREATE TABLE IF NOT EXISTS accounts.tokens (
  fingerprint text PRIMARY KEY CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  user_id     uuid NOT NULL REFERENCES accounts.users (id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('verification', 'reinitialisation', 'lien')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz
);
CREATE INDEX IF NOT EXISTS jetons_du_compte ON accounts.tokens (user_id, kind, created_at DESC);

