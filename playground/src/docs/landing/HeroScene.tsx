/**
 * La scene du hero : une constellation de points, un par entree du registre.
 *
 * ## Ce que la scene raconte
 *
 * Chaque point est une entree du registre — le nombre vient du catalogue, il
 * n'est pas choisi pour faire joli. Au repos, les points forment une sphere
 * tenue par une cage filaire. Quand la page defile, la sphere se defait en un
 * anneau : ce qui etait un bloc devient un chemin, et la camera recule pour le
 * suivre. Le defilement n'est pas un declencheur, c'est la variable.
 *
 * ## Pourquoi des points, et pas un modele
 *
 * Deux mille points en un seul appel de dessin coutent moins qu'un maillage
 * de mille faces : aucune lumiere, aucune normale, un shader de six lignes.
 * C'est la scene la plus dense de la page, et elle reste dans le budget d'un
 * fond `medium`.
 *
 * ## Le repli
 *
 * Sans WebGL, sous mouvement reduit, ou si l'arbitre refuse la surface, un
 * degrade fige prend la place. Le hero reste un hero.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useScene } from '@odoro-cli/engine/three'
import { useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'
import { usePoster } from '@/odoro/hooks/usePoster'

/** Proprietes propres a la scene. */
export interface HeroSceneOwnProps {
  /** Nombre d'entrees : un point chacune, multiplie par la densite. */
  count: number
  /** Tokens des deux teintes de points. */
  colors?: readonly [string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type HeroSceneProps = Customisable<HeroSceneOwnProps>

const DEFAULT_COLORS = ['--o-palette-brand-400', '--o-palette-fuchsia-400'] as const
const DEFAULT_POSTER = 'o-bg-gradient-to-b o-from-zinc-950 o-to-brand-950'

/** Points par entree, selon la qualite : la constellation reste dense en `low`. */
const DENSITY: Readonly<Record<'low' | 'medium' | 'high', number>> = {
  low: 4,
  medium: 10,
  high: 14,
}

const VERTEX = /* glsl */ `
attribute vec3 aTarget;
attribute float aSeed;
uniform float uTime;
uniform float uMorph;
uniform float uSize;
varying float vSeed;

void main() {
  vSeed = aSeed;
  // La position est un melange entre la sphere et l'anneau : uMorph vient du
  // defilement, et c'est tout ce que la scene sait de la page.
  vec3 p = mix(position, aTarget, uMorph);
  float w = uTime * 0.6 + aSeed * 6.2831;
  p += 0.05 * vec3(sin(w), cos(w * 1.3), sin(w * 0.7));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.6 + 0.8 * aSeed) * (12.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.12, d);
  vec3 colour = mix(uColorA, uColorB, vSeed);
  gl_FragColor = vec4(colour, alpha * 0.85);
}
`

/** Nombre pseudo-aleatoire stable pour un index : le meme a chaque montage. */
function hash(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * La constellation du hero.
 *
 * @example
 * <section className="o-relative">
 *   <HeroScene count={CATALOGUE.length} className="o-absolute o-inset-0" />
 * </section>
 */
export function HeroScene({
  count,
  colors = DEFAULT_COLORS,
  poster = DEFAULT_POSTER,
  ...rest
}: HeroSceneProps): ReactElement {
  const { quality } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const pointer = usePointerDamped({ host, speed: 2.5, name: 'hero : pointeur' })

  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const morph = useRef(0)

  const { ref, ready, refused } = useScene({
    name: 'hero',
    setup: (scene) => {
      const { three, camera, renderer } = scene
      const total = Math.max(count, 1) * DENSITY[quality]

      const positions = new Float32Array(total * 3)
      const targets = new Float32Array(total * 3)
      const seeds = new Float32Array(total)

      // Sphere de Fibonacci : des points repartis sans les entasser aux poles.
      const golden = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < total; i += 1) {
        const y = 1 - (i / Math.max(total - 1, 1)) * 2
        const r = Math.sqrt(1 - y * y)
        const theta = golden * i
        positions[i * 3] = Math.cos(theta) * r * 1.7
        positions[i * 3 + 1] = y * 1.7
        positions[i * 3 + 2] = Math.sin(theta) * r * 1.7

        // L'anneau d'arrivee : un tore plat, le chemin que la sphere devient.
        const a = hash(i, 1) * Math.PI * 2
        const b = hash(i, 2) * Math.PI * 2
        const tube = 0.35 + hash(i, 3) * 0.3
        const ring = 2.4 + Math.cos(b) * tube
        targets[i * 3] = Math.cos(a) * ring
        targets[i * 3 + 1] = Math.sin(b) * tube * 0.6
        targets[i * 3 + 2] = Math.sin(a) * ring

        seeds[i] = hash(i, 4)
      }

      const geometry = new three.BufferGeometry()
      geometry.setAttribute('position', new three.BufferAttribute(positions, 3))
      geometry.setAttribute('aTarget', new three.BufferAttribute(targets, 3))
      geometry.setAttribute('aSeed', new three.BufferAttribute(seeds, 1))

      const [a, b] = colors.map((token) => readTokenColour(token, host))
      const colourA = new three.Color(a?.[0] ?? 0.5, a?.[1] ?? 0.5, a?.[2] ?? 1)
      const colourB = new three.Color(b?.[0] ?? 0.9, b?.[1] ?? 0.3, b?.[2] ?? 0.9)

      uniforms.current = {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uSize: { value: 2.2 * renderer.getPixelRatio() },
        uColorA: { value: colourA },
        uColorB: { value: colourB },
      }

      const points = new three.Points(
        geometry,
        new three.ShaderMaterial({
          vertexShader: VERTEX,
          fragmentShader: FRAGMENT,
          uniforms: uniforms.current,
          transparent: true,
          depthWrite: false,
          blending: three.AdditiveBlending,
        }),
      )

      // La cage : les aretes d'un icosaedre, qui s'effacent quand la sphere
      // se defait — une structure n'a plus de sens autour d'un anneau.
      const cage = new three.LineSegments(
        new three.EdgesGeometry(new three.IcosahedronGeometry(1.72, 1)),
        new three.LineBasicMaterial({ color: colourA, transparent: true, opacity: 0.16 }),
      )
      cage.name = 'cage'

      const group = new three.Group()
      group.name = 'constellation'
      group.add(points, cage)
      scene.scene.add(group)
      camera.position.z = 4.6
    },

    frame: ({ scene, camera }, { time, delta }) => {
      const group = scene.getObjectByName('constellation')
      if (group === undefined) return

      const time_ = uniforms.current['uTime']
      if (time_ !== undefined) time_.value = time

      // Le defilement pilote la metamorphose : la sphere est entierement
      // devenue anneau quand le hero a quitte l'ecran.
      const height = host?.clientHeight ?? 1
      const target = Math.min(1, Math.max(0, window.scrollY / Math.max(height * 0.85, 1)))
      morph.current += (target - morph.current) * Math.min(1, delta * 4)

      const morph_ = uniforms.current['uMorph']
      if (morph_ !== undefined) morph_.value = morph.current

      const cage = scene.getObjectByName('cage')
      if (cage !== undefined && 'material' in cage) {
        const material = cage.material as { opacity: number }
        material.opacity = 0.16 * (1 - morph.current)
      }

      group.rotation.y += delta * 0.08
      // Le pointeur incline l'ensemble, le defilement le couche : les deux
      // rotations s'ajoutent sans se disputer.
      const lean = pointer.current
      group.rotation.x +=
        (-lean.y * 0.25 + morph.current * 0.9 - group.rotation.x) * delta * 2
      group.rotation.z += (lean.x * 0.15 - group.rotation.z) * delta * 2
      camera.position.z = 4.6 + morph.current * 1.4
      group.position.y = -morph.current * 0.5
    },
  })

  const fallback = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {fallback.visible ? (
        <div style={fallback.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}
