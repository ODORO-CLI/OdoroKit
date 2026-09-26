-- La capacite billing 1.1.0 d odoro-cloud, telle que le gestionnaire l installe.

-- GENERE depuis packages/manager/src/features/billing.ts (odoro-cloud) : ne pas editer a la main.

CREATE SCHEMA IF NOT EXISTS billing;

-- 0001-facturation : Les formules, l'abonnement de chaque equipe, ce qu'elle doit, et l'usage compte.
CREATE TABLE IF NOT EXISTS billing.plans (
  id               text PRIMARY KEY CHECK (id ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  name             text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
  price_cents      integer NOT NULL CHECK (price_cents BETWEEN 0 AND 10000000),
  currency         text NOT NULL DEFAULT 'EUR' CHECK (currency ~ '^[A-Z]{3}$'),
  billing_interval text NOT NULL CHECK (billing_interval IN ('month', 'year')),
  seats_included   integer NOT NULL DEFAULT 1 CHECK (seats_included BETWEEN 1 AND 10000),
  seat_price_cents integer NOT NULL DEFAULT 0 CHECK (seat_price_cents BETWEEN 0 AND 1000000),
  trial_days       integer NOT NULL DEFAULT 0 CHECK (trial_days BETWEEN 0 AND 90),
  features         text[] NOT NULL DEFAULT '{}' CHECK (cardinality(features) <= 100),
  limits           jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(limits) = 'object'),
  active           boolean NOT NULL DEFAULT true,
  position         integer NOT NULL DEFAULT 0,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing.plan_meters (
  plan_id          text NOT NULL REFERENCES billing.plans (id) ON DELETE CASCADE,
  metric           text NOT NULL CHECK (metric ~ '^[a-z][a-z0-9_]{0,39}$'),
  included         integer NOT NULL DEFAULT 0 CHECK (included BETWEEN 0 AND 1000000000),
  unit_size        integer NOT NULL DEFAULT 1 CHECK (unit_size BETWEEN 1 AND 1000000),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents BETWEEN 0 AND 1000000),
  PRIMARY KEY (plan_id, metric)
);

-- Une ligne par equipe : son etat present. L'historique de l'argent est
-- chez ODORO, qui ecrit cette ligne.
CREATE TABLE IF NOT EXISTS billing.subscriptions (
  team_id              uuid PRIMARY KEY REFERENCES teams.teams (id) ON DELETE RESTRICT,
  plan_id              text NOT NULL REFERENCES billing.plans (id),
  status               text NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  seats                integer NOT NULL CHECK (seats BETWEEN 1 AND 10000),
  trial_ends_at        timestamptz,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'trialing' OR trial_ends_at IS NOT NULL),
  CHECK (current_period_end IS NULL OR current_period_end > current_period_start)
);

-- Ce qu'ODORO a demande a une equipe hors de l'abonnement : les sieges
-- ajoutes en cours de periode, l'usage d'une periode close.
CREATE TABLE IF NOT EXISTS billing.invoices (
  id           uuid PRIMARY KEY,
  team_id      uuid NOT NULL REFERENCES teams.teams (id) ON DELETE RESTRICT,
  kind         text NOT NULL CHECK (kind IN ('seats', 'period')),
  -- Le detail : ce que chaque ligne facture (sieges, compteurs), pour que
  -- l'equipe comprenne ce qu'on lui demande.
  lines        jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(lines) = 'array'),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency     text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  period_start timestamptz,
  period_end   timestamptz,
  status       text NOT NULL CHECK (status IN ('open', 'paid', 'void')),
  payment_url  text CHECK (payment_url IS NULL OR payment_url ~ '^https://'),
  created_at   timestamptz NOT NULL DEFAULT now(),
  paid_at      timestamptz
);
CREATE INDEX IF NOT EXISTS factures_de_l_equipe ON billing.invoices (team_id, created_at DESC);

CREATE TABLE IF NOT EXISTS billing.usage_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES teams.teams (id) ON DELETE CASCADE,
  metric          text NOT NULL CHECK (metric ~ '^[a-z][a-z0-9_]{0,39}$'),
  quantity        integer NOT NULL CHECK (quantity BETWEEN 1 AND 1000000),
  user_id         uuid REFERENCES accounts.users (id) ON DELETE SET NULL,
  idempotency_key text CHECK (idempotency_key IS NULL OR idempotency_key ~ '^[A-Za-z0-9_.:-]{1,100}$'),
  occurred_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS usage_idempotent
  ON billing.usage_events (team_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS usage_par_periode ON billing.usage_events (team_id, metric, occurred_at);

-- 0002-resiliation-et-remboursement : La resiliation a la fin de la periode, et ce qui a ete rendu d'une facture.
-- Vrai quand l'abonnement ne se renouvellera pas : l'equipe garde sa formule
-- jusqu'a la fin de la periode payee, puis ODORO l ecrit canceled.
ALTER TABLE billing.subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

-- Ce qui a ete rendu d'une facture, en centimes ; refunded quand tout
-- l a ete. Jamais plus que la facture.
ALTER TABLE billing.invoices ADD COLUMN IF NOT EXISTS refunded_cents integer NOT NULL DEFAULT 0
  CHECK (refunded_cents >= 0);
ALTER TABLE billing.invoices ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'facture_rendue_bornee') THEN
    ALTER TABLE billing.invoices ADD CONSTRAINT facture_rendue_bornee CHECK (refunded_cents <= amount_cents);
  END IF;
  -- L'etat d'une facture gagne refunded. La contrainte de 1.0.0 porte le
  -- nom que PostgreSQL lui a donne ; elle est remplacee par une nommee.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'etat_de_la_facture') THEN
    ALTER TABLE billing.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
    ALTER TABLE billing.invoices ADD CONSTRAINT etat_de_la_facture
      CHECK (status IN ('open', 'paid', 'void', 'refunded'));
  END IF;
END $$;
