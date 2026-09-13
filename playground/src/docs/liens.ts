/**
 * Les adresses hors du site, et les versions publiees.
 *
 * ## Les deux liens
 *
 * Le depot et l organisation npm. L adresse npm est celle de la **page
 * publique** de l organisation, `npmjs.com/org/odoro-cli`, et non celle de ses
 * reglages : `npmjs.com/settings/odoro-cli/packages` demande d etre connecte
 * et membre, et enverrait tout visiteur sur un mur d authentification.
 *
 * ## Pourquoi les versions se rafraichissent
 *
 * `versions.generated.ts` porte ce que le depot annoncait au moment de la
 * construction. C est juste, immediat, et sans reseau — mais ce numero fige le
 * jour de la construction, alors qu une publication peut survenir apres. Le
 * site interroge donc le registre, qui autorise la lecture depuis un
 * navigateur, et remplace ce qu il affiche quand le registre est en avance.
 *
 * La panne est prevue : si le reseau manque, si le registre repond mal, si le
 * visiteur est hors ligne, on garde le socle. Une version legerement en retard
 * vaut mieux qu un trou dans la page.
 *
 * @module
 */

import { useEffect, useState } from 'react'

import { PAQUETS, type PaquetPublie } from './versions.generated.js'

/** Le depot, sur GitHub. */
export const DEPOT = 'https://github.com/ODORO-CLI/OdoroKit'

/** L organisation sur npm, page publique. */
export const NPM = 'https://www.npmjs.com/org/odoro-cli'

/** L adresse de la page d un paquet sur npm. */
export function pageNpm(nom: string): string {
  return `https://www.npmjs.com/package/${nom}`
}

/** Le document abrege d une version, tel que le registre le rend. */
interface Abrege {
  readonly version?: unknown
}

/**
 * Les versions publiees, socle d abord puis registre.
 *
 * @returns Un paquet par entree, dans l ordre du socle.
 *
 * @example
 * const paquets = useVersions()
 * paquets.map((p) => `${p.nom}@${p.version}`)
 */
export function useVersions(): readonly PaquetPublie[] {
  const [paquets, setPaquets] = useState<readonly PaquetPublie[]>(PAQUETS)

  useEffect(() => {
    // Un seul abandon pour toutes les requetes : quitter la page ne doit pas
    // laisser six lectures en cours, ni un `setState` apres demontage.
    const abandon = new AbortController()

    const lire = async (paquet: PaquetPublie): Promise<PaquetPublie> => {
      try {
        const reponse = await fetch(
          `https://registry.npmjs.org/${paquet.nom}/latest`,
          { signal: abandon.signal, headers: { accept: 'application/json' } },
        )
        if (!reponse.ok) return paquet
        const corps = (await reponse.json()) as Abrege
        return typeof corps.version === 'string' && corps.version !== ''
          ? { nom: paquet.nom, version: corps.version }
          : paquet
      } catch {
        // Hors ligne, registre injoignable, reponse illisible : le socle tient.
        return paquet
      }
    }

    void Promise.all(PAQUETS.map(lire)).then((frais) => {
      if (abandon.signal.aborted) return
      // On ne rerend que si quelque chose a bouge : sans ce test, chaque visite
      // provoquait un rendu de plus pour un resultat identique.
      const change = frais.some((p, rang) => p.version !== PAQUETS[rang]?.version)
      if (change) setPaquets(frais)
    })

    return () => {
      abandon.abort()
    }
  }, [])

  return paquets
}

/**
 * La version d un paquet, dans une liste relevee.
 *
 * @param paquets La liste rendue par {@link useVersions}.
 * @param nom Le nom du paquet, portee comprise.
 * @returns La version, ou `undefined` si le paquet n est pas publie.
 */
export function versionDe(
  paquets: readonly PaquetPublie[],
  nom: string,
): string | undefined {
  return paquets.find((p) => p.nom === nom)?.version
}
