/**
 * The payment port that asks Odoro — without Odoro: the network is replaced,
 * and what the port SENDS is what is checked.
 *
 * The signature vector below is copied, byte for byte, in the Odoro
 * repository's test of the receiving route. If one side changes the scheme
 * without the other, one of the two goes red.
 */

import { describe, expect, it } from 'vitest'

import { ODORO_PAYMENT_PATH, odoroPayment, signRequest } from '../src/index.js'

const ORDER = {
  orderId: 'c0ffee00-0000-4000-8000-000000000001',
  number: 7,
  totalCents: 11800,
  currency: 'EUR',
  email: 'claire@exemple.fr',
}

function replying(status: number, body: unknown) {
  const sent: { url: string; init: RequestInit }[] = []
  const fake = (async (url: string, init: RequestInit) => {
    sent.push({ url, init })
    return await Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    )
  }) as unknown as typeof fetch
  return { sent, fake }
}

describe('the signature', () => {
  it('🔴 is the vector both repositories share', () => {
    expect(
      signRequest(
        'secret-de-site-pour-le-vecteur',
        1758800000,
        '{"site":"s","commande":"c"}',
      ),
    ).toBe('45c1e6971f5bcbb67ef384b2a33f6731d21d13c8d2156d50121990844316e81a')
  })
})

describe('odoroPayment', () => {
  it('🔴 sends the order, signed over the exact body and its timestamp', async () => {
    const { sent, fake } = replying(200, {
      reference: 'ref-1',
      adresse: 'https://paiement.test/p/1',
    })
    const port = odoroPayment({
      origin: 'https://odoro.test',
      site: 'site-1',
      secret: 'un-secret',
      fetch: fake,
      now: () => 1758800000,
    })

    expect(await port.open(ORDER)).toEqual({
      reference: 'ref-1',
      paymentUrl: 'https://paiement.test/p/1',
    })

    const { url, init } = sent[0]!
    expect(url).toBe(`https://odoro.test${ODORO_PAYMENT_PATH}`)
    const headers = init.headers as Record<string, string>
    const body = String(init.body)
    expect(JSON.parse(body)).toEqual({
      site: 'site-1',
      commande: ORDER.orderId,
      numero: 7,
      totalCentimes: 11800,
      devise: 'EUR',
      courriel: 'claire@exemple.fr',
    })
    expect(headers['x-odoro-timestamp']).toBe('1758800000')
    expect(headers['x-odoro-signature']).toBe(signRequest('un-secret', 1758800000, body))
  })

  it("🔴 passes Odoro's refusal on, as it is written for the buyer", async () => {
    const { fake } = replying(409, {
      erreur: "Le paiement n'est pas encore ouvert sur cette boutique.",
    })
    const port = odoroPayment({
      origin: 'https://odoro.test',
      site: 's',
      secret: 'x',
      fetch: fake,
    })
    await expect(port.open(ORDER)).rejects.toThrow(
      "Le paiement n'est pas encore ouvert sur cette boutique.",
    )
  })

  it('🔴 an internal failure, a lost network or no secret say to try again — nothing more', async () => {
    const panne = replying(500, { erreur: 'stack trace interne' })
    await expect(
      odoroPayment({
        origin: 'https://odoro.test',
        site: 's',
        secret: 'x',
        fetch: panne.fake,
      }).open(ORDER),
    ).rejects.toThrow("Le paiement n'a pas pu s'ouvrir. Réessayez dans un instant.")

    const coupe = (async () =>
      await Promise.reject(new TypeError('fetch failed'))) as unknown as typeof fetch
    await expect(
      odoroPayment({
        origin: 'https://odoro.test',
        site: 's',
        secret: 'x',
        fetch: coupe,
      }).open(ORDER),
    ).rejects.toThrow("Le paiement n'a pas pu s'ouvrir.")

    const rien = replying(200, { reference: 'r', adresse: 'a' })
    await expect(
      odoroPayment({
        origin: 'https://odoro.test',
        site: 's',
        secret: '',
        fetch: rien.fake,
      }).open(ORDER),
    ).rejects.toThrow("Le paiement n'a pas pu s'ouvrir.")
    expect(rien.sent).toHaveLength(0)
  })
})
