/**
 * Serving a file from disk, with the media types and the byte ranges.
 *
 * ## Why this exists rather than two `createReadStream().pipe()`
 *
 * The development server and the preview server each had their own table of
 * media types and their own way of answering with a file. Neither knew what an
 * `.mp4` was, and neither answered a byte range.
 *
 * Those two gaps are one bug, and it is not a small one. A `<video>` that is
 * scrubbed by scroll — the spine of a whole family of landing pages — asks for
 * the middle of the file before it asks for the beginning. Served a plain
 * `200` with no `Accept-Ranges`, the browser cannot seek: it holds the first
 * frame and stays there, with nothing in the console. The template looks
 * broken and the server looks fine.
 *
 * Production never showed it, because nginx answers ranges. Only the two
 * servers a developer actually works against did — which is the worst place
 * for a gap of this kind to hide.
 *
 * @module
 */

import { createReadStream, statSync } from 'node:fs'
import type { ServerResponse } from 'node:http'
import { extname } from 'node:path'

/**
 * Media types served from disk.
 *
 * A type that is missing here is answered as `application/octet-stream`, and
 * a browser refuses to play, display or execute most of what it receives under
 * that name. The list is therefore the one that matters, not a short one.
 */
export const MIME: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.markdown': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',

  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',

  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',

  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ogv': 'video/ogg',

  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.oga': 'audio/ogg',

  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
}

/** The media type of a path, or the neutral one. */
export function mimeOf(file: string): string {
  return MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'
}

/**
 * The byte range a request asks for, or `null`.
 *
 * Only the single-range form is answered. The specification allows a list, and
 * no browser sends one for media playback; answering a list would mean a
 * multipart body for a case that does not arise.
 *
 * @param header The raw `Range` header.
 * @param size The size of the file, in bytes.
 * @returns The inclusive bounds, `'unsatisfiable'` when the range falls
 *   outside the file, or `null` when there is nothing to honour.
 */
export function parseRange(
  header: string | undefined,
  size: number,
): { readonly start: number; readonly end: number } | 'unsatisfiable' | null {
  if (header === undefined) return null

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (match === null) return null

  const [, rawStart, rawEnd] = match
  if (rawStart === '' && rawEnd === '') return null

  // `bytes=-500` asks for the **last** five hundred bytes, not for the first
  // five hundred. Reading it the other way hands the player the opening of the
  // file when it asked for the end, and the seek lands nowhere.
  if (rawStart === '') {
    const length = Number(rawEnd)
    if (!Number.isFinite(length) || length <= 0) return 'unsatisfiable'
    return { start: Math.max(0, size - length), end: size - 1 }
  }

  const start = Number(rawStart)
  if (!Number.isFinite(start) || start >= size) return 'unsatisfiable'

  const end = rawEnd === '' ? size - 1 : Math.min(Number(rawEnd), size - 1)
  if (!Number.isFinite(end) || end < start) return 'unsatisfiable'

  return { start, end }
}

/** What {@link sendFile} adds to the response beyond the type and the range. */
export interface SendOptions {
  /** Value of `Cache-Control`. */
  readonly cacheControl?: string
  /** The `Range` header of the request, when there is one. */
  readonly range?: string | undefined
  /** `true` answers the headers alone, for a `HEAD`. */
  readonly headOnly?: boolean
}

/**
 * Answers with a file from disk.
 *
 * `Accept-Ranges` is announced on every file, not only on the ones asked for
 * in parts: a player decides whether it can seek by reading that header on the
 * first response, before it has any reason to ask for a range.
 *
 * @param response The response to write to.
 * @param file Absolute path of an existing file.
 * @param options Cache policy, and the request's `Range` when it carries one.
 */
export function sendFile(
  response: ServerResponse,
  file: string,
  options: SendOptions = {},
): void {
  const size = statSync(file).size
  const type = mimeOf(file)
  const cacheControl = options.cacheControl ?? 'no-cache'
  const range = parseRange(options.range, size)

  if (range === 'unsatisfiable') {
    response.writeHead(416, {
      'Content-Range': `bytes */${String(size)}`,
      'Accept-Ranges': 'bytes',
      'Content-Type': 'text/plain; charset=utf-8',
    })
    response.end('Range not satisfiable')
    return
  }

  if (range === null) {
    response.writeHead(200, {
      'Content-Type': type,
      'Content-Length': String(size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': cacheControl,
    })
    if (options.headOnly === true) {
      response.end()
      return
    }
    createReadStream(file).pipe(response)
    return
  }

  response.writeHead(206, {
    'Content-Type': type,
    'Content-Length': String(range.end - range.start + 1),
    'Content-Range': `bytes ${String(range.start)}-${String(range.end)}/${String(size)}`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
  })
  if (options.headOnly === true) {
    response.end()
    return
  }
  createReadStream(file, { start: range.start, end: range.end }).pipe(response)
}
