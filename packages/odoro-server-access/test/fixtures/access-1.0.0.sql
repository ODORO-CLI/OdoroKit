-- La capacite access 1.0.0 d odoro-cloud, telle que le gestionnaire l installe.

-- GENERE depuis packages/manager/src/features/access.ts (odoro-cloud) : ne pas editer a la main.

CREATE SCHEMA IF NOT EXISTS access;

-- 0001-droits-et-contenus : Les contenus reserves d un produit, les droits d y acceder, et ce qui a ete vu.
CREATE TABLE IF NOT EXISTS access.contents (
  id          uuid PRIMARY KEY,
  product_ref text NOT NULL CHECK (length(product_ref) BETWEEN 1 AND 64),
  -- Une lecon appartient a un module ; un module, a rien.
  parent_id   uuid REFERENCES access.contents (id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('module', 'lecon', 'fichier', 'page')),
  title       text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  position    integer NOT NULL DEFAULT 0,
  body        text NOT NULL DEFAULT '' CHECK (length(body) <= 200000),
  -- Un fichier : sa cle dans la capacite storage, jamais ses octets ici.
  storage_key text CHECK (storage_key IS NULL OR (storage_key ~ '^[a-z0-9][a-z0-9/_.-]{0,254}$' AND storage_key NOT LIKE '%..%')),
  -- Une video hebergee ailleurs : une adresse https, rien d'autre.
  video_url   text CHECK (video_url IS NULL OR (video_url ~ '^https://' AND length(video_url) <= 500)),
  published   boolean NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (id <> parent_id)
);
CREATE INDEX IF NOT EXISTS contenus_du_produit ON access.contents (product_ref, position);

CREATE TABLE IF NOT EXISTS access.entitlements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL CHECK (email = lower(email) AND position('@' in email) > 1 AND length(email) <= 254),
  product_ref text NOT NULL CHECK (length(product_ref) BETWEEN 1 AND 64),
  source      text NOT NULL CHECK (source IN ('achat', 'abonnement', 'offert')),
  -- Ce qui a ouvert le droit (un paiement, un abonnement) : une seule fois.
  reference   text NOT NULL UNIQUE CHECK (length(reference) BETWEEN 1 AND 200),
  starts_at   timestamptz NOT NULL DEFAULT now(),
  -- NULL : pour toujours (un achat). Un abonnement porte la fin de sa periode.
  ends_at     timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS droits_de_l_adresse ON access.entitlements (email, product_ref);

CREATE TABLE IF NOT EXISTS access.progress (
  email      text NOT NULL CHECK (email = lower(email)),
  content_id uuid NOT NULL REFERENCES access.contents (id) ON DELETE CASCADE,
  seen_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (email, content_id)
);

CREATE SCHEMA IF NOT EXISTS odoro;

CREATE TABLE IF NOT EXISTS odoro.features (name text PRIMARY KEY, version text NOT NULL, schema_name text NOT NULL, active boolean NOT NULL DEFAULT true, enabled_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

INSERT INTO odoro.features (name, version, schema_name) VALUES ('access', '1.0.0', 'access') ON CONFLICT (name) DO NOTHING;
