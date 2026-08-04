import { describe, expect, it } from "vitest";
import { solve, type Program } from "../../src/sim/simplex.ts";

/**
 * What is checked here is mechanics, not numbers that happen to come out
 * (E26): that the answer is lawful, that no rank is ever traded for a lower
 * one, that a tie cannot make it spin, and that what it says about its own
 * limits agrees with the answer it gives.
 *
 * Optimality is checked against brute force rather than against a figure
 * written down by hand: for a program this small, every basis can simply be
 * tried, which is a proof and not a memory.
 */

function lawful(program: Program, levels: readonly number[]): boolean {
  if (levels.some((x) => x < -1e-9)) return false;
  return program.limits.every((limit) => {
    let used = 0;
    for (let j = 0; j < program.activities; j += 1) used += (limit.coefficients[j] ?? 0) * levels[j]!;
    return used <= limit.limit + 1e-9;
  });
}

function valueOf(program: Program, levels: readonly number[], r: number): number {
  const objective = program.objectives[r]!;
  let total = 0;
  for (let j = 0; j < program.activities; j += 1) total += (objective.coefficients[j] ?? 0) * levels[j]!;
  return total;
}

/** Every corner of the feasible region, found by trying every basis. */
function corners(program: Program): number[][] {
  const n = program.activities;
  const found: number[][] = [];
  // Choose n of the (m limits + n axes) to hold with equality and solve.
  const walls: { coefficients: number[]; limit: number }[] = program.limits.map((l) => ({
    coefficients: Array.from({ length: n }, (_, j) => l.coefficients[j] ?? 0),
    limit: l.limit,
  }));
  for (let j = 0; j < n; j += 1) {
    walls.push({ coefficients: Array.from({ length: n }, (_, i) => (i === j ? 1 : 0)), limit: 0 });
  }
  const pick = (start: number, chosen: number[]): void => {
    if (chosen.length === n) {
      const a = chosen.map((c) => [...walls[c]!.coefficients]);
      const b = chosen.map((c) => walls[c]!.limit);
      const x = gauss(a, b);
      if (x !== undefined && lawful(program, x)) found.push(x);
      return;
    }
    for (let c = start; c < walls.length; c += 1) pick(c + 1, [...chosen, c]);
  };
  pick(0, []);
  return found;
}

function gauss(a: number[][], b: number[]): number[] | undefined {
  const n = b.length;
  for (let col = 0; col < n; col += 1) {
    let best = -1;
    let size = 1e-9;
    for (let row = col; row < n; row += 1) {
      if (Math.abs(a[row]![col]!) > size) {
        size = Math.abs(a[row]![col]!);
        best = row;
      }
    }
    if (best < 0) return undefined;
    [a[col], a[best]] = [a[best]!, a[col]!];
    [b[col], b[best]] = [b[best]!, b[col]!];
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const f = a[row]![col]! / a[col]![col]!;
      for (let j = col; j < n; j += 1) a[row]![j] = a[row]![j]! - f * a[col]![j]!;
      b[row] = b[row]! - f * b[col]!;
    }
  }
  return b.map((value, i) => value / a[i]![i]!);
}

describe("the ranked solver", () => {
  it("finds the best answer, checked against every corner", () => {
    const program: Program = {
      activities: 3,
      limits: [
        { id: "hands", coefficients: [1, 2, 1], limit: 40 },
        { id: "country", coefficients: [3, 1, 2], limit: 60 },
        { id: "wood", coefficients: [1, 1, 3], limit: 30 },
      ],
      objectives: [{ id: "food", coefficients: [5, 4, 6] }],
    };
    const answer = solve(program);
    expect(answer.unbounded).toBe(false);
    expect(lawful(program, answer.levels)).toBe(true);

    let best = 0;
    for (const corner of corners(program)) best = Math.max(best, valueOf(program, corner, 0));
    expect(answer.values[0]).toBeCloseTo(best, 9);
  });

  it("never buys a lower rank at the cost of a higher one", () => {
    // Two ways to spend the same hands. The first rank is indifferent between
    // them — both feed exactly as many — but the second is not. A solver that
    // served only the first rank could answer either way; this one has to pick
    // the way that leaves the second rank as much as possible.
    const program: Program = {
      activities: 2,
      limits: [{ id: "hands", coefficients: [1, 1], limit: 10 }],
      objectives: [
        { id: "hunger", coefficients: [1, 1] },
        { id: "warmth", coefficients: [0, 1] },
      ],
    };
    const answer = solve(program);
    expect(answer.values[0]).toBeCloseTo(10, 9);
    expect(answer.values[1]).toBeCloseTo(10, 9);
    expect(answer.levels[0]).toBeCloseTo(0, 9);
    expect(answer.levels[1]).toBeCloseTo(10, 9);
  });

  it("serves the higher rank first even when the lower one would gain far more", () => {
    const program: Program = {
      activities: 2,
      limits: [{ id: "hands", coefficients: [1, 1], limit: 10 }],
      objectives: [
        { id: "hunger", coefficients: [1, 0] },
        { id: "comfort", coefficients: [0, 100] },
      ],
    };
    const answer = solve(program);
    expect(answer.values[0]).toBeCloseTo(10, 9);
    expect(answer.values[1]).toBeCloseTo(0, 9);
  });

  it("terminates on a degenerate program instead of cycling", () => {
    // Beale's example, the standard case on which the natural pivoting rule
    // cycles for ever. Bland's rule is what makes it stop, and this is the test
    // that says so.
    const program: Program = {
      activities: 4,
      limits: [
        { id: "a", coefficients: [0.25, -60, -0.04, 9], limit: 0 },
        { id: "b", coefficients: [0.5, -90, -0.02, 3], limit: 0 },
        { id: "c", coefficients: [0, 0, 1, 0], limit: 1 },
      ],
      objectives: [{ id: "z", coefficients: [0.75, -150, -0.02, 6] }],
    };
    const answer = solve(program);
    expect(answer.unbounded).toBe(false);
    expect(answer.steps).toBeLessThan(100);
    expect(lawful(program, answer.levels)).toBe(true);
    let best = 0;
    for (const corner of corners(program)) best = Math.max(best, valueOf(program, corner, 0));
    expect(answer.values[0]).toBeCloseTo(best, 9);
  });

  it("says when nothing holds it back", () => {
    const program: Program = {
      activities: 1,
      limits: [{ id: "unrelated", coefficients: [0], limit: 5 }],
      objectives: [{ id: "z", coefficients: [1] }],
    };
    expect(solve(program).unbounded).toBe(true);
  });

  it("reports as binding exactly what it has used up", () => {
    const program: Program = {
      activities: 2,
      limits: [
        { id: "hands", coefficients: [1, 1], limit: 10 },
        { id: "country", coefficients: [1, 0], limit: 3 },
        { id: "spare", coefficients: [1, 1], limit: 100 },
      ],
      objectives: [{ id: "food", coefficients: [1, 1] }],
    };
    const answer = solve(program);
    expect(answer.binding).toContain("hands");
    expect(answer.binding).not.toContain("spare");
  });

  it("says what one more unit of a limit would have been worth", () => {
    // Hands are the only thing short, and each hand makes three of the good.
    // One more hand is therefore worth three — no more, no less.
    const program: Program = {
      activities: 1,
      limits: [
        { id: "hands", coefficients: [1], limit: 10 },
        { id: "country", coefficients: [1], limit: 40 },
      ],
      objectives: [{ id: "food", coefficients: [3] }],
    };
    const answer = solve(program);
    expect(answer.opportunity[0]![0]).toBeCloseTo(3, 9);
    expect(answer.opportunity[1]![0]).toBeCloseTo(0, 9);
  });

  it("stays lawful on many random programs", () => {
    let seed = 12345;
    const next = (): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let trial = 0; trial < 200; trial += 1) {
      const activities = 2 + Math.floor(next() * 3);
      const limits = Array.from({ length: 2 + Math.floor(next() * 3) }, (_, i) => ({
        id: `l${i}`,
        coefficients: Array.from({ length: activities }, () => Math.round(next() * 30) / 10),
        limit: Math.round(next() * 200) / 10,
      }));
      const program: Program = {
        activities,
        limits,
        objectives: [
          { id: "first", coefficients: Array.from({ length: activities }, () => Math.round(next() * 50) / 10) },
          { id: "second", coefficients: Array.from({ length: activities }, () => Math.round(next() * 50) / 10) },
        ],
      };
      const answer = solve(program);
      if (answer.unbounded) continue;
      expect(lawful(program, answer.levels)).toBe(true);
      let best = 0;
      for (const corner of corners(program)) best = Math.max(best, valueOf(program, corner, 0));
      expect(answer.values[0]).toBeCloseTo(best, 6);
    }
  });
});
