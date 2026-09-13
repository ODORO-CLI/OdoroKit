/**
 * Le passage d'une page de documentation a la suivante.
 *
 * ## Deux facons d'avancer, la meme suite
 *
 * Les pages de la documentation forment une suite : celle de la colonne, a
 * plat, categorie apres categorie. Ce module en tire deux choses.
 *
 * 1. **Un pied de page** qui montre la precedente et la suivante, avec leur
 *    categorie. C'est ce qui manque le plus a une documentation qu'on lit
 *    d'un bout a l'autre : sans lui, il faut remonter a la colonne apres
 *    chaque page.
 * 2. **Le passage au defilement** : arrive tout en bas, continuer a defiler
 *    ouvre la suivante ; tout en haut, remonter ouvre la precedente.
 *
 * ## Pourquoi le defilement demande de l'insistance
 *
 * Une navigation qui part au premier cran de molette est une navigation qu'on
 * declenche sans le vouloir — et on perd sa page en croyant lire la fin de
 * celle-ci. Il faut donc **rester au bord** un court instant, puis y pousser
 * l'equivalent de deux ecrans de molette. Les pavés tactiles envoient de tres
 * petits crans en rafale : le seuil est en pixels cumules, pas en nombre
 * d'evenements, et il se vide des qu'on quitte le bord.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowLeft, ArrowRight } from '@odoro-cli/icons/filaire'
import { Link, useLocation, useNavigate } from '@odoro-cli/libs/router'
import { useEffect, useMemo, useRef, type ReactElement } from 'react'

import { ALL_PAGES } from '../registry.js'

/** Pixels de molette a pousser au bord avant que la page ne change. */
const SEUIL = 480

/** Temps a passer au bord avant que le compte ne commence, en millisecondes. */
const PATIENCE = 260

/** Temps mort apres un passage, pour ne pas en enchainer deux. */
const REPOS = 900

/** La page precedente et la suivante, dans l'ordre de la colonne. */
export function voisines(pathname: string): {
  avant: (typeof ALL_PAGES)[number] | undefined
  apres: (typeof ALL_PAGES)[number] | undefined
} {
  const rang = ALL_PAGES.findIndex((page) => page.path === pathname)
  if (rang === -1) return { avant: undefined, apres: undefined }
  return { avant: ALL_PAGES[rang - 1], apres: ALL_PAGES[rang + 1] }
}

/** Une des deux cartes du pied : la categorie, le titre, la fleche. */
function Carte({
  page,
  sens,
}: {
  page: (typeof ALL_PAGES)[number]
  sens: 'avant' | 'apres'
}): ReactElement {
  const versLaSuite = sens === 'apres'
  return (
    <Link
      to={page.path}
      className={`pg-carte o-flex o-min-w-0 o-flex-1 o-flex-col o-gap-2 o-rounded-2xl o-border-w-1 o-p-6 o-no-underline o-transition-colors ${
        versLaSuite ? 'o-items-end o-text-right' : 'o-items-start'
      }`}
    >
      <span className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        {versLaSuite ? null : <Icon icon={ArrowLeft} size={13} aria-hidden="true" />}
        {versLaSuite ? 'Suivant' : 'Précédent'}
        {versLaSuite ? <Icon icon={ArrowRight} size={13} aria-hidden="true" /> : null}
      </span>
      <span className="o-w-full o-truncate o-text-lg o-font-light o-tracking-tight o-text-zinc-900 dark:o-text-zinc-50">
        {page.title}
      </span>
      <span className="o-w-full o-truncate o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        {page.section}
      </span>
    </Link>
  )
}

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-vitrine-pagination'

/** Ce que les utilitaires ne savent pas ecrire. */
const FEUILLE = [
  '.pg-carte{border-color:var(--o-chrome-filet);',
  'background-color:var(--o-chrome-verre);',
  'transition:border-color 220ms}',
  '.pg-carte:hover{border-color:color-mix(in oklab,var(--o-palette-brand-500) 55%,transparent)}',
  '.pg-filet{background-color:var(--o-chrome-filet)}',
].join('')

/**
 * Le pied de page de navigation, et le passage au defilement.
 *
 * Il ne rend rien sur les routes qui ne sont pas de la documentation : la
 * vitrine et la galerie ne font pas partie de la suite.
 */
export function Pagination(): ReactElement | null {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { avant, apres } = useMemo(() => voisines(pathname), [pathname])

  useEffect(() => {
    if (document.getElementById(STYLE_ID) !== null) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = FEUILLE
    document.head.append(style)
  }, [])

  // Le compte de molette, garde hors du rendu : il change a chaque cran, et
  // rien a l'ecran n'en depend tant que le seuil n'est pas franchi.
  const pousse = useRef(0)
  const auBordDepuis = useRef<number | null>(null)
  const passeA = useRef(0)

  useEffect(() => {
    pousse.current = 0
    auBordDepuis.current = null
  }, [pathname])

  useEffect(() => {
    if (avant === undefined && apres === undefined) return

    const surMolette = (evenement: WheelEvent): void => {
      const maintenant = performance.now()
      if (maintenant - passeA.current < REPOS) return

      const haut = window.scrollY <= 1
      const bas =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      const versLeBas = evenement.deltaY > 0
      const auBord = (bas && versLeBas) || (haut && !versLeBas)

      if (!auBord) {
        pousse.current = 0
        auBordDepuis.current = null
        return
      }

      // On attend un instant au bord avant de compter : sinon l'elan du
      // defilement qui vient de s'arreter suffirait a tourner la page.
      auBordDepuis.current ??= maintenant
      if (maintenant - auBordDepuis.current < PATIENCE) return

      pousse.current += Math.abs(evenement.deltaY)
      if (pousse.current < SEUIL) return

      const cible = versLeBas ? apres : avant
      if (cible === undefined) return
      pousse.current = 0
      auBordDepuis.current = null
      passeA.current = maintenant
      navigate(cible.path)
    }

    window.addEventListener('wheel', surMolette, { passive: true })
    return () => {
      window.removeEventListener('wheel', surMolette)
    }
  }, [avant, apres, navigate])

  if (avant === undefined && apres === undefined) return null

  return (
    <nav aria-label="Pages voisines" className="o-mt-24 o-flex o-flex-col o-gap-6">
      <span aria-hidden="true" className="pg-filet o-h-px o-w-full" />
      <div className="o-flex o-flex-col o-gap-4 sm:o-flex-row">
        {avant === undefined ? <span className="o-flex-1" /> : <Carte page={avant} sens="avant" />}
        {apres === undefined ? <span className="o-flex-1" /> : <Carte page={apres} sens="apres" />}
      </div>
      <p className="o-m-0 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        Continuez à défiler au bord de la page pour passer à la suivante
      </p>
    </nav>
  )
}
