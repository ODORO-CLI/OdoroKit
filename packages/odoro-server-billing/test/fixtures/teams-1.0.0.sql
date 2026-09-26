-- La capacite teams 1.0.0 d odoro-cloud, telle que le gestionnaire l installe.

-- GENERE depuis packages/manager/src/features/teams.ts (odoro-cloud) : ne pas editer a la main.

CREATE SCHEMA IF NOT EXISTS teams;

-- 0001-equipes : Les equipes, leurs membres, et les invitations envoyees par courriel.
CREATE TABLE IF NOT EXISTS teams.teams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams.members (
  team_id   uuid NOT NULL REFERENCES teams.teams (id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES accounts.users (id) ON DELETE CASCADE,
  role      text NOT NULL CHECK (role IN ('proprietaire', 'admin', 'membre')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);
CREATE INDEX IF NOT EXISTS equipes_du_compte ON teams.members (user_id, joined_at);

CREATE TABLE IF NOT EXISTS teams.invitations (
  fingerprint text PRIMARY KEY CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  team_id     uuid NOT NULL REFERENCES teams.teams (id) ON DELETE CASCADE,
  email       text NOT NULL CHECK (email = lower(email) AND position('@' in email) > 1 AND length(email) <= 254),
  -- On n'invite pas un proprietaire : on le devient par transfert.
  role        text NOT NULL CHECK (role IN ('admin', 'membre')),
  invited_by  uuid REFERENCES accounts.users (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  accepted_at timestamptz
);
CREATE INDEX IF NOT EXISTS invitations_de_l_equipe ON teams.invitations (team_id, created_at DESC);

