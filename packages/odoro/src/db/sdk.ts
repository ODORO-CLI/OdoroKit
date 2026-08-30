/**
 * Le chargement du SDK de la plateforme.
 *
 * ## Pourquoi il n'est pas une dependance
 *
 * Ce binaire est telecharge a chaque `npm create odoro`. Chaque dependance qui
 * s'y ajoute est payee par tous ceux qui echafaudent un projet, y compris ceux
 * qui n'emploieront jamais la plateforme — c'est-a-dire la majorite.
 *
 * `@odoro-cli/cloud-sdk` est donc importe **dynamiquement**, et seulement quand une
 * commande `db:*` est appelee. Son absence n'est pas une panne : c'est l'etat
 * normal d'un projet qui emploie sa propre base.
 *
 * ## Ce que l'absence doit produire
 *
 * Pas une trace d'execution sur un module introuvable. Une phrase qui dit quel
 * paquet installer, et pourquoi la commande en a besoin. C'est la difference
 * entre une commande qu'on peut employer et une commande qui echoue sur un
 * message que personne ne rattache a une installation manquante.
 *
 * @module
 */

/** Le paquet qui porte les commandes de base. */
export const SDK_PACKAGE = '@odoro-cli/cloud-sdk'

/** Ce qu'un chargement rend. */
export type SdkLoad =
  | { readonly ok: true; readonly sdk: CloudSdk }
  | { readonly ok: false; readonly reason: string }

/**
 * La surface du SDK que ce CLI emploie.
 *
 * Decrite ici plutot qu'importee : importer les types ferait du paquet une
 * dependance de compilation, et ce depot n'en a pas — la communication entre
 * les deux depots passe par le paquet publie, dans un seul sens.
 */
export interface CloudSdk {
  createClient: (config: { baseUrl: string; token: string }) => {
    databases: {
      list: (input: { environmentId?: string }) => Promise<{
        databases: readonly { id: string; state: string; region: string }[]
      }>
      createAndWait: (
        input: { idempotencyKey: string; environmentId: string; region: string },
        options?: { signal?: AbortSignal },
      ) => Promise<{ subject?: string; result?: unknown }>
      branchAndWait: (
        input: {
          idempotencyKey: string
          parentEnvironmentId: string
          name: string
          anonymization: readonly { table: string; column: string; strategy: string }[]
        },
        options?: { signal?: AbortSignal },
      ) => Promise<{ subject?: string; result?: unknown }>
    }
    credentials: {
      rotate: (input: { databaseId: string }) => Promise<{
        credentialId: string
        connectionString: string
      }>
    }
  }
  isApiError: (value: unknown, kind?: string) => boolean
}

/**
 * Charge le SDK, ou explique ce qui manque.
 *
 * @example
 * const load = await loadSdk()
 * if (!load.ok) {
 *   log.error(load.reason)
 *   return 1
 * }
 */
export async function loadSdk(): Promise<SdkLoad> {
  try {
    // Le specificateur passe par une variable : ecrit en clair, un empaqueteur
    // tenterait de le resoudre a la compilation et echouerait sur un paquet
    // volontairement absent.
    const specifier = SDK_PACKAGE
    const sdk = (await import(specifier)) as CloudSdk
    return { ok: true, sdk }
  } catch {
    return {
      ok: false,
      reason:
        `Cette commande a besoin de ${SDK_PACKAGE}, qui n'est pas installe.\n` +
        `\n` +
        `  npm install --save-dev ${SDK_PACKAGE}\n` +
        `\n` +
        `Il n'est pas fourni avec odoro : ce binaire est telecharge a chaque\n` +
        `creation de projet, et la plupart n'emploient pas la plateforme.`,
    }
  }
}
