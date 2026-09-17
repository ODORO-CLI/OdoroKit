/**
 * A minimal ZIP writer, with no dependency.
 *
 * ## Why write one rather than install one
 *
 * The archive this repository needs is the simplest kind there is: a flat list
 * of files, no encryption, no split volumes, nothing above four gigabytes. The
 * two usual libraries bring a stream abstraction, a promise layer and a
 * hundred kilobytes of code to do what `zlib` already does — and they would be
 * a production dependency of a build script, which is the kind of thing that
 * breaks a deployment eighteen months later.
 *
 * The format is public and stable since 1989. What follows implements the part
 * of it that is actually used: local headers, a central directory, an end
 * record. Deflate comes from `node:zlib`, which is where it already lives.
 *
 * ## What is deliberately not implemented
 *
 * ZIP64. It raises the ceiling above four gigabytes and above 65 535 entries;
 * a template archive holds a few dozen files and a few megabytes. Rather than
 * pretend, {@link createZip} refuses anything that would need it, loudly.
 *
 * @module
 */

import { deflateRawSync } from 'node:zlib'

/** The table CRC-32 reads, built once. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value >>> 0
  }
  return table
})()

/**
 * The CRC-32 of a buffer, as the format defines it.
 *
 * @param bytes The content.
 * @returns The checksum, unsigned.
 */
export function crc32(bytes) {
  let value = 0xffffffff
  for (let index = 0; index < bytes.length; index += 1) {
    value = (value >>> 8) ^ CRC_TABLE[(value ^ bytes[index]) & 0xff]
  }
  return (value ^ 0xffffffff) >>> 0
}

/** Above this, storing the file as-is is cheaper than compressing it badly. */
const ALREADY_COMPRESSED = /\.(jpe?g|png|gif|webp|avif|woff2?|mp4|webm|zip|gz)$/i

/** The DOS date and time the entries carry. */
function dosStamp(date) {
  // Read in UTC: the local getters would give a different stamp on every
  // machine, and an archive that changes without its content changing defeats
  // the point of fixing the date in the first place.
  const time =
    (date.getUTCHours() << 11) |
    (date.getUTCMinutes() << 5) |
    Math.floor(date.getUTCSeconds() / 2)
  const day =
    ((date.getUTCFullYear() - 1980) << 9) |
    ((date.getUTCMonth() + 1) << 5) |
    date.getUTCDate()
  return { time: time & 0xffff, day: day & 0xffff }
}

/**
 * Builds a ZIP archive in memory.
 *
 * @param entries The files, `{ path, data }`; `path` uses forward slashes and
 *   is relative to the root of the archive, `data` is a `Buffer` or a string.
 * @param options `date` sets the timestamp every entry carries — a fixed one
 *   makes the archive reproducible, which is what a build wants.
 * @returns The complete archive.
 */
export function createZip(entries, options = {}) {
  const date = options.date ?? new Date(Date.UTC(2026, 0, 1, 12, 0, 0))
  const { time, day } = dosStamp(date)

  if (entries.length > 0xffff) {
    throw new Error(
      `${String(entries.length)} entries: above 65 535 the format needs ZIP64, which this writer does not implement.`,
    )
  }

  const pieces = []
  const directory = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.path, 'utf8')
    const data = Buffer.isBuffer(entry.data)
      ? entry.data
      : Buffer.from(entry.data, 'utf8')

    if (data.length > 0xffffffff) {
      throw new Error(`${entry.path} is above four gigabytes: ZIP64 would be needed.`)
    }

    // Deflating a JPEG spends time to gain nothing, and sometimes loses. The
    // stored method is the honest answer for anything already compressed.
    const store = ALREADY_COMPRESSED.test(entry.path) || data.length === 0
    const body = store ? data : deflateRawSync(data, { level: 9 })
    // Compression that grows the file is a failure of compression, not a
    // reason to ship the larger of the two.
    const deflated = !store && body.length < data.length
    const payload = deflated ? body : data
    const method = deflated ? 8 : 0
    const sum = crc32(data)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4) // version needed
    // Bit 11 says the name is UTF-8. Without it an accented path is read
    // through the archiver's local code page, which differs per machine.
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(day, 12)
    local.writeUInt32LE(sum, 14)
    local.writeUInt32LE(payload.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)

    pieces.push(local, name, payload)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4) // version made by
    central.writeUInt16LE(20, 6) // version needed
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(method, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(day, 14)
    central.writeUInt32LE(sum, 16)
    central.writeUInt32LE(payload.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30) // extra
    central.writeUInt16LE(0, 32) // comment
    central.writeUInt16LE(0, 34) // disk
    central.writeUInt16LE(0, 36) // internal attributes
    // 0o644, in the high half, the way Unix archivers write it.
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38)
    central.writeUInt32LE(offset, 42)

    directory.push(central, name)
    offset += local.length + name.length + payload.length
  }

  const catalogue = Buffer.concat(directory)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(catalogue.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)

  return Buffer.concat([...pieces, catalogue, end])
}
