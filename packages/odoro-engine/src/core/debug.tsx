/**
 * Panneau de diagnostic.
 *
 * Activable par `?odoro-debug` dans l'URL. Sans cet outil, comprendre pourquoi
 * une scene rame sur un portable releve de la divination : on voit que c'est
 * lent, on ne voit ni combien de surfaces sont ouvertes, ni si la qualite a
 * deja retrograde, ni combien d'abonnes tournent a chaque image.
 *
 * Le panneau est en **lecture seule**. Il n'offre aucun moyen de composer une
 * animation : c'est un instrument de mesure, pas un editeur.
 *
 * Il ne se monte que sur demande explicite, et son cout est nul quand il est
 * absent : le composant rend `null` avant tout abonnement.
 *
 * @module
 */

import { type CSSProperties, type ReactElement, useEffect, useState } from 'react'

import { clock } from './clock.js'
import { useEngine, useMotionState } from './context.jsx'
import { type Resource, registry } from './registry.js'

/** Parametre d'URL qui active le panneau. */
export const DEBUG_PARAM = 'odoro-debug'

/**
 * Indique si le diagnostic est demande dans l'URL courante.
 *
 * @example
 * isDebugRequested('https://site.fr/?odoro-debug') // true
 */
export function isDebugRequested(href?: string): boolean {
  const target =
    href ?? (typeof window === 'undefined' ? undefined : window.location.href)
  if (target === undefined) return false
  try {
    return new URL(target).searchParams.has(DEBUG_PARAM)
  } catch {
    return false
  }
}

/** Instantane affiche par le panneau. */
export interface DebugSnapshot {
  /** Images par seconde, mesurees en continu. */
  readonly fps: number
  /** Numero de l'image courante. */
  readonly frame: number
  /** Abonnes a la boucle, du plus prioritaire au moins prioritaire. */
  readonly subscribers: readonly { name: string; priority: number; active: boolean }[]
  /** Ressources vivantes. */
  readonly resources: readonly Resource[]
}

/** Releve l'etat courant du moteur. */
export function readDebugSnapshot(): DebugSnapshot {
  return {
    fps: clock.fps,
    frame: clock.frame,
    subscribers: clock.inspect(),
    resources: registry.list(),
  }
}

const PANEL: CSSProperties = {
  position: 'fixed',
  bottom: '1rem',
  right: '1rem',
  zIndex: 2147483646,
  maxHeight: '60vh',
  overflow: 'auto',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  background: 'rgba(12, 12, 18, 0.92)',
  color: '#e8e8f0',
  font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  pointerEvents: 'none',
  minWidth: '17rem',
}

const TITLE: CSSProperties = {
  margin: '0 0 0.5rem',
  fontWeight: 700,
  color: '#b9a7ff',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontSize: '10px',
}

const ROW: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1.5rem',
}

const MUTED: CSSProperties = { opacity: 0.55 }

const SECTION: CSSProperties = {
  marginTop: '0.6rem',
  paddingTop: '0.5rem',
  borderTop: '1px solid rgba(255,255,255,0.12)',
}

/** Une ligne clef / valeur. */
function Row({ label, value }: { label: string; value: string | number }): ReactElement {
  return (
    <div style={ROW}>
      <span style={MUTED}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/** Proprietes de {@link OdoroDebugPanel}. */
export interface OdoroDebugPanelProps {
  /**
   * Force l'affichage, sans passer par l'URL. Utile pour une capture ou une
   * page de documentation.
   */
  force?: boolean
  /** Periode de rafraichissement, en millisecondes. @defaultValue 500 */
  interval?: number
}

/**
 * Affiche l'etat du moteur.
 *
 * Le panneau se rafraichit deux fois par seconde plutot qu'a chaque image :
 * un instrument de mesure qui pese sur ce qu'il mesure ne mesure plus rien.
 *
 * @example
 * <OdoroEngine>
 *   <App />
 *   <OdoroDebugPanel />
 * </OdoroEngine>
 */
export function OdoroDebugPanel({
  force = false,
  interval = 500,
}: OdoroDebugPanelProps): ReactElement | null {
  const enabled = force || isDebugRequested()
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null)
  const engine = useEngine('OdoroDebugPanel')
  const motion = useMotionState()

  useEffect(() => {
    if (!enabled) return
    setSnapshot(readDebugSnapshot())
    const timer = setInterval(() => setSnapshot(readDebugSnapshot()), interval)
    return () => clearInterval(timer)
  }, [enabled, interval])

  if (!enabled || snapshot === null) return null

  const surfaces = snapshot.resources.filter((entry) => entry.kind === 'surface')

  return (
    <aside style={PANEL} aria-hidden="true" data-odoro-debug="">
      <p style={TITLE}>odoro</p>

      <Row label="images par seconde" value={snapshot.fps} />
      <Row label="image" value={snapshot.frame} />
      <Row label="abonnes" value={snapshot.subscribers.length} />
      <Row label="boucle" value={clock.isPaused ? 'suspendue' : 'active'} />

      <div style={SECTION}>
        <Row label="qualite" value={motion.quality} />
        <Row label="mouvement" value={motion.reduced ? 'reduit' : 'complet'} />
        <Row label="onglet" value={motion.visible ? 'visible' : 'masque'} />
        <Row label="motif" value={motion.reason} />
      </div>

      <div style={SECTION}>
        <Row label="surfaces" value={`${surfaces.length} / ${engine.maxSurfaces}`} />
        <Row label="timelines" value={registry.count('timeline')} />
        <Row label="declencheurs" value={registry.count('scroll-trigger')} />
      </div>

      {snapshot.subscribers.length === 0 ? null : (
        <div style={SECTION}>
          <p style={TITLE}>boucle</p>
          {snapshot.subscribers.map((entry) => (
            <div key={`${entry.name}-${entry.priority}`} style={ROW}>
              <span style={entry.active ? undefined : MUTED}>{entry.name}</span>
              <span style={MUTED}>{entry.priority}</span>
            </div>
          ))}
        </div>
      )}

      {snapshot.resources.length === 0 ? null : (
        <div style={SECTION}>
          <p style={TITLE}>ressources</p>
          {snapshot.resources.map((entry) => (
            <div key={entry.id} style={ROW}>
              <span>{entry.name}</span>
              <span style={MUTED}>{entry.kind}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
