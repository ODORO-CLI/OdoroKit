-- La capacite shop 1.3.0 d odoro-cloud, telle que le gestionnaire l installe.

-- GENERE depuis packages/manager/src/features/shop.ts (odoro-cloud) : ne pas editer a la main.

-- Le module commerce la lit ; son registre dit quelle version est posee.

CREATE SCHEMA IF NOT EXISTS shop;

-- 0001-catalogue : Les produits, leurs options, leurs variantes et leurs images.
CREATE TABLE IF NOT EXISTS shop.products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 140),
  description      text NOT NULL DEFAULT '',
  price_cents      integer NOT NULL CHECK (price_cents >= 0),
  -- Un prix barre sous le prix paye est une pratique commerciale trompeuse.
  compare_at_cents integer CHECK (compare_at_cents IS NULL OR compare_at_cents > price_cents),
  kind             text NOT NULL DEFAULT 'physique'
                     CHECK (kind IN ('physique', 'numerique', 'formation', 'abonnement')),
  -- NULL = non suivi (un fichier ne s'epuise pas), 0 = epuise. Jamais de
  -- nombre sentinelle : il finit toujours decremente par distraction.
  stock            integer CHECK (stock IS NULL OR stock >= 0),
  published        boolean NOT NULL DEFAULT false,
  position         smallint NOT NULL DEFAULT 0,
  -- La cle de l'article du plan qui a fait naitre le produit : regenerer le
  -- retrouve au lieu d'en creer un second. Nulle pour un produit fait main.
  catalogue_key    text CHECK (catalogue_key IS NULL OR catalogue_key ~ '^[a-z0-9][a-z0-9-]{0,59}$'),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS products_cle_de_catalogue
  ON shop.products (catalogue_key) WHERE catalogue_key IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS products_en_vente
  ON shop.products (position) WHERE published AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS shop.product_options (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES shop.products (id) ON DELETE CASCADE,
  name       text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 60),
  position   smallint NOT NULL DEFAULT 0,
  UNIQUE (product_id, name)
);

CREATE TABLE IF NOT EXISTS shop.product_variants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES shop.products (id) ON DELETE CASCADE,
  sku         text,
  -- NULL = le prix du produit.
  price_cents integer CHECK (price_cents IS NULL OR price_cents >= 0),
  stock       integer CHECK (stock IS NULL OR stock >= 0),
  position    smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS variantes_du_produit ON shop.product_variants (product_id, position);

CREATE TABLE IF NOT EXISTS shop.product_variant_values (
  variant_id uuid NOT NULL REFERENCES shop.product_variants (id) ON DELETE CASCADE,
  option_id  uuid NOT NULL REFERENCES shop.product_options (id) ON DELETE CASCADE,
  value      text NOT NULL CHECK (length(trim(value)) BETWEEN 1 AND 80),
  PRIMARY KEY (variant_id, option_id)
);

CREATE TABLE IF NOT EXISTS shop.product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES shop.products (id) ON DELETE CASCADE,
  -- Une cle opaque : le fichier vit chez le stockage, pas dans la base.
  storage_key text NOT NULL,
  mime_type   text NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  alt_text    text NOT NULL DEFAULT '',
  position    smallint NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS images_du_produit ON shop.product_images (product_id, position);

-- Un produit a TOUJOURS une variante : le panier et la commande ne
-- connaissent qu'elles.
CREATE OR REPLACE FUNCTION shop.produit_avec_variante() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO shop.product_variants (product_id, position) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS produit_avec_variante ON shop.products;
CREATE TRIGGER produit_avec_variante
  AFTER INSERT ON shop.products
  FOR EACH ROW EXECUTE FUNCTION shop.produit_avec_variante();

-- 0002-collections : Les collections, et les produits qu elles rangent.
CREATE TABLE IF NOT EXISTS shop.collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  slug        text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  description text NOT NULL DEFAULT '',
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop.collection_products (
  collection_id uuid NOT NULL REFERENCES shop.collections (id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES shop.products (id) ON DELETE CASCADE,
  position      smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- 0003-paniers : Les paniers et leurs lignes, avec les reservations de stock.
CREATE TABLE IF NOT EXISTS shop.carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Le jeton du cookie. Il ne se devine pas : 24 octets tires au hasard.
  token      text NOT NULL UNIQUE,
  email      text,
  state      text NOT NULL DEFAULT 'ouvert' CHECK (state IN ('ouvert', 'commande', 'abandonne')),
  -- Un panier d'essai de l'apercu de l'atelier : jamais compte, jamais relance.
  preview    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop.cart_lines (
  cart_id          uuid NOT NULL REFERENCES shop.carts (id) ON DELETE CASCADE,
  variant_id       uuid NOT NULL REFERENCES shop.product_variants (id) ON DELETE CASCADE,
  quantity         integer NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  -- Le prix vu a l'ajout : la caisse le compare au prix du jour et le dit.
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  added_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cart_id, variant_id)
);

-- Une reservation tient le stock pendant qu'on paie ; perimee, elle ne
-- bloque plus rien, sans quoi un panier abandonne retirerait l'article de la
-- vente pour toujours.
CREATE TABLE IF NOT EXISTS shop.stock_reservations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES shop.product_variants (id) ON DELETE CASCADE,
  cart_id    uuid REFERENCES shop.carts (id) ON DELETE SET NULL,
  quantity   integer NOT NULL CHECK (quantity > 0),
  state      text NOT NULL DEFAULT 'ouverte' CHECK (state IN ('ouverte', 'consommee', 'relachee')),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS reservations_ouvertes
  ON shop.stock_reservations (variant_id) WHERE state = 'ouverte';

-- 0004-commandes : Les commandes : ce qui a ete vendu, a qui, et la reference du paiement.
CREATE TABLE IF NOT EXISTS shop.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Le numero que la personne lit dans son courriel : court, et qui se suit.
  number           bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  cart_id          uuid REFERENCES shop.carts (id) ON DELETE SET NULL,
  email            text NOT NULL,
  customer_name    text NOT NULL,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  state            text NOT NULL DEFAULT 'ouverte'
                     CHECK (state IN ('ouverte', 'payee', 'echouee', 'remboursee', 'annulee')),
  currency         text NOT NULL DEFAULT 'EUR' CHECK (currency ~ '^[A-Z]{3}$'),
  subtotal_cents   integer NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents   integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents        integer NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents      integer NOT NULL CHECK (total_cents >= 0),
  -- La reference opaque que le paiement (chez ODORO) a rendue. Rien de
  -- payable n'est garde ici : ni carte, ni jeton de prestataire.
  payment_ref      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  paid_at          timestamptz,
  CHECK ((state = 'payee') <= (paid_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS shop.order_lines (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES shop.orders (id) ON DELETE CASCADE,
  -- SET NULL : une variante supprimee ne fait pas disparaitre la ligne d'une
  -- facture deja emise. Le nom et le prix sont recopies pour la meme raison.
  variant_id       uuid REFERENCES shop.product_variants (id) ON DELETE SET NULL,
  product_name     text NOT NULL,
  variant_label    text NOT NULL DEFAULT '',
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity         integer NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS lignes_de_la_commande ON shop.order_lines (order_id);

-- 0005-gestes-de-la-commande : Les expeditions et les remboursements d une commande, et ce qui en a ete rendu.
ALTER TABLE shop.orders ADD COLUMN IF NOT EXISTS refunded_cents integer NOT NULL DEFAULT 0
  CHECK (refunded_cents >= 0);

DO $$
BEGIN
  -- On ne rend jamais plus que ce qui a ete paye. Pose a part : une contrainte
  -- de colonne ne doit pas lire une autre colonne.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rendu_borne_par_le_total') THEN
    ALTER TABLE shop.orders ADD CONSTRAINT rendu_borne_par_le_total CHECK (refunded_cents <= total_cents);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS shop.fulfillments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES shop.orders (id) ON DELETE CASCADE,
  carrier         text NOT NULL DEFAULT '' CHECK (length(carrier) <= 80),
  tracking_number text NOT NULL DEFAULT '' CHECK (length(tracking_number) <= 120),
  tracking_url    text NOT NULL DEFAULT '' CHECK (length(tracking_url) <= 500),
  shipped_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS expeditions_de_la_commande ON shop.fulfillments (order_id);

CREATE TABLE IF NOT EXISTS shop.refunds (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES shop.orders (id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  reason       text NOT NULL DEFAULT '' CHECK (length(reason) <= 500),
  -- La reference du remboursement chez ODORO : elle ecrit une fois, pas deux.
  refund_ref   text NOT NULL UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS remboursements_de_la_commande ON shop.refunds (order_id);

-- 0006-codes-de-remise : Les codes de remise d une boutique, la remise portee par la commande, et chaque usage.
CREATE TABLE IF NOT EXISTS shop.discount_codes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code               text NOT NULL CHECK (code ~ '^[A-Za-z0-9_-]{1,40}$'),
  kind               text NOT NULL CHECK (kind IN ('pourcentage', 'montant')),
  -- Un pourcentage en milliemes de pour cent (10000 = 10 %), comme ODORO le
  -- compte ; un montant en centimes.
  value              integer NOT NULL CHECK (value > 0),
  min_subtotal_cents integer NOT NULL DEFAULT 0 CHECK (min_subtotal_cents >= 0),
  max_uses           integer CHECK (max_uses > 0),
  starts_at          timestamptz,
  ends_at            timestamptz,
  active             boolean NOT NULL DEFAULT true,
  -- La remise d'ODORO dont celle-ci est la copie : la recopie suivante la
  -- met a jour au lieu d'en creer une seconde.
  source_ref         text UNIQUE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (kind <> 'pourcentage' OR value <= 100000),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);
-- Un code se tape sans se soucier des majuscules : deux codes qui ne
-- different que par elles seraient le meme pour la personne qui le tape.
CREATE UNIQUE INDEX IF NOT EXISTS un_code_par_boutique ON shop.discount_codes (upper(code));

ALTER TABLE shop.orders ADD COLUMN IF NOT EXISTS discount_code text;
ALTER TABLE shop.orders ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0
  CHECK (discount_cents >= 0);

DO $$
BEGIN
  -- Une remise ne depasse jamais le panier qu'elle reduit.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'remise_bornee_par_le_panier') THEN
    ALTER TABLE shop.orders ADD CONSTRAINT remise_bornee_par_le_panier CHECK (discount_cents <= subtotal_cents);
  END IF;
END $$;

-- Un usage par commande payee : c'est ce qui compte un code limite.
CREATE TABLE IF NOT EXISTS shop.discount_uses (
  order_id    uuid PRIMARY KEY REFERENCES shop.orders (id) ON DELETE CASCADE,
  discount_id uuid NOT NULL REFERENCES shop.discount_codes (id) ON DELETE CASCADE,
  used_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS usages_du_code ON shop.discount_uses (discount_id);

-- 0007-comptes-clients : Le compte du client, ses liens de connexion et ses sessions, et le panier qui le suit.
CREATE TABLE IF NOT EXISTS shop.customers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- En minuscules : deux comptes pour la meme boite a lettres, ce serait
  -- deux historiques de commandes pour une seule personne.
  email             text NOT NULL CHECK (email = lower(email) AND position('@' in email) > 1 AND length(email) <= 254),
  name              text NOT NULL DEFAULT '' CHECK (length(name) <= 120),
  -- L'accord pour recevoir les offres, et d'ou il vient. Pas de case
  -- cochee, pas d'accord : la date prouve qu'il a ete donne.
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_source    text CHECK (consent_source IN ('compte', 'lettre')),
  consent_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  -- La derniere venue : c'est d'elle que court la conservation, pas de la
  -- creation — un client fidele depuis quatre ans n'est pas un compte oublie.
  last_seen_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (marketing_consent <= (consent_at IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS un_compte_par_courriel ON shop.customers (email);

CREATE TABLE IF NOT EXISTS shop.customer_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES shop.customers (id) ON DELETE CASCADE,
  fingerprint text NOT NULL UNIQUE CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS liens_du_client ON shop.customer_links (customer_id, created_at);

CREATE TABLE IF NOT EXISTS shop.customer_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES shop.customers (id) ON DELETE CASCADE,
  fingerprint text NOT NULL UNIQUE CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shop.carts ADD COLUMN IF NOT EXISTS customer_id uuid
  REFERENCES shop.customers (id) ON DELETE SET NULL;

CREATE SCHEMA IF NOT EXISTS odoro;

CREATE TABLE IF NOT EXISTS odoro.features (name text PRIMARY KEY, version text NOT NULL, schema_name text NOT NULL, active boolean NOT NULL DEFAULT true, enabled_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

INSERT INTO odoro.features (name, version, schema_name) VALUES ('shop', '1.3.0', 'shop') ON CONFLICT (name) DO NOTHING;
