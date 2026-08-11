import { describe, expect, it } from "vitest";
import { STAGE1 } from "../../src/content/stage1.ts";
import {
  createState,
  indexConfig,
  tierEffectAt,
  type GameState,
} from "../../src/sim/index.ts";
import { axisOf, windowBook } from "../../src/ui/losses.ts";

/**
 * Mechanics of the window's book (E26): what the split promises, never a figure
 * a change of content would move.
 *
 * The one promise it lives by: **whoever sums the cards lands on what really
 * happened.** The model multiplies its factors, a player reading two cards
 * adds, and the split is what turns the one into the other without a remainder.
 */

const index = indexConfig(STAGE1);
const HOUSEHOLDS = "households";

/** The survival ranks of the content, in the order they stand. */
const survivalTiers = STAGE1.needTiers.filter((tier) => axisOf(tier) === "survival");

/**
 * A run of ticks made by hand: the same records a played tick leaves behind,
 * with the coverage put where the test wants it. Written rather than played
 * because two ranks going short together at a chosen depth is not something a
 * seed can be asked for.
 */
function madeUp(coverage: Readonly<Record<string, number>>, ticks: number): GameState[] {
  const opening = createState(STAGE1, { seed: 42 });
  const history: GameState[] = [opening];
  for (let i = 0; i < ticks; i += 1) {
    const survival: Record<string, number> = {};
    for (const cohort of STAGE1.population.cohorts) {
      let factor = STAGE1.population.baseSurvival[cohort.id] ?? 1;
      for (const tier of survivalTiers) {
        const effect = tier.survival;
        if (effect === undefined) continue;
        const kept = tierEffectAt(effect, coverage[tier.id] ?? 1);
        factor *= Math.max(0, 1 - (effect.per[cohort.id] ?? 1) * (1 - kept));
      }
      survival[cohort.id] = factor;
    }
    const before = history[history.length - 1] as GameState;
    history.push({
      ...before,
      tick: before.tick + 1,
      lastCoverage: coverage,
      lastSurvival: survival,
      lastBorn: 0,
    });
  }
  return history;
}

/** What the window really lost, per cohort — the figure the cards must sum to. */
function realLoss(history: readonly GameState[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (let at = Math.max(1, history.length - 20); at < history.length; at += 1) {
    const state = history[at] as GameState;
    const heads = (history[at - 1] as GameState).sectors[HOUSEHOLDS]?.cohorts ?? {};
    for (const cohort of STAGE1.population.cohorts) {
      const base = STAGE1.population.baseSurvival[cohort.id] ?? 1;
      const lost =
        (heads[cohort.id] ?? 0) *
        Math.max(0, base - (state.lastSurvival[cohort.id] ?? base));
      out[cohort.id] = (out[cohort.id] ?? 0) + lost;
    }
  }
  return out;
}

describe("what a window of undercoverage cost (T9)", () => {
  it("shares the whole loss out over the ranks that went short, and no more", () => {
    // Two survival ranks short in the same ticks — the case the split exists
    // for. Their factors multiply on every cohort; the cards have to add up to
    // exactly what that product took.
    const history = madeUp({ food_survival: 0.5, warmth_fire: 0.4 }, 6);
    const book = windowBook(history, index);
    const real = realLoss(history);

    expect(book.has("food_survival")).toBe(true);
    expect(book.has("warmth_fire")).toBe(true);

    for (const cohort of STAGE1.population.cohorts) {
      let summed = 0;
      for (const toll of book.values()) summed += toll.people[cohort.id] ?? 0;
      // A window that lost nobody would let this pass while saying nothing.
      expect(summed).toBeGreaterThan(0);
      // Whole people, and their sum is the window's own rounded total: a player
      // adding the cards must not land beside the count in the log.
      expect(summed).toBe(Math.round(real[cohort.id] ?? 0));
      // And both ranks really carry a share of it — a split that gave one of
      // them everything would sum correctly and mean nothing.
      expect(book.get("food_survival")?.people[cohort.id] ?? 0).toBeGreaterThan(0);
      expect(book.get("warmth_fire")?.people[cohort.id] ?? 0).toBeGreaterThan(0);
    }
  });

  it("names no rank that was covered whole", () => {
    const history = madeUp({ food_survival: 0.5 }, 6);
    const book = windowBook(history, index);
    expect(book.has("food_survival")).toBe(true);
    for (const tier of survivalTiers) {
      if (tier.id === "food_survival") continue;
      expect(book.get(tier.id)).toBeUndefined();
    }
  });

  it("reaches only the cohorts the axis reaches", () => {
    // Care works on the growing and on nobody else, and the sentence must not
    // name a grown-up it never touched.
    const history = madeUp({ childcare: 0.2 }, 6);
    const toll = windowBook(history, index).get("childcare");
    expect(toll?.axis).toBe("survival");
    expect((toll?.people["growing"] ?? 0) > 0).toBe(true);
    expect(toll?.people["grown"]).toBeUndefined();
  });

  it("gives a work rank a share of the work and no people at all", () => {
    const history = madeUp({ food_satiety: 0.25 }, 6);
    const toll = windowBook(history, index).get("food_satiety");
    expect(toll?.axis).toBe("work");
    expect(toll?.share ?? 0).toBeGreaterThan(0);
    expect(Object.keys(toll?.people ?? {})).toEqual([]);
  });

  it("says nothing where the window carried no loss", () => {
    const history = madeUp({}, 6);
    expect(windowBook(history, index).size).toBe(0);
  });
});
