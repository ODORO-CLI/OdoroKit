/**
 * The billing port that asks Odoro — without Odoro: the network is replaced,
 * and what the port SENDS is what is checked.
 *
 * The signature vector is the one `@odoro-cli/server-commerce` and the Odoro
 * repository share: the same scheme, the same secret, the same bytes.
 */

import { describe, expect, it } from 'vitest'

import {
  BillingError,
  ODORO_BILLING_PATH,
  odoroBilling,
  signRequest,
} from '../src/index.js'

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

const TEAM = 'c0ffee00-0000-4000-8000-000000000001'

describe('the signature', () => {
  it('🔴 is the vector the repositories share', () => {
    expect(
      signRequest(
        'secret-de-site-pour-le-vecteur',
        1758800000,
        '{"site":"s","commande":"c"}',
      ),
    ).toBe('45c1e6971f5bcbb67ef384b2a33f6731d21d13c8d2156d50121990844316e81a')
  })
})

describe('odoroBilling', () => {
  const port = (fake: typeof fetch, secret = 'un-secret') =>
    odoroBilling({
      origin: 'https://odoro.test',
      site: 'site-1',
      secret,
      fetch: fake,
      now: () => 1758800000,
    })

  it('🔴 asks for a subscription: the plan and the team, NEVER a price', async () => {
    const { sent, fake } = replying(200, { adresse: 'https://paiement.test/a/1' })
    expect(
      await port(fake).subscribe({ teamId: TEAM, planId: 'pro', email: 'a@b.fr' }),
    ).toEqual({
      paymentUrl: 'https://paiement.test/a/1',
    })
    const { url, init } = sent[0]!
    expect(url).toBe(`https://odoro.test${ODORO_BILLING_PATH}`)
    const body = String(init.body)
    expect(JSON.parse(body)).toEqual({
      site: 'site-1',
      genre: 'abonnement',
      equipe: TEAM,
      formule: 'pro',
      courriel: 'a@b.fr',
    })
    expect(body).not.toMatch(/prix|price|cents|montant/i)
    const headers = init.headers as Record<string, string>
    expect(headers['x-odoro-timestamp']).toBe('1758800000')
    expect(headers['x-odoro-signature']).toBe(signRequest('un-secret', 1758800000, body))
  })

  it('asks for a trial, and reads its end', async () => {
    const { sent, fake } = replying(200, { jusqua: '2026-10-10T00:00:00.000Z' })
    expect(await port(fake).startTrial({ teamId: TEAM, planId: 'pro' })).toEqual({
      trialEndsAt: '2026-10-10T00:00:00.000Z',
    })
    expect(JSON.parse(String(sent[0]!.init.body))).toEqual({
      site: 'site-1',
      genre: 'essai',
      equipe: TEAM,
      formule: 'pro',
    })
  })

  it('asks for seats: more is a payment, fewer is done', async () => {
    const plus = replying(200, { adresse: 'https://paiement.test/s/1' })
    expect(
      await port(plus.fake).changeSeats({ teamId: TEAM, seats: 5, email: 'a@b.fr' }),
    ).toEqual({
      paymentUrl: 'https://paiement.test/s/1',
    })
    expect(JSON.parse(String(plus.sent[0]!.init.body))).toMatchObject({
      genre: 'sieges',
      sieges: 5,
    })
    const moins = replying(200, { sieges: 2 })
    expect(
      await port(moins.fake).changeSeats({ teamId: TEAM, seats: 2, email: 'a@b.fr' }),
    ).toEqual({
      seats: 2,
    })
  })

  it('🔴 asks for a cancellation, signed, naming the team only — and reads the end of the period', async () => {
    const { sent, fake } = replying(200, { jusqua: '2026-10-27T00:00:00.000Z' })
    expect(await port(fake).cancel({ teamId: TEAM })).toEqual({
      endsAt: '2026-10-27T00:00:00.000Z',
    })
    const body = String(sent[0]!.init.body)
    expect(JSON.parse(body)).toEqual({
      site: 'site-1',
      genre: 'resiliation',
      equipe: TEAM,
    })
    const headers = sent[0]!.init.headers as Record<string, string>
    expect(headers['x-odoro-signature']).toBe(signRequest('un-secret', 1758800000, body))
    const silent = replying(200, {})
    await expect(port(silent.fake).cancel({ teamId: TEAM })).rejects.toBeInstanceOf(
      BillingError,
    )
  })

  it("passes Odoro's refusal on as it is, and hides a failure", async () => {
    const refused = replying(409, {
      erreur: "L'abonnement n'est pas encore disponible sur ce site.",
    })
    await expect(
      port(refused.fake).subscribe({ teamId: TEAM, planId: 'pro', email: 'a@b.fr' }),
    ).rejects.toThrow("L'abonnement n'est pas encore disponible sur ce site.")
    const broken = replying(500, { erreur: 'stack trace' })
    await expect(
      port(broken.fake).subscribe({ teamId: TEAM, planId: 'pro', email: 'a@b.fr' }),
    ).rejects.toThrow(/Réessayez/)
  })

  it('never follows an address that is not https', async () => {
    const { fake } = replying(200, { adresse: 'javascript:alert(1)' })
    await expect(
      port(fake).subscribe({ teamId: TEAM, planId: 'pro', email: 'a@b.fr' }),
    ).rejects.toBeInstanceOf(BillingError)
  })

  it('sends nothing without a secret', async () => {
    const { sent, fake } = replying(200, {})
    await expect(
      port(fake, '').subscribe({ teamId: TEAM, planId: 'pro', email: 'a@b.fr' }),
    ).rejects.toBeInstanceOf(BillingError)
    expect(sent).toHaveLength(0)
  })
})
