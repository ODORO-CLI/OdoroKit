/**
 * Une vitrine servie nue, pour etre integree dans un autre site.
 *
 * ## Ce que cette route a de different
 *
 * `/templates/:slug` montre une vitrine **dans** la documentation : barre du
 * site, bandeau de retour, selecteur de palette. Rien de cela n a de sens dans
 * un cadre pose sur le site de quelqu un d autre. `/embed/:slug` rend donc la
 * page, et rien qu elle — la coquille est retiree avant le rendu, dans
 * `App.tsx`, pas masquee apres.
 *
 * ## Pourquoi le cadre garde son propre defilement
 *
 * C est ce qui fait marcher les animations. Une vitrine se joue au defilement :
 * elle observe ce qui entre dans la fenetre. Un cadre etire a la hauteur de son
 * contenu n a plus de fenetre — tout y est visible en permanence, et toutes les
 * animations se declenchent a la premiere image. Le cadre garde donc une
 * hauteur propre et defile pour lui-meme.
 *
 * La hauteur du document est tout de meme annoncee au site hote, par
 * `postMessage` : celui qui veut vraiment etirer son cadre a de quoi le faire,
 * en sachant ce qu il perd.
 *
 * ## Pourquoi cette route est chargee paresseusement
 *
 * Parce qu elle declare, a la portee de son module, que son hote ne pose
 * aucune barre. Importee avec le reste de l application, cette declaration
 * s appliquerait aussi a `/templates/:slug`, qui en pose bel et bien deux : la
 * vitrine y remonterait sous la barre du site. Chargee a la demande, elle ne
 * parle que de la page qu elle sert.
 *
 * ## Ce que l adresse accepte
 *
 * - `?theme=light` ou `?theme=dark` — force le theme. Sans cela, la page suit
 *   la preference du systeme du visiteur, comme le reste.
 * - `?palette=f97316,18181b,fafafa` — remplace les trois couleurs de la
 *   vitrine. Les diezes sont facultatifs ; trois valeurs sont attendues, et une
 *   liste incomplete est ignoree plutot que completee au hasard.
 *
 * @module
 */

import { useParams, useSearchParams } from '@odoro-cli/libs/router'
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type ReactElement,
} from 'react'

import { poserChrome } from '../vitrines/chrome.js'
import { vitrineBySlug, type Vitrine } from '../vitrines/index.js'
import {
  couleursDeJetons,
  variablesDePalette,
  type Couleurs,
} from '../vitrines/palettes.js'

// Ce document ne porte aucune barre : la vitrine occupe l ecran entier.
//
// A poser ici, a la portee du module, et non dans un effet : les vitrines
// lisent cette hauteur pendant leur rendu, et leur module n est telecharge
// qu apres celui-ci. Dans un effet, le premier ecran serait deja peint avec
// les 117 pixels de la documentation, et une bande vide resterait en haut.
poserChrome(0)

/** Composants deja construits, indexes par segment. */
const CHARGES = new Map<string, LazyExoticComponent<ComponentType>>()

/** Le composant d une vitrine, construit une seule fois. */
function composant(vitrine: Vitrine): LazyExoticComponent<ComponentType> {
  const deja = CHARGES.get(vitrine.slug)
  if (deja !== undefined) return deja

  const fait = lazy(vitrine.charger)
  CHARGES.set(vitrine.slug, fait)
  return fait
}

/**
 * Les trois couleurs demandees par l adresse, ou `null`.
 *
 * Une liste de deux valeurs n est pas une palette a laquelle il manque une
 * couleur : c est une adresse mal formee. La completer par un gris donnerait
 * une page a moitie juste, ce qui est plus difficile a diagnostiquer qu une
 * page qui garde ses couleurs d origine.
 */
function paletteDemandee(brut: string | null): Couleurs | null {
  if (brut === null) return null

  const parts = brut
    .split(/[,;]/)
    .map((piece) => piece.trim().replace(/^#/, ''))
    .filter((piece) => piece !== '')

  if (parts.length !== 3) return null
  if (!parts.every((piece) => /^[0-9a-f]{6}$/i.test(piece))) return null

  return [`#${parts[0] ?? ''}`, `#${parts[1] ?? ''}`, `#${parts[2] ?? ''}`]
}

/**
 * Annonce la hauteur du document au site hote.
 *
 * Le message porte le segment de la vitrine : un site qui pose deux cadres doit
 * pouvoir dire lequel vient de grandir.
 */
function useHauteurAnnoncee(slug: string): void {
  const derniere = useRef(0)

  useEffect(() => {
    // Rien a annoncer quand personne n ecoute : la page ouverte directement
    // est son propre parent.
    if (window.parent === window) return

    const annoncer = (): void => {
      const hauteur = Math.ceil(document.documentElement.scrollHeight)
      if (hauteur === derniere.current) return
      derniere.current = hauteur
      window.parent.postMessage(
        { source: 'odoro-embed', type: 'height', slug, hauteur },
        '*',
      )
    }

    annoncer()
    // Les deux elements, et non le seul : `documentElement` suit la fenetre,
    // `body` suit le contenu. Une vitrine qui poserait `height: 100%` sur la
    // racine — certaines pages plein ecran le font — n en verrait plus la
    // boite grandir, et le cadre resterait annonce a la hauteur de depart.
    const observateur = new ResizeObserver(annoncer)
    observateur.observe(document.documentElement)
    observateur.observe(document.body)
    window.addEventListener('load', annoncer)

    return () => {
      observateur.disconnect()
      window.removeEventListener('load', annoncer)
    }
  }, [slug])
}

/** La route d integration. */
export default function EmbedRoute(): ReactElement {
  const params = useParams()
  const [recherche] = useSearchParams()
  const slug = String(params['slug'] ?? '')
  const vitrine = vitrineBySlug(slug)

  const theme = recherche.get('theme')
  // La chaine brute, pas les trois couleurs : une palette analysee est un
  // tableau reconstruit a chaque rendu, dont l identite change sans que sa
  // valeur bouge — et l effet plus bas se rejouerait a chaque image.
  const palette = recherche.get('palette')
  const [couleurs, setCouleurs] = useState<Couleurs>(['#888888', '#888888', '#888888'])

  useHauteurAnnoncee(slug)

  // Le theme est pose sur la racine, hors de l arbre React : c est la seule
  // maniere d atteindre les jetons, qui vivent sur `:root`. Il est retire au
  // demontage pour ne pas laisser un theme force derriere soi.
  useEffect(() => {
    if (theme !== 'light' && theme !== 'dark') return
    const racine = document.documentElement
    const avant = racine.dataset['theme']
    racine.dataset['theme'] = theme
    return () => {
      if (avant === undefined) delete racine.dataset['theme']
      else racine.dataset['theme'] = avant
    }
  }, [theme])

  // Les jetons se resolvent contre le document, donc apres le premier rendu.
  // L adresse, elle, donne deja des hexadecimaux : rien a resoudre.
  useEffect(() => {
    if (vitrine === undefined) return
    setCouleurs(paletteDemandee(palette) ?? couleursDeJetons(vitrine.palette))
  }, [vitrine, palette])

  if (vitrine === undefined) {
    return (
      <div className="o-flex o-min-h-screen o-flex-col o-items-center o-justify-center o-gap-2 o-px-6 o-text-center">
        <p className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">
          Vitrine introuvable
        </p>
        <p className="o-m-0 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Aucun modèle ne porte le nom « {slug} ».
        </p>
      </div>
    )
  }

  const Page = composant(vitrine)

  return (
    <Suspense
      fallback={
        <div className="o-flex o-min-h-screen o-items-center o-justify-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Chargement...
        </div>
      }
    >
      <div data-o-vitrine="" style={variablesDePalette(couleurs)}>
        <Page />
      </div>
    </Suspense>
  )
}
