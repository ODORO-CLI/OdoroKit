/**
 * The arithmetic of a bill, in integer cents.
 *
 * The VECTORS below are copied, value for value, in the Odoro repository's
 * billing test: Odoro charges with its own copy of these functions. If one
 * side changes without the other, one of the two goes red.
 */

import { describe, expect, it } from 'vitest'

import { addedSeatsCents, extraSeatsCents, meterAmountCents } from '../src/index.js'

const DAY = 86_400_000

describe('meterAmountCents', () => {
  const meter = { included: 1000, unitSize: 100, unitPriceCents: 7 }

  it('🔴 the shared vectors', () => {
    expect(meterAmountCents(0, meter)).toBe(0)
    expect(meterAmountCents(1000, meter)).toBe(0)
    expect(meterAmountCents(1001, meter)).toBe(7)
    expect(meterAmountCents(1100, meter)).toBe(7)
    expect(meterAmountCents(1101, meter)).toBe(14)
    expect(meterAmountCents(25_000, meter)).toBe(1680)
    expect(meterAmountCents(3, { included: 0, unitSize: 1, unitPriceCents: 250 })).toBe(
      750,
    )
  })

  it('never takes a fraction: a float or a negative is refused', () => {
    expect(() => meterAmountCents(1.5, meter)).toThrow(RangeError)
    expect(() => meterAmountCents(-1, meter)).toThrow(RangeError)
    expect(() => meterAmountCents(5, { ...meter, unitSize: 0 })).toThrow(RangeError)
  })

  it('stays exact beyond the float range of a product', () => {
    // 9e15 units at 1 cent each: the product is exact in BigInt.
    expect(
      meterAmountCents(9_000_000_000_000_000 - 1, {
        included: 0,
        unitSize: 1,
        unitPriceCents: 1,
      }),
    ).toBe(8_999_999_999_999_999)
  })
})

describe('extraSeatsCents', () => {
  it('🔴 the shared vectors', () => {
    const plan = { seatsIncluded: 3, seatPriceCents: 900 }
    expect(extraSeatsCents(1, plan)).toBe(0)
    expect(extraSeatsCents(3, plan)).toBe(0)
    expect(extraSeatsCents(4, plan)).toBe(900)
    expect(extraSeatsCents(10, plan)).toBe(6300)
  })
})

describe('addedSeatsCents', () => {
  const period = { periodStartMs: 1_000 * DAY, periodEndMs: 1_030 * DAY }

  it('🔴 the shared vectors', () => {
    // Two seats at 9 €, ten days of thirty left: 6 €.
    expect(
      addedSeatsCents({ added: 2, seatPriceCents: 900, ...period, nowMs: 1_020 * DAY }),
    ).toBe(600)
    // One seat at 10 €, one day of thirty left: 33.33… rounded UP.
    expect(
      addedSeatsCents({ added: 1, seatPriceCents: 1000, ...period, nowMs: 1_029 * DAY }),
    ).toBe(34)
    // At the very start: the whole period.
    expect(
      addedSeatsCents({ added: 1, seatPriceCents: 1000, ...period, nowMs: 1_000 * DAY }),
    ).toBe(1000)
    // After the end: nothing.
    expect(
      addedSeatsCents({ added: 1, seatPriceCents: 1000, ...period, nowMs: 1_031 * DAY }),
    ).toBe(0)
    // Before the start: the whole period, not more.
    expect(
      addedSeatsCents({ added: 1, seatPriceCents: 1000, ...period, nowMs: 990 * DAY }),
    ).toBe(1000)
  })

  it('refuses a period that ends before it starts', () => {
    expect(() =>
      addedSeatsCents({
        added: 1,
        seatPriceCents: 1,
        periodStartMs: 5,
        periodEndMs: 5,
        nowMs: 5,
      }),
    ).toThrow(RangeError)
  })
})
