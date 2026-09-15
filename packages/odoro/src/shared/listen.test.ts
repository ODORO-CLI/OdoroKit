import { createServer, type Server } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'

import { listen } from './listen.js'

/** The servers opened by a test, closed whatever happens. */
const opened: Server[] = []

/** A server that answers nothing: only its listening matters here. */
function server(): Server {
  const s = createServer(() => undefined)
  opened.push(s)
  return s
}

afterEach(async () => {
  await Promise.all(
    opened.splice(0).map(
      (s) =>
        new Promise<void>((done) => {
          if (!s.listening) {
            done()
            return
          }
          s.close(() => {
            done()
          })
        }),
    ),
  )
})

describe('listen', () => {
  it('takes the requested port when it is free', async () => {
    // Port 0: the system assigns one, which avoids depending on a fixed number
    // another suite could be holding.
    const { port, requested } = await listen(server(), 0, '127.0.0.1')
    expect(port).toBeGreaterThan(0)
    expect(requested).toBeUndefined()
  })

  it('slides to the next port when the first one is taken', async () => {
    const first = server()
    const { port: busy } = await listen(first, 0, '127.0.0.1')

    const { port, requested } = await listen(server(), busy, '127.0.0.1')

    expect(port).toBe(busy + 1)
    // The requested port is returned: that is what lets it be said on screen.
    expect(requested).toBe(busy)
  })

  it('slides several places when it has to', async () => {
    const a = server()
    const { port: base } = await listen(a, 0, '127.0.0.1')
    const b = server()
    await listen(b, base + 1, '127.0.0.1')

    const { port } = await listen(server(), base, '127.0.0.1')
    expect(port).toBe(base + 2)
  })

  it('gives up after the number of attempts, naming the range', async () => {
    const taken = server()
    const { port } = await listen(taken, 0, '127.0.0.1')

    // A single attempt: the port is taken, there is nowhere to slide to.
    await expect(listen(server(), port, '127.0.0.1', 1)).rejects.toThrow(
      new RegExp(String(port)),
    )
  })

  it('does not catch an error that is not a port conflict', async () => {
    // An address that does not exist on the machine: this is a configuration
    // error, and sliding would hide it.
    await expect(listen(server(), 0, '203.0.113.1')).rejects.toThrow()
  })
})
