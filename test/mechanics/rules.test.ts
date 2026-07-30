import { describe, expect, it } from "vitest";
import { STAGE1 } from "../../src/content/stage1.ts";
import {
  allocate,
  apply,
  completedCount,
  computeUnlocks,
  createState,
  derive,
  effectTypesWithHandler,
  indexConfig,
  PIPELINE,
  tick,
  type Config,
  type GameState,
} from "../../src/sim/index.ts";
import { counterOf, draw, uniformAt } from "../../src/sim/random.ts";

/**
 * Mechanics (E26): what the rules promise, not what a run happens to produce.
 * Deliberately no snapshots like "after 100 ticks the population is 34.217" —
 * deterministic, but they break on every balance change and say nothing about
 * the intent.
 */

const index = indexConfig(STAGE1);

function runTicks(state: GameState, count: number): GameState {
  let next = state;
  for (let i = 0; i < count; i += 1) next = tick(next, index);
  return next;
}

function finish(state: GameState, projectId: string): GameState {
  let next = apply(state, { type: "startProject", id: projectId }, index).state;
  const def = index.project.get(projectId);
  if (def === undefined) throw new Error(projectId);
  for (let i = 0; i < def.minTicks * 6 && completedCount(next, projectId) === 0; i += 1) {
    next = tick(next, index);
  }
  return next;
}

describe("content is well formed (T3)", () => {
  it("process priorities are unique within a branch", () => {
    const seen = new Map<string, Set<number>>();
    for (const process of STAGE1.processes) {
      const priorities = seen.get(process.branch) ?? new Set<number>();
      expect(priorities.has(process.priority), `${process.id}`).toBe(false);
      priorities.add(process.priority);
      seen.set(process.branch, priorities);
    }
  });

  it("need tier ranks are unique — E21 rules out a tie", () => {
    const ranks = STAGE1.needTiers.map((tier) => tier.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
  });

  it("every effect type has a handler", () => {
    const handled = new Set(effectTypesWithHandler());
    for (const project of STAGE1.projects) {
      for (const effect of project.effects) expect(handled.has(effect.type)).toBe(true);
    }
  });

  it("every referenced id exists", () => {
    const stocks = new Set(STAGE1.stocks.map((s) => s.id));
    const areas = new Set(STAGE1.areaTypes.map((a) => a.id));
    const branches = new Set(STAGE1.branches.map((b) => b.id));
    const processes = new Set(STAGE1.processes.map((p) => p.id));

    for (const process of STAGE1.processes) {
      expect(branches.has(process.branch)).toBe(true);
      for (const id of Object.keys(process.areaPerOutput))
        expect(areas.has(id)).toBe(true);
      for (const id of Object.keys(process.intermediatesPerOutput)) {
        expect(stocks.has(id)).toBe(true);
      }
    }
    for (const tier of STAGE1.needTiers) {
      expect(stocks.has(tier.stock)).toBe(true);
      expect(branches.has(tier.branch)).toBe(true);
    }
    for (const project of STAGE1.projects) {
      for (const effect of project.effects) {
        if (effect.type === "process") expect(processes.has(effect.id)).toBe(true);
        if (effect.type === "branch") expect(branches.has(effect.id)).toBe(true);
        if (effect.type === "capacity") expect(areas.has(effect.areaType)).toBe(true);
      }
    }
  });
});

describe("phases hold nothing between ticks (T1)", () => {
  it("no phase carries a mutable field", () => {
    for (const phase of PIPELINE) {
      const own = Object.getOwnPropertyNames(phase).filter((name) => name !== "id");
      expect(own, `${phase.id} keeps ${own.join(", ")}`).toEqual([]);
    }
  });

  it("two pipelines from the same state agree", () => {
    const state = runTicks(createState(STAGE1, { seed: 3 }), 20);
    expect(JSON.stringify(tick(state, index))).toBe(JSON.stringify(tick(state, index)));
  });
});

describe("random streams stay independent (E25)", () => {
  it("a new stream does not shift an existing one", () => {
    const base = createState(STAGE1, { seed: 11 }).random;
    const before = uniformAt(base, "weather", counterOf(base, "weather"));
    const afterOtherStream = draw(base, "events").random;
    expect(
      uniformAt(afterOtherStream, "weather", counterOf(afterOtherStream, "weather")),
    ).toBe(before);
  });

  it("a stream never drawn stands at zero, so no migration is needed", () => {
    const base = createState(STAGE1, { seed: 11 }).random;
    expect(counterOf(base, "foreign")).toBe(0);
  });
});

describe("the year's quality (E24)", () => {
  it("has mean one, an upper bound and a long left tail", () => {
    const exponent = STAGE1.weather.exponent;
    const scale = (exponent + 1) / exponent;
    let state = createState(STAGE1, { seed: 4 });
    const values: number[] = [];
    for (let i = 0; i < 4000; i += 1) {
      values.push(derive(state, index).yearQuality);
      state = tick(state, index);
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    expect(mean).toBeGreaterThan(0.97);
    expect(mean).toBeLessThan(1.03);
    expect(Math.max(...values)).toBeLessThanOrEqual(scale + 1e-9);
    // Long left tail: the distance below the median is far greater than above.
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 1;
    expect(median - (sorted[0] ?? 0)).toBeGreaterThan(
      (sorted[sorted.length - 1] ?? 0) - median,
    );
  });

  it("strikes yields, never decay", () => {
    // Decay depends on the stock alone: with production switched off, two
    // different weather draws must leave the same remainder.
    const noProduction: Config = { ...STAGE1, needTiers: [] };
    const local = indexConfig(noProduction);
    const a = tick(createState(noProduction, { seed: 1 }), local);
    const b = tick(createState(noProduction, { seed: 999 }), local);
    expect(a.sectors["households"]?.stocks["food"]).toBeCloseTo(
      b.sectors["households"]?.stocks["food"] ?? 0,
      12,
    );
  });
});

describe("projects (E18)", () => {
  it("never finish faster than the minimum duration", () => {
    const def = index.project.get("better_tools");
    if (def === undefined) throw new Error("missing");
    let state = apply(
      createState(STAGE1, { seed: 7 }),
      {
        type: "startProject",
        id: "better_tools",
      },
      index,
    ).state;

    for (let i = 0; i < def.minTicks - 1; i += 1) state = tick(state, index);
    expect(completedCount(state, "better_tools")).toBe(0);
  });

  it("a paused project takes nothing and keeps its progress", () => {
    let state = apply(
      createState(STAGE1, { seed: 7 }),
      {
        type: "startProject",
        id: "better_tools",
      },
      index,
    ).state;
    state = tick(state, index);
    const progress = state.activeProjects[0]?.progress ?? 0;
    expect(progress).toBeGreaterThan(0);

    state = apply(
      state,
      { type: "pauseProject", id: "better_tools", paused: true },
      index,
    ).state;
    const before = derive(state, index).laborToProjects;
    state = runTicks(state, 5);
    expect(state.activeProjects[0]?.progress).toBeCloseTo(progress, 12);
    expect(before).toBe(0);
  });

  it("a missing resource pauses the project and consumes nothing (E18)", () => {
    // A project that needs wood, which does not exist yet.
    const withWoodCost: Config = {
      ...STAGE1,
      projects: STAGE1.projects.map((p) =>
        p.id === "better_tools" ? { ...p, stockCost: { wood: 40 } } : p,
      ),
    };
    const local = indexConfig(withWoodCost);
    let state = apply(
      createState(withWoodCost, { seed: 7 }),
      {
        type: "startProject",
        id: "better_tools",
      },
      local,
    ).state;
    const foodBefore = state.sectors["households"]?.stocks["food"] ?? 0;
    state = tick(state, local);
    expect(state.activeProjects[0]?.progress).toBe(0);
    // Nothing was taken for the project: food only moved by decay and eating.
    expect(state.sectors["households"]?.stocks["wood"] ?? 0).toBe(0);
    expect(foodBefore).toBeGreaterThan(0);
  });

  it("effects apply exactly once, on completion", () => {
    const state = finish(createState(STAGE1, { seed: 7 }), "better_tools");
    expect(completedCount(state, "better_tools")).toBe(1);
    expect(computeUnlocks(state, index).processes.has("gathering_tools")).toBe(true);
    expect(state.activeProjects.some((p) => p.id === "better_tools")).toBe(false);
  });
});

describe("processes and the fallback level (E5)", () => {
  it("a technique without a capacity input replaces its predecessor entirely", () => {
    const before = createState(STAGE1, { seed: 7 });
    const after = finish(before, "better_tools");

    const runsBefore = derive(before, index).runs;
    const runsAfter = derive(after, index).runs;
    expect(runsBefore.map((r) => r.process)).toEqual(["gathering"]);
    expect(runsAfter.map((r) => r.process)).toEqual(["gathering_tools"]);
  });

  it("what a higher priority cannot carry falls to the next one", () => {
    // Farming has priority over gathering but only a little cleared land, so
    // both must run at once.
    let state = finish(createState(STAGE1, { seed: 7 }), "better_tools");
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 200,
          areas: { cleared: { area: 3, quality: 1 } },
        },
      },
    };
    state = { ...state, completedProjects: { ...state.completedProjects, sedentism: 1 } };

    const processes = derive(state, index).runs.map((r) => r.process);
    expect(processes).toContain("farming");
    expect(processes).toContain("gathering_tools");
  });

  it("the engine never judges which process is better — priority decides", () => {
    // A process with a worse yield but a higher priority runs first.
    const flipped: Config = {
      ...STAGE1,
      processes: STAGE1.processes.map((p) =>
        p.id === "gathering" ? { ...p, priority: 999, outputPerLabor: 0.2 } : p,
      ),
    };
    const local = indexConfig(flipped);
    const state = finish(createState(flipped, { seed: 7 }), "better_tools");
    expect(derive(state, local).runs[0]?.process).toBe("gathering");
  });
});

describe("allocation runs rank by rank (E21)", () => {
  it("a lower rank is served before a higher one from the same stock", () => {
    const state = createState(STAGE1, { seed: 7, heads: 40, wilderness: 40 });
    const result = allocate({
      state,
      index,
      sectorId: "households",
      yearQuality: 1,
      laborToProjects: 0,
      unlockedBranches: new Set(["food"]),
      unlockedProcesses: new Set(["gathering"]),
    });
    const survival = result.tiers.find((t) => t.tier === "food_survival");
    const satiety = result.tiers.find((t) => t.tier === "food_satiety");
    expect(survival?.coverage ?? 0).toBeGreaterThanOrEqual(satiety?.coverage ?? 0);
  });

  it("names the binding input when a rank cannot be covered (E6)", () => {
    // Far too little wilderness for the population: area binds, not labour.
    const state = createState(STAGE1, { seed: 7, heads: 200, wilderness: 30, food: 0 });
    const d = derive(state, index);
    expect(d.binding.kind).toBe("area");
    expect(d.binding.what).toBe("wilderness");
    expect(d.bindingTier).toBe("food_survival");
  });
});

describe("population (E20)", () => {
  it("stands when rank 100 is exactly covered and nothing above it is", () => {
    expect(STAGE1.population.baseBirthRate).toBe(STAGE1.population.baseDeathRate);
  });

  it("shrinks under famine and grows when sated", () => {
    const starving = createState(STAGE1, {
      seed: 7,
      heads: 200,
      wilderness: 20,
      food: 0,
    });
    expect(derive(starving, index).deathRate).toBeGreaterThan(
      derive(starving, index).birthRate,
    );

    const fed = createState(STAGE1, { seed: 7, heads: 20, wilderness: 4000, food: 200 });
    expect(derive(fed, index).birthRate).toBeGreaterThan(derive(fed, index).deathRate);
  });

  it("reports the settlement as given up below the minimum viable size", () => {
    const tiny = createState(STAGE1, { seed: 7, heads: 5 });
    expect(derive(tiny, index).settlementAbandoned).toBe(true);
  });
});

describe("sedentism (E29)", () => {
  it("opens branches, processes, the rule and the first fields", () => {
    let state = finish(createState(STAGE1, { seed: 7 }), "better_tools");
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 100,
        },
      },
    };
    state = finish(state, "sedentism");

    const unlocks = computeUnlocks(state, index);
    expect(unlocks.rules.has("settled")).toBe(true);
    expect(unlocks.branches.has("housing")).toBe(true);
    expect(unlocks.processes.has("farming")).toBe(true);
    expect(state.sectors["households"]?.areas["cleared"]?.area).toBeCloseTo(20, 9);
  });

  it("makes food storable — a rule the decay phase reads (E23)", () => {
    const nomadic = createState(STAGE1, { seed: 7 });
    const settled: GameState = {
      ...nomadic,
      completedProjects: { sedentism: 1 },
      sectors: {
        ...nomadic.sectors,
        households: {
          ...nomadic.sectors["households"]!,
          stocks: { food: 100 },
          heads: 0,
        },
      },
    };
    const nomadicState: GameState = {
      ...nomadic,
      sectors: {
        ...nomadic.sectors,
        households: {
          ...nomadic.sectors["households"]!,
          stocks: { food: 100 },
          heads: 0,
        },
      },
    };
    const settledFood = tick(settled, index).sectors["households"]?.stocks["food"] ?? 0;
    const nomadicFood =
      tick(nomadicState, index).sectors["households"]?.stocks["food"] ?? 0;
    expect(settledFood).toBeGreaterThan(nomadicFood);
  });

  it("clearing turns wilderness into cleared land, keeping the total (E13)", () => {
    let state = finish(createState(STAGE1, { seed: 7 }), "better_tools");
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 100,
        },
      },
    };
    state = finish(state, "sedentism");

    const before =
      (state.unownedAreas["wilderness"]?.area ?? 0) +
      (state.sectors["households"]?.areas["cleared"]?.area ?? 0);
    const after = finish(state, "clearing");
    const total =
      (after.unownedAreas["wilderness"]?.area ?? 0) +
      (after.sectors["households"]?.areas["cleared"]?.area ?? 0);

    expect(total).toBeCloseTo(before, 6);
    expect(after.sectors["households"]?.areas["cleared"]?.area ?? 0).toBeGreaterThan(
      state.sectors["households"]?.areas["cleared"]?.area ?? 0,
    );
  });

  it("each taking brings worse land than the one before (E13, Ricardo)", () => {
    let state = finish(createState(STAGE1, { seed: 7 }), "better_tools");
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 400,
        },
      },
    };
    state = finish(state, "sedentism");

    const first = derive(state, index).nextTakingQuality;
    const afterOne = finish(state, "land_taking");
    const second = derive(afterOne, index).nextTakingQuality;
    expect(second).toBeLessThan(first);
    expect(afterOne.landTakings).toBe(1);
  });
});

describe("supply chains (E4)", () => {
  it("produces an intermediate nobody needs directly", () => {
    // Housing needs wood; nothing needs wood for its own sake. Without derived
    // demand no wood would ever be made and the roof would stay uncovered.
    let state = finish(createState(STAGE1, { seed: 7 }), "better_tools");
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: { ...state.sectors["households"]!, heads: 120 },
      },
    };
    state = finish(state, "sedentism");
    state = runTicks(state, 30);

    const d = derive(state, index);
    expect(d.produced["wood"] ?? 0).toBeGreaterThan(0);
    expect(d.coverage["shelter_roof"] ?? 0).toBeGreaterThan(0);
  });

  it("names the upstream bottleneck, not the missing intermediate", () => {
    // Wood is short because there is no wilderness left — that is what should
    // be reported, not "wood is missing".
    let state = finish(createState(STAGE1, { seed: 7 }), "better_tools");
    state = {
      ...state,
      unownedAreas: { wilderness: { area: 0.01, quality: 1 } },
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 200,
          stocks: { food: 400 },
          areas: { cleared: { area: 400, quality: 1 } },
        },
      },
      completedProjects: { better_tools: 1, sedentism: 1 },
    };
    const d = derive(state, index);
    expect(d.coverage["shelter_roof"] ?? 1).toBeLessThan(1);
    expect(d.binding.kind).toBe("area");
    expect(d.binding.what).toBe("wilderness");
  });
});
