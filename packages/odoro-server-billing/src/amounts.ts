/**
 * The arithmetic of a bill, in integer cents — never a float.
 *
 * Odoro computes what it CHARGES with its own copy of these functions (money
 * code lives where the money is). This copy only lets a site SHOW an estimate
 * before the period closes. Both copies are checked against the same vectors
 * (`test/amounts.test.ts` here, the billing test in the Odoro repository): if
 * one changes without the other, one of the two goes red.
 *
 * Products that could leave the safe-integer range are done in BigInt.
 *
 * @module
 */

/** What a plan charges for one metered metric. */
export interface MeterPrice {
  /** Units the plan includes each period, at no extra cost. */
  readonly included: number
  /** Units per billed block: "1 cent per 100 calls" is `unitSize: 100`. */
  readonly unitSize: number
  /** Price of one block, in cents. */
  readonly unitPriceCents: number
}

function wholeNonNegative(value: number, what: string): bigint {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${what} must be a non-negative integer, got ${value}`)
  }
  return BigInt(value)
}

function toNumber(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('amount out of range')
  }
  return Number(value)
}

/**
 * The amount of one metric over a period: the units beyond what the plan
 * includes, rounded UP to whole blocks, times the block price.
 */
export function meterAmountCents(used: number, meter: MeterPrice): number {
  const u = wholeNonNegative(used, 'used')
  const included = wholeNonNegative(meter.included, 'included')
  const size = wholeNonNegative(meter.unitSize, 'unitSize')
  const price = wholeNonNegative(meter.unitPriceCents, 'unitPriceCents')
  if (size === 0n) throw new RangeError('unitSize must be at least 1')
  const over = u > included ? u - included : 0n
  const blocks = (over + size - 1n) / size
  return toNumber(blocks * price)
}

/** Seats beyond what the plan includes, for one whole period. */
export function extraSeatsCents(
  seats: number,
  plan: { readonly seatsIncluded: number; readonly seatPriceCents: number },
): number {
  const s = wholeNonNegative(seats, 'seats')
  const included = wholeNonNegative(plan.seatsIncluded, 'seatsIncluded')
  const price = wholeNonNegative(plan.seatPriceCents, 'seatPriceCents')
  return toNumber((s > included ? s - included : 0n) * price)
}

/**
 * Seats ADDED during a period, for what remains of it: the seat price times
 * the remaining share of the period, rounded UP to the cent. Nothing remains
 * after the end; the whole price before the start.
 */
export function addedSeatsCents(input: {
  readonly added: number
  readonly seatPriceCents: number
  readonly periodStartMs: number
  readonly periodEndMs: number
  readonly nowMs: number
}): number {
  const added = wholeNonNegative(input.added, 'added')
  const price = wholeNonNegative(input.seatPriceCents, 'seatPriceCents')
  const start = wholeNonNegative(input.periodStartMs, 'periodStartMs')
  const end = wholeNonNegative(input.periodEndMs, 'periodEndMs')
  const now = wholeNonNegative(input.nowMs, 'nowMs')
  if (end <= start) throw new RangeError('the period must end after it starts')
  const length = end - start
  const clamped = now < start ? start : now > end ? end : now
  const remaining = end - clamped
  return toNumber((added * price * remaining + length - 1n) / length)
}
