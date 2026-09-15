import { createServer, type Server } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'

import { ecouter } from './ecouter.js'

/** Les serveurs ouverts par un test, fermes quoi qu'il arrive. */
const ouverts: Server[] = []

/** Un serveur qui ne repond rien : seule son ecoute compte ici. */
function serveur(): Server {
  const s = createServer(() => undefined)
  ouverts.push(s)
  return s
}

afterEach(async () => {
  await Promise.all(
    ouverts.splice(0).map(
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

describe('ecouter', () => {
  it('prend le port demande quand il est libre', async () => {
    // Port 0 : le systeme en attribue un, ce qui evite de dependre d'un numero
    // fixe qu'une autre suite pourrait occuper.
    const { port, demande } = await ecouter(serveur(), 0, '127.0.0.1')
    expect(port).toBeGreaterThan(0)
    expect(demande).toBeUndefined()
  })

  it('glisse au port suivant quand le premier est pris', async () => {
    const premier = serveur()
    const { port: occupe } = await ecouter(premier, 0, '127.0.0.1')

    const { port, demande } = await ecouter(serveur(), occupe, '127.0.0.1')

    expect(port).toBe(occupe + 1)
    // Le port demande est rendu : c'est ce qui permet de le dire a l'ecran.
    expect(demande).toBe(occupe)
  })

  it('glisse de plusieurs rangs s il le faut', async () => {
    const a = serveur()
    const { port: base } = await ecouter(a, 0, '127.0.0.1')
    const b = serveur()
    await ecouter(b, base + 1, '127.0.0.1')

    const { port } = await ecouter(serveur(), base, '127.0.0.1')
    expect(port).toBe(base + 2)
  })

  it('abandonne apres le nombre d essais, en disant l intervalle', async () => {
    const pris = serveur()
    const { port } = await ecouter(pris, 0, '127.0.0.1')

    // Un seul essai : le port est pris, il n y a nulle part ou glisser.
    await expect(ecouter(serveur(), port, '127.0.0.1', 1)).rejects.toThrow(
      new RegExp(String(port)),
    )
  })

  it('ne rattrape pas une erreur qui n est pas un conflit de port', async () => {
    // Une adresse qui n existe pas sur la machine : c'est une erreur de
    // configuration, et glisser la masquerait.
    await expect(ecouter(serveur(), 0, '203.0.113.1')).rejects.toThrow()
  })
})
