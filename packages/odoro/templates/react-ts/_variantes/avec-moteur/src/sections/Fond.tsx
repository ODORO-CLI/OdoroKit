/**
 * Le fond decoratif, en surface WebGL.
 *
 * Cette version remplace le degre statique parce que le moteur a ete retenu a
 * la creation. Le reste de la page est inchange : elle place `<Fond />` et ne
 * sait pas ce qu'il y a derriere.
 *
 * ## Ce que le moteur apporte, et qu'un degrade ne peut pas
 *
 * **Un arbitre.** La surface est demandee au gestionnaire du moteur, qui la
 * refuse si le navigateur n'a pas WebGL, si trop de contextes sont deja
 * ouverts, ou si l'appareil ne suivrait pas. Le refus est une valeur, pas une
 * exception : on affiche alors le degrade, et la page tient.
 *
 * **Le mouvement reduit.** Sous cette preference, rien n'est monte du tout :
 * le fond n'apportait que son mouvement, et la carte graphique n'a pas a
 * s'allumer pour un visiteur qui a demande le calme.
 *
 * **Les couleurs du theme.** Les teintes sont lues dans les jetons, pas
 * ecrites dans le nuanceur. Une bascule clair / sombre les relit, et changer
 * `--o-palette-brand-500` repeint le fond sans toucher a ce fichier.
 *
 * ## Pourquoi des styles en ligne
 *
 * Ce fichier est pose quel que soit le reste : un projet qui a decoche les
 * bibliotheques n'a pas les classes `o-*`, et une classe absente ne peint
 * rien — le fond aurait alors une hauteur nulle, sans que rien ne le signale.
 * Les quelques regles de placement sont donc ecrites ou elles sont sures.
 *
 * @module
 */

import {
  AURORA_FRAGMENT,
  readTokenColour,
  useMotionState,
  useShaderSurface,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

/** Les jetons lus pour teinter la nappe. */
const TEINTES = ['--o-palette-brand-500', '--o-palette-brand-300', '--o-theme-bg'] as const

/** Le degrade servi tant que la surface n'est pas la — ou pour toujours. */
function Degrade(): ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.28,
        filter: 'blur(64px)',
        background:
          'radial-gradient(60% 60% at 50% 0%, var(--o-palette-brand-500, #f97316), transparent)',
      }}
    />
  )
}

/** Une nappe animee derriere le haut de la page. */
export function Fond(): ReactElement {
  const { quality, reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const [teintes, setTeintes] = useState<readonly ShaderColour[]>([])

  // Relues quand l'hote apparait et quand le theme bascule — ce dernier cas
  // passe par la politique de mouvement, qui se renouvelle a chaque etat.
  useEffect(() => {
    if (hote === null) return
    setTeintes(TEINTES.map((jeton) => readTokenColour(jeton, hote)))
  }, [hote, reduced, quality])

  const uniforms = useMemo(() => {
    const [a, b, c] = teintes
    if (a === undefined || b === undefined || c === undefined) return undefined
    // Le fond du theme domine, la marque n'est qu'un reflet : ces trois
    // couleurs vont dans un melange, et deux teintes de marque sur trois
    // donneraient une nappe orange en pleine page plutot qu'un halo.
    return { uColorA: c, uColorB: c, uColorC: a, uSpeed: 0.1, uScale: 1.4, uOctaves: 3 }
  }, [teintes])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: AURORA_FRAGMENT,
    uniforms: uniforms ?? {},
    name: 'fond-accueil',
  })

  const repli = !ready || refused !== undefined || uniforms === undefined

  return (
    <div
      aria-hidden="true"
      ref={(element) => {
        setHote(element)
        ref.current = element
      }}
      style={{
        position: 'absolute',
        insetInline: 0,
        top: 0,
        height: '42rem',
        overflow: 'hidden',
        pointerEvents: 'none',
        // Un fond decoratif se remarque quand on le cherche, pas avant. A
        // pleine intensite la nappe passe devant le titre qu'elle est censee
        // porter ; a un cinquieme, elle le souligne.
        opacity: 0.2,
        // Le bas se dissout dans la page : une surface qui s'arrete net
        // dessine une ligne horizontale que rien ne justifie.
        maskImage: 'linear-gradient(to bottom, black 45%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent)',
      }}
    >
      {repli ? <Degrade /> : null}
    </div>
  )
}
