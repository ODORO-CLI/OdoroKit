/**
 * The subscription point for route changes.
 *
 * ## Why the router exposes an event rather than an integration
 *
 * `@odoro-cli/engine` must destroy the scroll triggers of the page that is
 * leaving, and refresh the positions **after** the new page has rendered.
 * Without that, the triggers keep the positions of the old page: the
 * animations tied to scrolling fire too early or too late, and the defect
 * disappears on reload — which makes it almost impossible to attribute to the
 * navigation.
 *
 * The router does not know the engine, and must not know it. It only
 * announces that a navigation is happening, before and after. The wiring is
 * done on the other side.
 *
 * ## Why two moments and not one
 *
 * `before` arrives while the old page is still mounted: it is the only
 * instant where what belongs to it can be released. `after` arrives once the
 * new page has rendered: it is the only instant where measuring makes sense.
 *
 * A single event would force the subscriber to guess in which state the
 * document is, and it would guess wrong.
 *
 * ## What `after` does not guarantee
 *
 * It is emitted after the render, not after the images and the fonts have
 * loaded. An image that arrives afterwards shifts the layout and invalidates
 * the measured positions. It is up to the subscriber to wait for what it must
 * wait for — `@odoro-cli/engine` does it in `onRouteChange`, and that is why
 * this function exists on its side rather than here.
 *
 * @module
 */

/** The moment of a navigation. */
export type NavigationPhase =
  /** The old page is still mounted. */
  | 'before'
  /** The new page has rendered. */
  | 'after'

/** What a subscriber receives. */
export interface NavigationEvent {
  readonly phase: NavigationPhase
  /** Path being left. Equals the current path on the very first render. */
  readonly from: string
  /** Path being reached. */
  readonly to: string
}

/** A subscriber. */
export type NavigationListener = (event: NavigationEvent) => void

const listeners = new Set<NavigationListener>()

/**
 * Subscribes a listener to the route changes.
 *
 * @returns What is needed to unsubscribe.
 *
 * @example
 * // On the engine side, when the provider mounts:
 * const off = onNavigation((event) => {
 *   if (event.phase === 'before') killScrollTriggers()
 *   else void onRouteChange()
 * })
 */
export function onNavigation(listener: NavigationListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Emits a navigation event.
 *
 * Called by the router. A subscriber that fails must not prevent the others
 * from being notified, nor interrupt the navigation: the error is reported
 * and the walk carries on.
 */
export function emitNavigation(event: NavigationEvent): void {
  for (const listener of listeners) {
    try {
      listener(event)
    } catch (cause) {
      console.error('[odoro] a navigation subscriber failed', cause)
    }
  }
}

/** Clears the subscriptions. Reserved for tests. */
export function resetNavigationListeners(): void {
  listeners.clear()
}
