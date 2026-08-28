/**
 * Client de rechargement a chaud, servi au navigateur.
 *
 * Le canal serveur -> client est un flux d'evenements natif (`EventSource`).
 * Il suffit ici : le rechargement a chaud est un flux a sens unique, et un
 * flux natif s'affranchit d'une bibliotheque de sockets, se reconnecte tout
 * seul et traverse les proxys sans configuration.
 *
 * @module
 */

/** Chemin du flux d'evenements. */
export const HMR_STREAM_PATH = '/@odoro/hmr'

/** Chemin du module client. */
export const HMR_CLIENT_PATH = '/@odoro/client'

/** Message pousse par le serveur vers le client. */
export type HmrMessage =
  | { type: 'connected' }
  | { type: 'update'; updates: { url: string; timestamp: number }[] }
  | { type: 'full-reload'; path?: string }
  | { type: 'error'; message: string; file?: string }

/**
 * Source du module client. Elle est servie telle quelle : c'est du JavaScript
 * de navigateur, jamais compile ni bundle.
 */
export const HMR_CLIENT_SOURCE = String.raw`
const OVERLAY_ID = 'odoro-error-overlay'

/** Contextes de rechargement, par URL de module. */
const contexts = new Map()

/**
 * Cree le contexte expose a un module via import.meta.hot.
 * @param {string} url
 */
export function createHotContext(url) {
  const existing = contexts.get(url)
  if (existing) {
    // Rechargement du meme module : les rappels de la version precedente sont
    // executes puis oublies.
    for (const callback of existing.disposers) {
      try {
        callback(existing.data)
      } catch (cause) {
        console.error('[odoro] echec du nettoyage de', url, cause)
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
 * Recharge un module et notifie ceux qui l'acceptent.
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
    console.log('[odoro] mis a jour', url)
  } catch (cause) {
    console.error('[odoro] echec de la mise a jour de', url, cause)
    location.reload()
  }
}

/** Retire la surcouche d'erreur si elle est affichee. */
function clearOverlay() {
  document.getElementById(OVERLAY_ID)?.remove()
}

/**
 * Affiche une erreur de compilation par-dessus la page.
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
  title.textContent = file ? 'Erreur de compilation — ' + file : 'Erreur de compilation'
  title.style.cssText = 'font-weight:700;margin-bottom:1rem;color:#ff9d9d'

  const body = document.createElement('div')
  body.textContent = message

  const hint = document.createElement('div')
  hint.textContent = 'Corrigez le fichier : cette surcouche disparaitra d elle-meme.'
  hint.style.cssText = 'margin-top:1.5rem;opacity:0.6'

  overlay.append(title, body, hint)
  document.body.appendChild(overlay)
}

const source = new EventSource('__HMR_STREAM_PATH__')

source.addEventListener('message', (event) => {
  const payload = JSON.parse(event.data)

  switch (payload.type) {
    case 'connected':
      console.log('[odoro] rechargement a chaud connecte')
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
  // EventSource se reconnecte seul ; on ne signale que la perte prolongee.
  if (source.readyState === EventSource.CLOSED) {
    console.warn('[odoro] connexion de rechargement perdue')
  }
})
`.replace('__HMR_STREAM_PATH__', HMR_STREAM_PATH)

/**
 * Fragment injecte en tete de chaque module compile, qui lui donne acces a
 * l'API de rechargement a chaud.
 *
 * @example
 * hotPreamble('/src/App.tsx')
 */
export function hotPreamble(url: string): string {
  return `import { createHotContext as __odoroHot } from ${JSON.stringify(
    HMR_CLIENT_PATH,
  )}\nimport.meta.hot = __odoroHot(${JSON.stringify(url)})\n`
}
