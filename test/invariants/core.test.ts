import { describe, expect, it } from "vitest";
import { STAGE1 } from "../../src/content/stage1.ts";
import {
  createState,
  derive,
  indexConfig,
  tick,
  type GameState,
} from "../../src/sim/index.ts";

/**
 * Invariants (E26): they hold for every seed and every state, and they survive
 * every change of a number. No tolerances and no snapshots — with the seed in
 * the state the tick is a pure function, and a tolerance would be an admission
 * of not controlling the randomness.
 */

const index = indexConfig(STAGE1);
const SEEDS = Array.from({ length: 25 }, (_, i) => 1 + i * 7);
const TICKS = 200;

function* walk(seed: number): Generator<GameState> {
  let state = createState(STAGE1, { seed });
  for (let i = 0; i < TICKS; i += 1) {
    yield state;
    state = tick(state, index);
  }
  yield state;
}

describe("invariants", () => {
  it("no stock ever turns negative", () => {
    for (const seed of SEEDS) {
      for (const state of walk(seed)) {
        for (const sector of Object.values(state.sectors)) {
          for (const [id, amount] of Object.entries(sector.stocks)) {
            expect(amount, `${id} at seed ${seed}`).toBeGreaterThanOrEqual(-1e-9);
          }
        }
      }
    }
  });

  it("no area ever turns negative", () => {
    for (const seed of SEEDS) {
      for (const state of walk(seed)) {
        for (const area of Object.values(state.unownedCapacity)) {
          expect(area.amount).toBeGreaterThanOrEqual(-1e-9);
        }
        for (const sector of Object.values(state.sectors)) {
          for (const area of Object.values(sector.capacityHeld)) {
            expect(area.amount).toBeGreaterThanOrEqual(-1e-9);
          }
        }
      }
    }
  });

  /**
   * Supply equals processes plus projects plus idle — the books have to close.
   *
   * The invariant that stood here before compared the supply with a figure
   * derived from the supply itself, so it could not fail. It passed while the
   * display said "labour binds" and "1.8 free" in the same tick, because the
   * labour set aside for projects was counted as idle as well.
   */
  it("the labour books close: supply = processes + projects + idle", () => {
    for (const seed of SEEDS) {
      for (const state of walk(seed)) {
        const d = derive(state, index);
        expect(d.laborToProduction + d.laborToProjects + d.laborUnused).toBeCloseTo(
          d.laborPerformance,
          9,
        );
        expect(d.laborToProduction).toBeGreaterThanOrEqual(-1e-9);
        expect(d.laborToProjects).toBeGreaterThanOrEqual(-1e-9);
        expect(d.laborUnused).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it("coverage stays within zero and one", () => {
    for (const seed of SEEDS) {
      for (const state of walk(seed)) {
        for (const value of Object.values(derive(state, index).coverage)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1 + 1e-9);
        }
      }
    }
  });

  it("occupied area never exceeds the available area", () => {
    for (const seed of SEEDS) {
      for (const state of walk(seed)) {
        for (const value of Object.values(derive(state, index).utilization)) {
          expect(value).toBeLessThanOrEqual(1 + 1e-9);
        }
      }
    }
  });

  it("population never turns negative", () => {
    for (const seed of SEEDS) {
      for (const state of walk(seed)) {
        expect(state.sectors["households"]?.heads ?? 0).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("the tick is a pure function: same input, same output", () => {
    for (const seed of SEEDS.slice(0, 5)) {
      const a = createState(STAGE1, { seed });
      const b = createState(STAGE1, { seed });
      let left = a;
      let right = b;
      for (let i = 0; i < 50; i += 1) {
        left = tick(left, index);
        right = tick(right, index);
      }
      expect(JSON.stringify(left)).toBe(JSON.stringify(right));
    }
  });

  it("the state stays plain and serialisable (T7)", () => {
    let state = createState(STAGE1, { seed: 5 });
    for (let i = 0; i < 60; i += 1) state = tick(state, index);
    const roundTrip = JSON.parse(JSON.stringify(state)) as GameState;
    expect(roundTrip).toEqual(state);
  });
});
