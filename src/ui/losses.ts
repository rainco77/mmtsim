import {
  HOUSEHOLDS,
  tierEffectAt,
  type CohortId,
  type ConfigIndex,
  type GameState,
  type NeedTierDef,
  type NeedTierId,
} from "../sim/index.ts";
import { CURVE_TICKS } from "./band.ts";

/**
 * What a window of undercoverage **cost**, rank by rank (T9).
 *
 * The cause sentence of a need card says what was missing; this says what it
 * came to. Both stand over the same window, in one block, because a cause
 * without its price is a fact and not a reason.
 *
 * Everything here is read out of the tick's record — coverage as the tick had
 * it, the survival each cohort was really carried through with, the heads that
 * stood there before it. Nothing is recomputed against the state as it now
 * stands: a fresh reckoning on the end state is a different tick, and it has
 * told a shifted story before.
 */

/**
 * The one axis a rank works on (E20). The content lays it down and this only
 * reads it — a rank that moved two of them would be the same effect written
 * twice, and the model refuses to have one.
 */
export type Axis = "survival" | "births" | "work";

/** What one rank cost over the window. */
export interface Toll {
  readonly axis: Axis;
  /**
   * Whole people, per cohort the axis reaches. Whole, because there are no
   * three quarters of a child — and the rounding is done over the window as a
   * whole so that the cards still add up to what really happened.
   */
  readonly people: Readonly<Record<CohortId, number>>;
  /** For the work axis: the share of the window's work this rank cost. */
  readonly share: number;
}

/** Which axis a rank works on, or nothing where it works on none. */
export function axisOf(tier: NeedTierDef): Axis | undefined {
  if (tier.survival !== undefined) return "survival";
  if (tier.birthRate !== undefined) return "births";
  if (tier.workAbility !== undefined || tier.productivity !== undefined) return "work";
  return undefined;
}

/**
 * How a product of factors is shared out among the factors, exactly.
 *
 * The factors multiply — that is how the model applies them — but a player
 * reading two cards adds. The one split that turns the one into the other
 * without a remainder is the share each factor has of the logarithm of the
 * product: the logs add where the factors multiply, so the shares come to one
 * exactly, in any order, however many factors there are.
 *
 * It is a convention and it is chosen deliberately. What it buys is the thing
 * the cards live or die by: whoever sums them lands on the real total and never
 * on "about the total".
 */
function shareOfProduct(factors: readonly number[]): readonly number[] {
  // A factor of nothing has no logarithm. Held just above nought it takes
  // almost the whole share, which is what it did — it took almost everything.
  const logs = factors.map((one) => Math.log(Math.max(1e-12, Math.min(1, one))));
  let sum = 0;
  for (const log of logs) sum += log;
  if (sum >= -1e-15) return factors.map(() => 0);
  return logs.map((log) => log / sum);
}

/** The factor one rank put on one cohort's survival this tick. */
function survivalFactor(tier: NeedTierDef, coverage: number, cohort: CohortId): number {
  const survival = tier.survival;
  if (survival === undefined) return 1;
  const kept = tierEffectAt(survival, coverage);
  return Math.max(0, 1 - (survival.per[cohort] ?? 1) * (1 - kept));
}

/** The factor one rank put on the tick's work, against a rank fully covered. */
function workFactor(tier: NeedTierDef, coverage: number): number {
  let factor = 1;
  for (const effect of [tier.workAbility, tier.productivity]) {
    if (effect === undefined) continue;
    const full = tierEffectAt(effect, 1);
    if (full <= 0) continue;
    factor *= tierEffectAt(effect, coverage) / full;
  }
  return factor;
}

/** The factor one rank put on the tick's births, against a rank fully covered. */
function birthFactor(tier: NeedTierDef, coverage: number): number {
  const effect = tier.birthRate;
  if (effect === undefined) return 1;
  const full = tierEffectAt(effect, 1);
  return full <= 0 ? 1 : tierEffectAt(effect, coverage) / full;
}

interface Running {
  readonly axis: Axis;
  people: Record<CohortId, number>;
  work: number;
}

/**
 * The window's book: what every rank cost, over the ticks a card's curve
 * covers.
 *
 * One book for the whole window and not one reckoning per card, because the
 * cards have to agree: the people are whole numbers, and rounding each card on
 * its own would leave the sum of them beside the real loss. The book rounds the
 * window's total once and shares out the whole numbers by largest remainder, so
 * the cards add up to the total exactly.
 */
export function windowBook(
  history: readonly GameState[],
  index: ConfigIndex,
): ReadonlyMap<NeedTierId, Toll> {
  const running = new Map<NeedTierId, Running>();
  const cohorts = index.config.population.cohorts.map((one) => one.id);
  const first = Math.max(1, history.length - CURVE_TICKS);
  let ticks = 0;

  for (let at = first; at < history.length; at += 1) {
    const state = history[at];
    const before = history[at - 1];
    if (state === undefined || before === undefined) continue;
    ticks += 1;
    const heads = before.sectors[HOUSEHOLDS]?.cohorts ?? {};

    const take = (tier: NeedTierDef, axis: Axis): Running => {
      const seen = running.get(tier.id);
      if (seen !== undefined) return seen;
      const fresh: Running = { axis, people: {}, work: 0 };
      running.set(tier.id, fresh);
      return fresh;
    };

    // ---- survival: whole people, per cohort, out of the recorded factors
    for (const cohort of cohorts) {
      const base = index.config.population.baseSurvival[cohort] ?? 1;
      const stood = heads[cohort] ?? 0;
      // The loss the tick really applied — the record, never a recomputation.
      const lost = stood * Math.max(0, base - (state.lastSurvival[cohort] ?? base));
      if (lost <= 0) continue;
      const parts: { tier: NeedTierDef; factor: number }[] = [];
      for (const tier of index.config.needTiers) {
        if (axisOf(tier) !== "survival") continue;
        const factor = survivalFactor(tier, state.lastCoverage[tier.id] ?? 1, cohort);
        if (factor < 1 - 1e-12) parts.push({ tier, factor });
      }
      const shares = shareOfProduct(parts.map((one) => one.factor));
      parts.forEach((part, i) => {
        const book = take(part.tier, "survival");
        book.people[cohort] = (book.people[cohort] ?? 0) + lost * (shares[i] ?? 0);
      });
    }

    // ---- births: the children a full table would have brought
    const bornParts: { tier: NeedTierDef; factor: number }[] = [];
    for (const tier of index.config.needTiers) {
      if (axisOf(tier) !== "births") continue;
      const factor = birthFactor(tier, state.lastCoverage[tier.id] ?? 1);
      if (factor < 1 - 1e-12) bornParts.push({ tier, factor });
    }
    if (bornParts.length > 0) {
      let whole = 1;
      for (const part of bornParts) whole *= part.factor;
      const missed = whole > 0 ? state.lastBorn * (1 / whole - 1) : 0;
      const shares = shareOfProduct(bornParts.map((one) => one.factor));
      const into = index.config.population.birthsInto;
      bornParts.forEach((part, i) => {
        const book = take(part.tier, "births");
        book.people[into] = (book.people[into] ?? 0) + missed * (shares[i] ?? 0);
      });
    }

    // ---- work: the share of what the community could have done
    const workParts: { tier: NeedTierDef; factor: number }[] = [];
    for (const tier of index.config.needTiers) {
      if (axisOf(tier) !== "work") continue;
      const factor = workFactor(tier, state.lastCoverage[tier.id] ?? 1);
      if (factor < 1 - 1e-12) workParts.push({ tier, factor });
    }
    if (workParts.length > 0) {
      let whole = 1;
      for (const part of workParts) whole *= part.factor;
      const lostShare = Math.max(0, 1 - whole);
      const shares = shareOfProduct(workParts.map((one) => one.factor));
      workParts.forEach((part, i) => {
        take(part.tier, "work").work += lostShare * (shares[i] ?? 0);
      });
    }
  }

  // The whole numbers, shared out once over the window so that the cards sum to
  // the window's own total and not to something near it.
  const whole = new Map<CohortId, Map<NeedTierId, number>>();
  for (const cohort of [...cohorts, index.config.population.birthsInto]) {
    if (whole.has(cohort)) continue;
    const parts: [NeedTierId, number][] = [];
    for (const [id, book] of running) {
      const value = book.people[cohort] ?? 0;
      if (value > 0) parts.push([id, value]);
    }
    whole.set(cohort, largestRemainder(parts));
  }

  const out = new Map<NeedTierId, Toll>();
  for (const [id, book] of running) {
    const people: Record<CohortId, number> = {};
    for (const [cohort, shares] of whole) {
      const value = shares.get(id) ?? 0;
      if (value > 0) people[cohort] = value;
    }
    out.set(id, {
      axis: book.axis,
      people,
      share: ticks > 0 ? book.work / ticks : 0,
    });
  }
  return out;
}

/**
 * Whole numbers that add up: each share rounded down, and the units still
 * missing from the rounded total handed to the largest remainders first.
 */
function largestRemainder(
  parts: readonly [NeedTierId, number][],
): Map<NeedTierId, number> {
  const out = new Map<NeedTierId, number>();
  let sum = 0;
  for (const [, value] of parts) sum += value;
  const total = Math.round(sum);
  const floors = parts.map(([id, value]) => ({
    id,
    floor: Math.floor(value),
    rest: value - Math.floor(value),
  }));
  let handed = 0;
  for (const one of floors) {
    out.set(one.id, one.floor);
    handed += one.floor;
  }
  const order = [...floors].sort((a, b) => b.rest - a.rest);
  for (let i = 0; handed < total && i < order.length; i += 1) {
    const one = order[i];
    if (one === undefined) continue;
    out.set(one.id, (out.get(one.id) ?? 0) + 1);
    handed += 1;
  }
  return out;
}
