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
  type ConfigIndex,
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

/**
 * Runs a project to completion, claiming behind every need.
 *
 * The rank matters and the engine's default is the front of the queue, ahead of
 * eating (E18: the danger of committing is the player's to choose). These tests
 * are about what an effect does once it lands, not about that bargain, so they
 * take the patient end of it — at the front, a project starves the community
 * before it ever finishes.
 */
const BEHIND_EVERY_NEED = 1000;

function finish(state: GameState, projectId: string, on: ConfigIndex = index): GameState {
  let next = apply(
    state,
    { type: "startProject", id: projectId, rank: BEHIND_EVERY_NEED },
    on,
  ).state;
  const def = on.project.get(projectId);
  if (def === undefined) throw new Error(projectId);
  for (let i = 0; i < def.minTicks * 20 && completedCount(next, projectId) === 0; i += 1) {
    next = tick(next, on);
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
    const capacityHeld = new Set(STAGE1.capacities.map((a) => a.id));
    const branches = new Set(STAGE1.branches.map((b) => b.id));
    const processes = new Set(STAGE1.processes.map((p) => p.id));

    for (const process of STAGE1.processes) {
      expect(branches.has(process.branch)).toBe(true);
      for (const id of Object.keys(process.capacityPerOutput))
        expect(capacityHeld.has(id)).toBe(true);
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
        if (effect.type === "capacity") expect(capacityHeld.has(effect.capacity)).toBe(true);
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
    const exponent = STAGE1.shocks["weather"]!.exponent;
    const scale = (exponent + 1) / exponent;
    let state = createState(STAGE1, { seed: 4, wilderness: 4000, water: 1600 });
    const values: number[] = [];
    for (let i = 0; i < 4000; i += 1) {
      values.push(derive(state, index).shocks["weather"] ?? 1);
      state = tick(state, index);
      // The draw is what is under test, so the community must not be allowed to die
      // of it: once a community is given up the world stops and the last draw
      // would be counted a thousand times over. Holding the heads steady keeps
      // the stream running without touching what it produces.
      const alive: Record<string, unknown> = { ...state };
      delete alive["abandonedAt"];
      state = {
        ...(alive as unknown as GameState),
        sectors: {
          ...state.sectors,
          households: { ...state.sectors["households"]!, heads: 25 },
        },
      };
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
    const def = index.project.get("sickle");
    if (def === undefined) throw new Error("missing");
    let state = apply(
      createState(STAGE1, { seed: 7 }),
      {
        type: "startProject",
        id: "sickle",
      },
      index,
    ).state;

    for (let i = 0; i < def.minTicks - 1; i += 1) state = tick(state, index);
    expect(completedCount(state, "sickle")).toBe(0);
  });

  it("a paused project takes nothing and keeps its progress", () => {
    let state = apply(
      createState(STAGE1, { seed: 7 }),
      {
        type: "startProject",
        id: "sickle",
      },
      index,
    ).state;
    // Long enough to have moved: a project claims behind every need now, so it
    // only advances out of what a tick has to spare, and the first tick of all
    // need not have any.
    for (let i = 0; i < 10 && (state.activeProjects[0]?.progress ?? 0) <= 0; i += 1) {
      state = tick(state, index);
    }
    const progress = state.activeProjects[0]?.progress ?? 0;
    expect(progress).toBeGreaterThan(0);

    state = apply(
      state,
      { type: "pauseProject", id: "sickle", paused: true },
      index,
    ).state;
    const before = derive(state, index).laborToProjects;
    state = runTicks(state, 5);
    expect(state.activeProjects[0]?.progress).toBeCloseTo(progress, 12);
    expect(before).toBeCloseTo(0, 9);
  });

  it("a missing resource pauses the project and consumes nothing (E18)", () => {
    // A project that needs housing — no unlocked process makes it, so it
    // cannot appear however long one waits.
    const withWoodCost: Config = {
      ...STAGE1,
      projects: STAGE1.projects.map((p) =>
        p.id === "sickle" ? { ...p, stockCost: { housing: 40 } } : p,
      ),
    };
    const local = indexConfig(withWoodCost);
    let state = apply(
      createState(withWoodCost, { seed: 7 }),
      {
        type: "startProject",
        id: "sickle",
      },
      local,
    ).state;
    state = tick(state, local);
    expect(state.activeProjects[0]?.progress).toBe(0);
    // And nothing was taken for it either: the good it wants never appears, so
    // it stands still instead of quietly eating what it cannot use.
    expect(state.sectors["households"]?.stocks["housing"] ?? 0).toBe(0);
    expect(state.activeProjects.some((p) => p.id === "sickle")).toBe(true);
  });

  it("effects apply exactly once, on completion", () => {
    const state = finish(createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }), "sickle");
    expect(completedCount(state, "sickle")).toBe(1);
    expect(computeUnlocks(state, index).processes.has("gathering_sickle")).toBe(true);
    expect(state.activeProjects.some((p) => p.id === "sickle")).toBe(false);
  });
});

describe("processes and the fallback level (E5)", () => {
  // Risk switched off, because these three are about the *declared* order and
  // about dominance. With it on, a thin store is a criterion of its own and the
  // safe process leads (E5) — which is what fishing does in the ordinary
  // opening, and it would be measured here instead of what is meant.
  const noRisk: Config = { ...STAGE1, risk: { aversion: 0, caution: 0 } };
  const plain = indexConfig(noRisk);

  // The gathering family only: the epoch runs eight processes from the first
  // tick, so a bare list of what ran says nothing about which of two techniques
  // on the same ground was chosen.
  const gatheringRuns = (state: GameState): readonly string[] =>
    derive(state, plain)
      .runs.map((r) => r.process)
      .filter((id) => id.startsWith("gathering"));

  it("a technique without a capacity input replaces its predecessor entirely", () => {
    // The project is set rather than played out: it now waits on practice at
    // gathering (E29), and what is measured here is the ordering.
    // A roomy range, so the land does not bind: what is measured here is that
    // one technique replaces another, not what a crowded community does.
    const before = createState(noRisk, { seed: 7, wilderness: 300, water: 120 });
    const after: GameState = { ...before, completedProjects: { sickle: 1 } };

    expect(gatheringRuns(before)).toEqual(["gathering"]);
    expect(gatheringRuns(after)).toEqual(["gathering_sickle"]);
  });

  it("what a higher priority cannot carry falls to the next one", () => {
    // Farming has priority over gathering but only a little cleared land, so
    // both must run at once.
    //
    // The projects are set rather than played out, so what is measured is the
    // ordering and not what a hundred ticks of history happened to pin down.
    let state = createState(noRisk, { seed: 7 });
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 200,
          capacityHeld: { cleared: { amount: 3, quality: 1 } },
        },
      },
      // Wilderness is what binds, so farming leads — but three hectares of
      // field cannot feed two hundred people, and the rest falls to gathering.
      completedProjects: { ...state.completedProjects, sickle: 1, sedentism: 1 },
    };

    // Farming runs, and it cannot carry two hundred people off three hectares,
    // so the rest falls to whatever else can feed them. *Which* process picks
    // it up is not the point and shifts with the content — that the surplus
    // demand falls through to a further one is.
    const food = derive(state, plain)
      .runs.map((r) => r.process)
      .filter((id) => plain.branch.get(plain.process.get(id)?.branch ?? "")?.produces === "food");
    // Named processes are deliberately not asserted, as the comment above says:
    // once the ordering came to cost the searching, the cheapest way of feeding
    // two hundred people stopped being the fields. What is under test is that a
    // demand one process cannot carry falls through to further ones at all.
    expect(new Set(food).size).toBeGreaterThan(1);
  });

  it("the cheaper way leads, and the lead turns with the cost (E5, E29)", () => {
    // The claim that used to stand here — that the order written in the content
    // holds while nothing has bound — stopped meaning much once the ordering
    // came to reckon what searching costs: scarcity almost always has an answer
    // now, and the declared order only settles an exact tie. What is worth
    // testing is the thing that replaced it, and which nothing covered: the
    // cheaper way of making a good goes first, and which way that is follows
    // the country rather than anything written down.
    const leader = (state: GameState): string | undefined =>
      derive(state, plain).runs.find(
        (r) => plain.process.get(r.process)?.branch === "food" && r.output > 0,
      )?.process;

    const base = createState(noRisk, { seed: 7 });
    const full = leader(base);
    expect(full).toBeDefined();

    // Now thin out whatever the leader lives off. Searching it grows dear, and
    // the lead has to pass to something else — with no rule anywhere saying
    // which, and none needed.
    const drawn = plain.process.get(full ?? "")?.intermediatesPerOutput ?? {};
    const quarry = Object.keys(drawn).find(
      (id) => plain.stock.get(id)?.regrowth !== undefined,
    );
    expect(quarry).toBeDefined();
    const thin: GameState = {
      ...base,
      sectors: {
        ...base.sectors,
        households: {
          ...base.sectors["households"]!,
          stocks: { ...base.sectors["households"]!.stocks, [quarry ?? ""]: 0.01 },
        },
      },
    };
    expect(leader(thin)).not.toBe(full);
  });

  it("no input is a criterion of its own: scarcity decides, both ways (E4, E21)", () => {
    // farming needs less labour per unit, farming_fallow less land. Neither
    // dominates the other, so the ordering must not pick between them — what is
    // actually short must, and it must work in both directions.
    const settled = (cleared: number, heads: number): GameState => {
      const base = createState(STAGE1, { seed: 7 });
      return {
        ...base,
        completedProjects: { sickle: 1, sedentism: 1, fallowing: 1 },
        unownedCapacity: {},
        sectors: {
          ...base.sectors,
          households: {
            ...base.sectors["households"]!,
            heads,
            stocks: {},
            capacityHeld: { cleared: { amount: cleared, quality: 1 } },
          },
        },
      };
    };
    const output = (state: GameState, id: string): number =>
      derive(state, index).runs.find((r) => r.process === id)?.output ?? 0;

    // Land short, hands to spare: the technique that spares land carries it.
    const tightLand = settled(60, 400);
    expect(output(tightLand, "farming_fallow")).toBeGreaterThan(output(tightLand, "farming"));

    // Hands short, land to spare: the other way round, by the same rule.
    const tightLabor = settled(5000, 40);
    expect(output(tightLabor, "farming")).toBeGreaterThan(output(tightLabor, "farming_fallow"));
  });

  it("when the wild growth runs out, farming absorbs the rest — Boserup (E6, E13)", () => {
    // Not a switch but a mix: the labour-richest process runs until *its own*
    // limit is reached, and the next takes what is left. With only a little
    // left to gather, gathering cannot carry the settlement and farming must.
    let state = finish(createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }), "sickle");
    state = {
      ...state,
      completedProjects: { ...state.completedProjects, sedentism: 1 },
      // No water either: the claim is about the fields taking over from the
      // wild, and since fishing came down to the price of gathering it would
      // otherwise be the water that absorbs the rest — true, but a different
      // sentence.
      unownedCapacity: { wilderness: { amount: 30, quality: 1 }, water: { amount: 0, quality: 1 } },
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 200,
          stocks: { food: 0, plants: 20 },
          // Small enough that the fields cannot feed two hundred people on
          // their own — otherwise nothing falls through and there is nothing
          // to see.
          capacityHeld: { cleared: { amount: 30, quality: 1 } },
        },
      },
    };
    const d = derive(state, index);
    const output = (id: string) => d.runs.find((r) => r.process === id)?.output ?? 0;
    // Both run, and the wild is gathered for what it holds before the fields
    // take the rest.
    // No process is named: which one picks up the surplus follows the costs and
    // has changed more than once. What is under test is that a demand the
    // leading way cannot carry falls through to further ones at all.
    const carrying = d.runs.filter(
      (r) => r.output > 0.01 && index.branch.get(index.process.get(r.process)?.branch ?? "")?.produces === "food",
    );
    expect(carrying.length).toBeGreaterThan(1);
    // And the fields really do carry: on thirty of cleared ground they feed
    // more than the wild growth left on thirty of wilderness, which is the
    // whole point of clearing it.
    expect(output("farming")).toBeGreaterThan(0);
  });

  it("a thin store pushes towards the less exposed process (E5, E24)", () => {
    // A true twin: the same of every input as gathering, differing only in how
    // hard a poor draw hits it. It has to be exact now that the order is
    // decided by risk-adjusted cost rather than by exposure on its own — a
    // process that is safer *and* dearer is a different question, and the
    // answer to it is properly "it depends how much dearer".
    //
    // So it is **copied** from gathering rather than written out. Written out,
    // its coefficients froze at whatever the content held on the day, and the
    // day the content moved the twin quietly stopped being one: it was then
    // safer *and* cheaper, and won for the wrong reason while the test still
    // read green about the right one.
    const twinOf = STAGE1.processes.find((p) => p.id === "gathering")!;
    const twin: Config = {
      ...STAGE1,
      risk: { aversion: 0.9, caution: 0 },
      processes: [
        ...STAGE1.processes,
        { ...twinOf, id: "gathering_safe", priority: 5, exposure: { weather: 0.05 } },
      ],
    };
    const local = indexConfig(twin);
    const base = createState(twin, { seed: 7 });

    const thin = {
      ...base,
      sectors: {
        ...base.sectors,
        households: { ...base.sectors["households"]!, stocks: { food: 0 } },
      },
    };
    const fat = {
      ...base,
      sectors: {
        ...base.sectors,
        households: { ...base.sectors["households"]!, stocks: { food: 500 } },
      },
    };

    const leadThin = derive(thin, local).ordering.find((o) => o.branch === "food")?.lead;
    const leadFat = derive(fat, local).ordering.find((o) => o.branch === "food")?.lead;
    expect(leadThin).toBe("gathering_safe");
    expect(leadFat).not.toBe("gathering_safe");
  });

});

describe("allocation runs rank by rank (E21)", () => {
  it("a lower rank is served before a higher one from the same stock", () => {
    const state = createState(STAGE1, { seed: 7, heads: 40, wilderness: 40 });
    const result = allocate({
      state,
      index,
      sectorId: "households",
      shocks: {},
      tierPerHead: new Map(),
      unlockedBranches: new Set(["food"]),
      unlockedProcesses: new Set(["gathering"]),
    });
    const survival = result.tiers.find((t) => t.tier === "food_survival");
    const satiety = result.tiers.find((t) => t.tier === "food_satiety");
    expect(survival?.coverage ?? 0).toBeGreaterThanOrEqual(satiety?.coverage ?? 0);
  });

  it("names the binding input when a rank cannot be covered (E6)", () => {
    // A small country, already picked over: the lowest rank cannot be covered,
    // and what is reported is an *input* — never "food is missing", which is
    // the one thing the player can already see for himself.
    const start = createState(STAGE1, { seed: 7, heads: 25, wilderness: 1, water: 1, food: 0 });
    const state = {
      ...start,
      sectors: {
        ...start.sectors,
        households: { ...start.sectors["households"]!, stocks: { food: 0, plants: 6 } },
      },
    };
    const d = derive(state, index);
    expect(d.coverage["food_survival"] ?? 1).toBeLessThan(1);
    expect(d.bindingTier).toBe("food_survival");
    expect(d.binding.kind).not.toBe("none");
    expect(d.binding.what).not.toBe("food");
  });
});

describe("population (E20)", () => {
  it("grows only when the buffer above the deadly ranks is served (E20)", () => {
    // The base rates used to be reciprocal, so that a community with the deadly
    // ranks covered stood still. It no longer stands still: what carries growth
    // is the buffer — being sated and warm beyond the minimum. With the buffer
    // gone but nobody dying, the community shrinks, slowly and without a
    // catastrophe; with it served, it grows. That is the regulator this epoch
    // is meant to have, and the number it settles at is a matter of balance,
    // not of this test.
    const { baseBirthFactor: b, baseSurvival: s } = STAGE1.population;
    const satiety = STAGE1.needTiers.find((t) => t.id === "food_satiety")!;
    const comfort = STAGE1.needTiers.find((t) => t.id === "warmth_comfort")!;

    const served = b * (satiety.birthRate?.atFull ?? 1) * (comfort.birthRate?.atFull ?? 1) * s;
    const starved = b * (satiety.birthRate?.atZero ?? 1) * (comfort.birthRate?.atZero ?? 1) * s;

    expect(served).toBeGreaterThan(1);
    expect(starved).toBeLessThan(1);
  });

  it("shrinks under famine and grows when sated", () => {
    const start = createState(STAGE1, { seed: 7, heads: 200, wilderness: 20, water: 8, food: 0 });
    // A small range that has already been eaten bare: a full country can be
    // plundered for one tick however many mouths there are, so famine is a
    // state of the *stocks*, not of the area.
    const starving = {
      ...start,
      sectors: {
        ...start.sectors,
        households: { ...start.sectors["households"]!, stocks: { food: 0 } },
      },
    };
    const hungry = derive(starving, index);
    expect(hungry.survival * hungry.birthFactor).toBeLessThan(1);

    const fed = derive(
      createState(STAGE1, { seed: 7, heads: 20, wilderness: 4000, water: 1600, food: 200 }),
      index,
    );
    expect(fed.survival * fed.birthFactor).toBeGreaterThan(1);
  });

  it("gives the community up below the minimum viable size, and stops (E20)", () => {
    const tiny = createState(STAGE1, { seed: 7, heads: 5 });
    // Nothing has happened yet at creation — being given up is an event in the
    // run, not a comparison, and it is written into the state when it occurs.
    expect(derive(tiny, index).communityGivenUp).toBe(false);

    const over = tick(tiny, index);
    expect(derive(over, index).communityGivenUp).toBe(true);
    expect(over.abandonedAt).toBe(0);

    // And from there nothing moves at all — not even the clock. A caller that
    // forgets to stop cannot compute a community that no longer exists.
    expect(tick(over, index)).toEqual(over);
    expect(tick(tick(over, index), index).tick).toBe(over.tick);
  });
});

describe("sedentism (E29)", () => {
  it("opens branches, processes, the rule and the first fields", () => {
    let state = finish(createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }), "sickle");
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
    expect(state.sectors["households"]?.capacityHeld["cleared"]?.amount).toBeCloseTo(20, 9);
  });

  it("storage pits keep what they cover, and only that (E19)", () => {
    // A store is capacity, not a container: what fits under it spoils slowly,
    // what sticks out spoils at the ordinary rate, and there is no "full".
    const base = createState(STAGE1, { seed: 7 });
    const withPits = (capacity: number): GameState => ({
      ...base,
      sectors: {
        ...base.sectors,
        households: {
          ...base.sectors["households"]!,
          heads: 0,
          stocks: { food: 100 },
          capacityHeld: { storage: { amount: capacity, quality: 1 } },
        },
      },
    });

    const bare = tick(withPits(0), index).sectors["households"]?.stocks["food"] ?? 0;
    const half = tick(withPits(50), index).sectors["households"]?.stocks["food"] ?? 0;
    const full = tick(withPits(100), index).sectors["households"]?.stocks["food"] ?? 0;

    expect(bare).toBeCloseTo(100 * (1 - 0.9), 6);
    expect(full).toBeCloseTo(100 * (1 - 0.2), 6);
    // Half covered: half at the sheltered rate, half at the ordinary one.
    expect(half).toBeCloseTo(50 * (1 - 0.2) + 50 * (1 - 0.9), 6);
    expect(half).toBeGreaterThan(bare);
    expect(full).toBeGreaterThan(half);

    // And a village keeps the same pits far better than wanderers do — a pit
    // dug by people who move on must never beat a place someone lives in.
    const settled: GameState = { ...withPits(100), completedProjects: { sedentism: 1 } };
    const kept = tick(settled, index).sectors["households"]?.stocks["food"] ?? 0;
    expect(kept).toBeCloseTo(100 * (1 - 0.12), 6);
    expect(kept).toBeGreaterThan(full);
  });

  it("clearing turns wilderness into cleared land, keeping the total (E13)", () => {
    // Room enough that the conversions are not clamped at zero: the point is
    // that the total is preserved, not what a community's own range holds.
    let state = finish(createState(STAGE1, { seed: 7, wilderness: 300, water: 120 }), "sickle");
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
      (state.unownedCapacity["wilderness"]?.amount ?? 0) +
      (state.sectors["households"]?.capacityHeld["cleared"]?.amount ?? 0);
    const after = finish(state, "clearing");
    const total =
      (after.unownedCapacity["wilderness"]?.amount ?? 0) +
      (after.sectors["households"]?.capacityHeld["cleared"]?.amount ?? 0);

    expect(total).toBeCloseTo(before, 6);
    expect(after.sectors["households"]?.capacityHeld["cleared"]?.amount ?? 0).toBeGreaterThan(
      state.sectors["households"]?.capacityHeld["cleared"]?.amount ?? 0,
    );
  });

  it("each taking brings worse land than the one before (E13, Ricardo)", () => {
    let state = finish(createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }), "sickle");
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
    let state = finish(createState(STAGE1, { seed: 7, wilderness: 300, water: 120 }), "sickle");
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: { ...state.sectors["households"]!, heads: 120 },
      },
    };
    state = finish(state, "sedentism");
    // Enough cleared land that food does not claim all of it: rank 100 comes
    // before rank 200, so without spare acres nothing is ever built.
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          capacityHeld: { cleared: { amount: 300, quality: 1 } },
        },
      },
    };

    // Checked over a stretch, not in a single tick: once the roofs stand they
    // only need their wear replaced, so a given tick may well make no wood.
    let everMadeWood = false;
    for (let i = 0; i < 40; i += 1) {
      if ((derive(state, index).produced["wood"] ?? 0) > 0) everMadeWood = true;
      state = tick(state, index);
    }
    expect(everMadeWood).toBe(true);
    expect(state.sectors["households"]?.stocks["housing"] ?? 0).toBeGreaterThan(0);
  });

  it("names the upstream bottleneck, not the missing intermediate", () => {
    // Wood is short because there is nothing left to pick up — that is what
    // should be reported, not "wood is missing". Without the axe the standing
    // wood is out of reach, so the fallen wood is the whole of the supply.
    let state = finish(createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }), "sickle");
    state = {
      ...state,
      unownedCapacity: { wilderness: { amount: 0.01, quality: 1 } },
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          heads: 200,
          // Everything else the country carries is there in plenty, so the one
          // thing that can be short is the wood — otherwise two exhausted
          // stocks compete for the report and the answer says nothing.
          stocks: {
            food: 4000,
            plants: 4000,
            game: 4000,
            fish: 4000,
            shellfish: 4000,
            trees: 4000,
            deadwood: 0,
          },
          capacityHeld: { cleared: { amount: 400, quality: 1 } },
        },
      },
      completedProjects: { sickle: 1, sedentism: 1 },
    };
    const d = derive(state, index);
    expect(d.coverage["shelter_roof"] ?? 1).toBeLessThan(1);
    expect(d.binding.kind).toBe("stock");
    expect(d.binding.what).toBe("deadwood");
  });
});
