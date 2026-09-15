/**
 * Diagnostics panel.
 *
 * Enabled by `?odoro-debug` in the URL. Without this tool, understanding why a
 * scene struggles on a laptop is guesswork: you can see that it is slow, but
 * not how many surfaces are open, nor whether the quality has already been
 * downgraded, nor how many subscribers run on every frame.
 *
 * The panel is **read only**. It offers no way to compose an animation: it is
 * a measuring instrument, not an editor.
 *
 * It only mounts on explicit request, and its cost is nil when it is absent:
 * the component returns `null` before any subscription.
 *
 * @module
 */

import { type CSSProperties, type ReactElement, useEffect, useState } from 'react'

import { clock } from './clock.js'
import { useEngine, useMotionState } from './context.jsx'
import { type Resource, registry } from './registry.js'

/** URL parameter that enables the panel. */
export const DEBUG_PARAM = 'odoro-debug'

/**
 * Tells whether the diagnostics are requested in the current URL.
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

/** Snapshot shown by the panel. */
export interface DebugSnapshot {
  /** Frames per second, measured continuously. */
  readonly fps: number
  /** Number of the current frame. */
  readonly frame: number
  /** Subscribers to the loop, from the highest priority to the lowest. */
  readonly subscribers: readonly { name: string; priority: number; active: boolean }[]
  /** Live resources. */
  readonly resources: readonly Resource[]
}

/** Takes a reading of the current engine state. */
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

/** A key / value row. */
function Row({ label, value }: { label: string; value: string | number }): ReactElement {
  return (
    <div style={ROW}>
      <span style={MUTED}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/** Properties of {@link OdoroDebugPanel}. */
export interface OdoroDebugPanelProps {
  /**
   * Forces the display, without going through the URL. Useful for a
   * screenshot or a documentation page.
   */
  force?: boolean
  /** Refresh period, in milliseconds. @defaultValue 500 */
  interval?: number
}

/**
 * Displays the state of the engine.
 *
 * The panel refreshes twice per second rather than on every frame: a measuring
 * instrument that weighs on what it measures no longer measures anything.
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

      <Row label="frames per second" value={snapshot.fps} />
      <Row label="frame" value={snapshot.frame} />
      <Row label="subscribers" value={snapshot.subscribers.length} />
      <Row label="loop" value={clock.isPaused ? 'suspended' : 'active'} />

      <div style={SECTION}>
        <Row label="quality" value={motion.quality} />
        <Row label="motion" value={motion.reduced ? 'reduced' : 'full'} />
        <Row label="tab" value={motion.visible ? 'visible' : 'hidden'} />
        <Row label="reason" value={motion.reason} />
      </div>

      <div style={SECTION}>
        <Row label="surfaces" value={`${surfaces.length} / ${engine.maxSurfaces}`} />
        <Row label="timelines" value={registry.count('timeline')} />
        <Row label="triggers" value={registry.count('scroll-trigger')} />
      </div>

      {snapshot.subscribers.length === 0 ? null : (
        <div style={SECTION}>
          <p style={TITLE}>loop</p>
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
          <p style={TITLE}>resources</p>
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
