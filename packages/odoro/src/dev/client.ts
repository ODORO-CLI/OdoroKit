/**
 * Hot reloading client, served to the browser.
 *
 * The server -> client channel is a native event stream (`EventSource`). It is
 * enough here: hot reloading is a one-way stream, and a native stream frees us
 * from a socket library, reconnects on its own and crosses proxies without
 * configuration.
 *
 * @module
 */

/** Path of the event stream. */
export const HMR_STREAM_PATH = '/@odoro/hmr'

/** Path of the client module. */
export const HMR_CLIENT_PATH = '/@odoro/client'

/** Message pushed by the server towards the client. */
export type HmrMessage =
  | { type: 'connected' }
  | { type: 'update'; updates: { url: string; timestamp: number }[] }
  | { type: 'full-reload'; path?: string }
  | { type: 'error'; message: string; file?: string }

/**
 * Source of the client module. It is served as it is: this is browser
 * JavaScript, never compiled nor bundled.
 */
export const HMR_CLIENT_SOURCE = String.raw`
const OVERLAY_ID = 'odoro-error-overlay'

/** Hot contexts, by module URL. */
const contexts = new Map()

/**
 * Creates the context exposed to a module through import.meta.hot.
 * @param {string} url
 */
export function createHotContext(url) {
  const existing = contexts.get(url)
  if (existing) {
    // Reload of the same module: the callbacks of the previous version are run
    // then forgotten.
    for (const callback of existing.disposers) {
      try {
        callback(existing.data)
      } catch (cause) {
        console.error('[odoro] cleanup failed for', url, cause)
      }
    }
    existing.disposers = []
    existing.acceptors = []
    return existing.api
  }

  const context = { acceptors: [], disposers: [], data: {} }

  context.api = {
    get data() {
      return context.data
    },
    accept(callback) {
      context.acceptors.push(typeof callback === 'function' ? callback : () => {})
    },
    dispose(callback) {
      context.disposers.push(callback)
    },
    invalidate() {
      location.reload()
    },
  }

  contexts.set(url, context)
  return context.api
}

/**
 * Reloads a module and notifies those that accept it.
 * @param {string} url
 * @param {number} timestamp
 */
async function applyUpdate(url, timestamp) {
  const context = contexts.get(url)
  if (!context || context.acceptors.length === 0) {
    location.reload()
    return
  }

  const acceptors = [...context.acceptors]
  try {
    const module = await import(url + (url.includes('?') ? '&' : '?') + 't=' + timestamp)
    for (const accept of acceptors) accept(module)
    console.log('[odoro] updated', url)
  } catch (cause) {
    console.error('[odoro] update failed for', url, cause)
    location.reload()
  }
}

/** Removes the error overlay when it is displayed. */
function clearOverlay() {
  document.getElementById(OVERLAY_ID)?.remove()
}

/**
 * Displays a build error on top of the page.
 * @param {string} message
 * @param {string | undefined} file
 */
function showOverlay(message, file) {
  clearOverlay()
  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  overlay.setAttribute('role', 'alert')
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'padding:2rem',
    'overflow:auto',
    'background:rgba(10,10,16,0.94)',
    'color:#ffd7d7',
    'font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
    'white-space:pre-wrap',
  ].join(';')

  const title = document.createElement('div')
  title.textContent = file ? 'Build error — ' + file : 'Build error'
  title.style.cssText = 'font-weight:700;margin-bottom:1rem;color:#ff9d9d'

  const body = document.createElement('div')
  body.textContent = message

  const hint = document.createElement('div')
  hint.textContent = 'Fix the file: this overlay will disappear on its own.'
  hint.style.cssText = 'margin-top:1.5rem;opacity:0.6'

  overlay.append(title, body, hint)
  document.body.appendChild(overlay)
}

const source = new EventSource('__HMR_STREAM_PATH__')

source.addEventListener('message', (event) => {
  const payload = JSON.parse(event.data)

  switch (payload.type) {
    case 'connected':
      console.log('[odoro] hot reloading connected')
      break
    case 'update':
      clearOverlay()
      for (const update of payload.updates) {
        void applyUpdate(update.url, update.timestamp)
      }
      break
    case 'full-reload':
      location.reload()
      break
    case 'error':
      showOverlay(payload.message, payload.file)
      break
    default:
      break
  }
})

source.addEventListener('error', () => {
  // EventSource reconnects on its own; we only report a prolonged loss.
  if (source.readyState === EventSource.CLOSED) {
    console.warn('[odoro] hot reloading connection lost')
  }
})
`.replace('__HMR_STREAM_PATH__', HMR_STREAM_PATH)

/**
 * Snippet injected at the top of every compiled module, giving it access to the
 * hot reloading API.
 *
 * @example
 * hotPreamble('/src/App.tsx')
 */
export function hotPreamble(url: string): string {
  return `import { createHotContext as __odoroHot } from ${JSON.stringify(
    HMR_CLIENT_PATH,
  )}\nimport.meta.hot = __odoroHot(${JSON.stringify(url)})\n`
}
