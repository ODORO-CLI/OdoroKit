/**
 * The media types, and the byte ranges.
 *
 * ## What these tests are guarding against
 *
 * A file served under the wrong type, or a range request answered with the
 * whole file, breaks nothing that anyone can see in a console. A `<video>`
 * simply holds its first frame; an `.mp4` served as `application/octet-stream`
 * simply never plays. Both were true of this engine until the day a template
 * whose film is scrubbed by scroll was ported onto it, and both looked like a
 * defect of the template.
 *
 * So the range arithmetic is tested against the cases a player actually sends
 * — including the suffix form, `bytes=-500`, which asks for the **end** of the
 * file and is the one a reader is most likely to get backwards.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { mimeOf, parseRange } from './static-file.js'

describe('mimeOf', () => {
  it('names the media a landing page is built on', () => {
    expect(mimeOf('/x/film.mp4')).toBe('video/mp4')
    expect(mimeOf('/x/film.webm')).toBe('video/webm')
    expect(mimeOf('/x/voix.mp3')).toBe('audio/mpeg')
    expect(mimeOf('/x/marque.glb')).toBe('model/gltf-binary')
    expect(mimeOf('/x/photo.avif')).toBe('image/avif')
  })

  it('reads the extension whatever its case', () => {
    expect(mimeOf('/x/FILM.MP4')).toBe('video/mp4')
  })

  it('falls back to the neutral type, and only there', () => {
    expect(mimeOf('/x/inconnu.zzz')).toBe('application/octet-stream')
  })
})

describe('parseRange', () => {
  const SIZE = 1000

  it('answers nothing when nothing is asked', () => {
    expect(parseRange(undefined, SIZE)).toBeNull()
    expect(parseRange('bytes=-', SIZE)).toBeNull()
    expect(parseRange('octets=0-10', SIZE)).toBeNull()
  })

  it('reads the ordinary form', () => {
    expect(parseRange('bytes=0-99', SIZE)).toEqual({ start: 0, end: 99 })
    expect(parseRange('bytes=500-599', SIZE)).toEqual({ start: 500, end: 599 })
  })

  it('reads an open end as everything that follows', () => {
    expect(parseRange('bytes=900-', SIZE)).toEqual({ start: 900, end: 999 })
  })

  it('clamps an end beyond the file rather than refusing it', () => {
    expect(parseRange('bytes=900-5000', SIZE)).toEqual({ start: 900, end: 999 })
  })

  /*
   * `bytes=-500` is the suffix form: the last five hundred bytes. Read as a
   * start of zero it hands a player the opening of the file when it asked for
   * the end — a seek that lands nowhere, with no error anywhere.
   */
  it('reads the suffix form as the end of the file', () => {
    expect(parseRange('bytes=-500', SIZE)).toEqual({ start: 500, end: 999 })
  })

  it('clamps a suffix longer than the file to the whole of it', () => {
    expect(parseRange('bytes=-5000', SIZE)).toEqual({ start: 0, end: 999 })
  })

  it('refuses a start past the end, and a reversed pair', () => {
    expect(parseRange('bytes=1000-1200', SIZE)).toBe('unsatisfiable')
    expect(parseRange('bytes=600-500', SIZE)).toBe('unsatisfiable')
    expect(parseRange('bytes=-0', SIZE)).toBe('unsatisfiable')
  })
})
