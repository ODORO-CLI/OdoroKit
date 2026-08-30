/**
 * La question de la base, posee pendant l'echafaudage.
 *
 * ## Pourquoi elle est posee ici
 *
 * Un projet serveur sans base ne fait rien. Poser la question a la creation
 * evite le moment ou l'on decouvre, au premier `npm run dev`, qu'il reste une
 * etape — et ou l'on va la chercher dans un README.
 *
 * ## PostgreSQL, heberge, et rien d'autre
 *
 * Il n'y a pas de base locale. L'URL pointe donc toujours sur quelque chose de
 * joignable par le reseau : une base provisionnee par la plateforme, ou celle
 * du projet.
 *
 * ## La voie « URL existante » n'est pas un mode degrade
 *
 * Elle est de premier rang, et testee au meme niveau. Un socle qui ne
 * fonctionne qu'avec notre propre infrastructure est un piege pour ceux qui
 * l'emploient : le jour ou l'on disparait, ou l'on change de tarif, ou l'on
 * change de fournisseur, leurs projets doivent continuer de tourner.
 *
 * ## Aucune connexion n'est ouverte
 *
 * Seule la **forme** de l'URL est verifiee. Ouvrir une connexion demanderait un
 * pilote PostgreSQL dans le CLI, qui est telecharge a chaque `npm create` et
 * dont le poids compte ; et cela ferait dependre la creation d'un projet de
 * l'etat du reseau. Une faute de frappe dans le mot de passe se decouvre donc
 * au premier demarrage, ou `/api/ready` la signale.
 *
 * @module
 */

import { appendFile, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Ce que l'utilisateur choisit. */
export type DatabaseChoice = 'provider' | 'url' | 'later'

/** Ce que la question rend. */
export interface DatabaseOutcome {
  readonly choice: DatabaseChoice
  /** URL retenue, absente si l'on a remis a plus tard. */
  readonly url?: string
  /** Message a afficher a la fin de la creation. */
  readonly note: string
}

/**
 * Verifie la forme d'une URL PostgreSQL.
 *
 * @returns `undefined` si elle convient, sinon ce qui ne va pas.
 */
export function checkDatabaseUrl(value: string): string | undefined {
  const url = value.trim()
  if (url.length === 0) return "L'URL ne peut pas etre vide."

  if (!/^postgres(ql)?:\/\//i.test(url)) {
    return 'Une URL PostgreSQL commence par postgres:// ou postgresql://'
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return "Cette chaine n'est pas une URL valide."
  }

  if (parsed.hostname.length === 0) return 'Aucun hote dans cette URL.'

  // Le chemin porte le nom de la base : `postgres://hote:5432` sans rien
  // derriere se connecte a la base par defaut du role, ce qui n'est presque
  // jamais ce qu'on veut et ne se remarque qu'une fois les tables ailleurs.
  if (parsed.pathname.replace(/^\//, '').length === 0) {
    return 'Aucun nom de base : ajoutez-le apres le port, par exemple /mon_projet'
  }

  if (
    !/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(parsed.hostname) &&
    parsed.searchParams.get('sslmode') === 'disable'
  ) {
    return 'sslmode=disable sur une base distante : le trafic passerait en clair.'
  }

  return undefined
}

/**
 * Ecrit l'URL dans le `.env` du projet, en creant le fichier si besoin.
 *
 * Le fichier n'est jamais versionne : {@link assertEnvIgnored} le verifie.
 */
export async function writeDatabaseUrl(target: string, url: string): Promise<void> {
  const path = join(target, '.env')
  const line = `DATABASE_URL=${url}\n`

  if (!existsSync(path)) {
    const example = join(target, '.env.example')
    // Le `.env` part de l'exemple : toutes les variables commentees y sont, et
    // l'on ne decouvre pas les autres une par une.
    const base = existsSync(example) ? await readFile(example, 'utf8') : ''
    await writeFile(path, base.replace(/^DATABASE_URL=.*$/m, line.trimEnd()), 'utf8')
    if (!base.includes('DATABASE_URL=')) await appendFile(path, line, 'utf8')
    return
  }

  const current = await readFile(path, 'utf8')
  await writeFile(
    path,
    current.includes('DATABASE_URL=')
      ? current.replace(/^DATABASE_URL=.*$/m, line.trimEnd())
      : current + line,
    'utf8',
  )
}

/**
 * Verifie que le `.env` est bien ignore par git.
 *
 * Un `.env` versionne est une fuite d'identifiants qui arrive par oubli, et
 * qu'on ne rattrape pas : une fois pousse, le secret est a faire tourner, pas
 * a supprimer de l'historique.
 *
 * @returns Un avertissement, ou `undefined` si tout va bien.
 */
export async function assertEnvIgnored(target: string): Promise<string | undefined> {
  const path = join(target, '.gitignore')
  if (!existsSync(path)) {
    return "Aucun .gitignore : le fichier .env risque d'etre versionne."
  }

  const content = await readFile(path, 'utf8')
  const ignored = content
    .split('\n')
    .map((line) => line.trim())
    .some((line) => line === '.env' || line === '.env*' || line === '*.env')

  return ignored
    ? undefined
    : '.env ne figure pas dans le .gitignore : vos identifiants risquent d etre versionnes.'
}

/** Ce que la plateforme dira quand elle existera. */
export const PROVIDER_PENDING = [
  'Le provisionnement passe par @odoro-cli/cloud-sdk, installe a part :',
  '',
  '  npm install --save-dev @odoro-cli/cloud-sdk',
  '  odoro db:login',
  '  odoro db:create --env production',
  '',
  'Il ne vient pas avec odoro : ce binaire est telecharge a chaque creation ' +
    'de projet, et la plupart emploient leur propre base.',
].join('\n')
