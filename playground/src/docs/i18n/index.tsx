/**
 * La langue du site.
 *
 * ## Pourquoi les dictionnaires se chargent a la demande
 *
 * Trente-deux dictionnaires embarques, c est trente-deux fois le meme texte
 * dans le paquet de chaque visiteur, dont trente et une qu il ne lira jamais.
 * Ils sont donc importes dynamiquement : la source voyage avec la page, les
 * autres arrivent quand on les demande.
 *
 * ## Pourquoi une cle manquante rend le francais
 *
 * Une traduction incomplete est l etat normal d un site vivant : on ajoute une
 * phrase, elle existe dans la langue ou on l ecrit et nulle part ailleurs. Le
 * choix est alors entre montrer la cle — `nav.rechercher`, illisible — et
 * montrer la phrase source. La seconde se lit, et signale d elle-meme ce qui
 * reste a traduire.
 *
 * @module
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { fr } from './fr.js'
import { LANGUE_SOURCE, langueDe, langueInitiale } from './langues.js'

/** Un dictionnaire : les memes cles que la source, ou moins. */
export type Dictionnaire = Partial<typeof fr> & Record<string, string | undefined>

/** La cle ou le choix est garde d une visite a l autre. */
const CLE_STOCKAGE = 'odoro-langue'

/** Ce que le contexte porte. */
interface Contexte {
  readonly code: string
  readonly t: (cle: keyof typeof fr | string, defaut?: string) => string
  readonly choisir: (code: string) => void
}

const ContexteLangue = createContext<Contexte>({
  code: LANGUE_SOURCE,
  t: (cle, defaut) => defaut ?? (fr as Record<string, string>)[cle as string] ?? String(cle),
  choisir: () => undefined,
})

/**
 * Un chargeur par langue, ecrit en clair.
 *
 * La forme naturelle serait `import(`./${code}.js`)`. Elle ne marche pas : un
 * specificateur construit a l execution est invisible au compilateur, qui ne
 * met donc aucun de ces fichiers dans la sortie. Le module ne se chargeait
 * jamais, la promesse echouait en silence, et le site restait en francais
 * quelle que soit la langue choisie — le selecteur changeait `lang` et rien
 * d autre.
 *
 * Trente et une lignes ecrites a la main, donc, et trente et un paquets que le
 * compilateur sait decouper. C est le prix d un import que la machine peut
 * suivre.
 */
const CHARGEURS: Readonly<
  Record<string, () => Promise<{ readonly dictionnaire?: Dictionnaire }>>
> = {
  'en': () => import('./en.js'),
  'es': () => import('./es.js'),
  'de': () => import('./de.js'),
  'it': () => import('./it.js'),
  'pt': () => import('./pt.js'),
  'nl': () => import('./nl.js'),
  'pl': () => import('./pl.js'),
  'ru': () => import('./ru.js'),
  'uk': () => import('./uk.js'),
  'cs': () => import('./cs.js'),
  'sv': () => import('./sv.js'),
  'da': () => import('./da.js'),
  'fi': () => import('./fi.js'),
  'nb': () => import('./nb.js'),
  'el': () => import('./el.js'),
  'ro': () => import('./ro.js'),
  'hu': () => import('./hu.js'),
  'tr': () => import('./tr.js'),
  'ja': () => import('./ja.js'),
  'ko': () => import('./ko.js'),
  'zh': () => import('./zh.js'),
  'zh-TW': () => import('./zh-TW.js'),
  'th': () => import('./th.js'),
  'vi': () => import('./vi.js'),
  'id': () => import('./id.js'),
  'hi': () => import('./hi.js'),
  'bn': () => import('./bn.js'),
  'ar': () => import('./ar.js'),
  'he': () => import('./he.js'),
  'fa': () => import('./fa.js'),
  'sw': () => import('./sw.js'),
}

/** Les dictionnaires deja charges, pour ne pas les redemander. */
const CACHE = new Map<string, Dictionnaire>([[LANGUE_SOURCE, fr]])

/** Le choix garde, quand le stockage veut bien repondre. */
function choixGarde(): string | null {
  try {
    return localStorage.getItem(CLE_STOCKAGE)
  } catch {
    // Navigation privee, stockage refuse : la langue vivra le temps de la visite.
    return null
  }
}

/** Pose la langue du site, et la rend a qui la demande. */
export function FournisseurDeLangue({ children }: { children: ReactNode }): ReactElement {
  const [code, setCode] = useState(LANGUE_SOURCE)
  const [dico, setDico] = useState<Dictionnaire>(fr)

  // Au premier rendu seulement : le serveur ne connait ni le stockage ni les
  // preferences du navigateur, et deviner ici produirait deux rendus
  // differents pour la meme page.
  useEffect(() => {
    const voulue = langueInitiale(choixGarde(), navigator.languages ?? [navigator.language])
    if (voulue !== LANGUE_SOURCE) setCode(voulue)
  }, [])

  useEffect(() => {
    let vivant = true

    const poser = (d: Dictionnaire): void => {
      if (!vivant) return
      setDico(d)
      const langue = langueDe(code)
      document.documentElement.lang = code
      document.documentElement.dir = langue.rtl === true ? 'rtl' : 'ltr'
    }

    const deja = CACHE.get(code)
    if (deja !== undefined) {
      poser(deja)
      return
    }

    const chargeur = CHARGEURS[code]
    if (chargeur === undefined) {
      poser(fr)
      return
    }

    chargeur()
      .then((module) => {
        const d = module.dictionnaire ?? fr
        CACHE.set(code, d)
        poser(d)
      })
      .catch(() => {
        // Un dictionnaire qui ne se charge pas ne doit pas vider la page :
        // la source reste lisible, et c est ce qu on montre.
        poser(fr)
      })

    return () => {
      vivant = false
    }
  }, [code])

  const choisir = useCallback((suivante: string) => {
    setCode(suivante)
    try {
      localStorage.setItem(CLE_STOCKAGE, suivante)
    } catch {
      // Sans stockage, le choix ne survit pas a la visite. Ce n est pas une
      // raison de refuser de changer de langue maintenant.
    }
  }, [])

  const valeur = useMemo<Contexte>(
    () => ({
      code,
      choisir,
      t: (cle, defaut) => {
        const k = cle as string
        return (
          (dico as Record<string, string | undefined>)[k] ??
          defaut ??
          (fr as Record<string, string>)[k] ??
          k
        )
      },
    }),
    [code, dico, choisir],
  )

  return <ContexteLangue.Provider value={valeur}>{children}</ContexteLangue.Provider>
}

/** La traduction d une cle, et de quoi changer de langue. */
export function useLangue(): Contexte {
  return useContext(ContexteLangue)
}

/** Raccourci : seulement la traduction. */
export function useT(): Contexte['t'] {
  return useContext(ContexteLangue).t
}
