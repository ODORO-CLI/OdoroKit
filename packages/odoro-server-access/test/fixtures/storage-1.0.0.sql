-- La capacite storage 1.0.0 d odoro-cloud, telle que le gestionnaire l installe.

-- GENERE depuis packages/manager/src/features/storage.ts (odoro-cloud) : ne pas editer a la main.

CREATE SCHEMA IF NOT EXISTS storage;

-- 0001-objets : Les fichiers du site : leur cle, leur type, leur taille, leur empreinte et leurs octets.
CREATE TABLE IF NOT EXISTS storage.objects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- L'adresse du fichier dans le site : « products/<id>/1.webp ». Unique, et
  -- sans rien qui remonte hors de la racine.
  key         text NOT NULL UNIQUE
                CHECK (key ~ '^[a-z0-9][a-z0-9/_.-]{0,254}$' AND key NOT LIKE '%..%'),
  mime_type   text NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'application/pdf', 'text/plain', 'audio/mpeg')),
  size_bytes  integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  sha256      text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  bytes       bytea NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Les octets disent la taille declaree : une ligne ne ment pas sur elle-meme.
  CHECK (octet_length(bytes) = size_bytes)
);
CREATE INDEX IF NOT EXISTS objets_par_empreinte ON storage.objects (sha256);

CREATE SCHEMA IF NOT EXISTS odoro;

CREATE TABLE IF NOT EXISTS odoro.features (name text PRIMARY KEY, version text NOT NULL, schema_name text NOT NULL, active boolean NOT NULL DEFAULT true, enabled_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

INSERT INTO odoro.features (name, version, schema_name) VALUES ('storage', '1.0.0', 'storage') ON CONFLICT (name) DO NOTHING;
