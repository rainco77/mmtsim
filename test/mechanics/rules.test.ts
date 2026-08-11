import { describe, expect, it } from "vitest";
import { STAGE1 } from "../../src/content/stage1.ts";
import {
  allocate,
  apply,
  backloadFactor,
  completedCount,
  computeUnlocks,
  createState,
  derive,
  drawShocks,
  effectTypesWithHandler,
  indexConfig,
  nextRangeQuality,
  PIPELINE,
  tick,
  type AllocationResult,
  type Config,
  type ConfigIndex,
  type GameState,
  type Unlocks,
} from "../../src/sim/index.ts";
import { counterOf, draw, uniformAt } from "../../src/sim/random.ts";
import { startReadings } from "../../src/sim/outset.ts";

/** A head count split over the cohorts the way the content starts them (E20). */
const asCohorts = (heads: number): Record<string, number> =>
  Object.fromEntries(
    STAGE1.population.cohorts.map((c) => [
      c.id,
      heads * (STAGE1.population.shareAtStart[c.id] ?? 0),
    ]),
  );

/** Does the community grow this tick — born against died, over all cohorts (E20). */
const grows = (state: GameState, index: ConfigIndex): boolean => {
  const d = derive(state, index);
  let died = 0;
  for (const [id, heads] of Object.entries(d.cohorts))
    died += heads * (1 - (d.survival[id] ?? 1));
  return d.born > died;
};

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
  for (
    let i = 0;
    i < def.minTicks * 20 && completedCount(next, projectId) === 0;
    i += 1
  ) {
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
    const projects = new Set(STAGE1.projects.map((p) => p.id));
    for (const process of STAGE1.processes) {
      for (const id of process.needsProjects ?? [])
        expect(projects.has(id), id).toBe(true);
    }
    for (const project of STAGE1.projects) {
      for (const effect of project.effects) {
        if (effect.type === "process") expect(processes.has(effect.id)).toBe(true);
        if (effect.type === "branch") expect(branches.has(effect.id)).toBe(true);
        if (effect.type === "capacity")
          expect(capacityHeld.has(effect.capacity)).toBe(true);
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

describe("the opening country (E14)", () => {
  it("does not move in the opening ticks", () => {
    // What it is not allowed to do is climb: an opening below where the taking
    // holds it makes the first stretch of every run a country filling up, and
    // everything measured there is measured on a range that is getting richer
    // rather than one that is being lived on.
    const density = (state: GameState): number => {
      const shares: number[] = [];
      for (const stand of Object.values(derive(state, index).renewable)) {
        if (stand !== undefined && stand.ceiling > 0)
          shares.push(stand.held / stand.ceiling);
      }
      return shares.reduce((a, b) => a + b, 0) / Math.max(1, shares.length);
    };

    const drifts: number[] = [];
    for (const seed of [1, 2, 3, 4]) {
      let state = createState(STAGE1, { seed });
      const opened = density(state);
      for (let i = 0; i < 20; i += 1) state = tick(state, index);
      drifts.push(density(state) - opened);
    }
    const drift = drifts.reduce((a, b) => a + b, 0) / drifts.length;
    expect(Math.abs(drift)).toBeLessThan(0.1);
  });

  it("does not depend on a figure written beside the regrowth rule", () => {
    // Halve what the ground carries and the opening follows of itself: the
    // stands come out lower, and each still rests where its own growth meets
    // its own taking.
    const thin: Config = {
      ...STAGE1,
      stocks: STAGE1.stocks.map((s) =>
        s.regrowth === undefined
          ? s
          : {
              ...s,
              regrowth: { ...s.regrowth, densityPerArea: s.regrowth.densityPerArea / 2 },
            },
      ),
    };
    const local = indexConfig(thin);
    const held = (config: Config, idx: ConfigIndex): number =>
      derive(createState(config, { seed: 1 }), idx).renewable["plants"]?.held ?? 0;
    expect(held(thin, local)).toBeLessThan(held(STAGE1, index));
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
          households: { ...state.sectors["households"]!, cohorts: asCohorts(25) },
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
    const state = finish(
      createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }),
      "sickle",
    );
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
          cohorts: asCohorts(200),
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
      .filter(
        (id) =>
          plain.branch.get(plain.process.get(id)?.branch ?? "")?.produces === "food",
      );
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
            cohorts: asCohorts(heads),
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
    expect(output(tightLand, "farming_fallow")).toBeGreaterThan(
      output(tightLand, "farming"),
    );

    // Hands short, land to spare: the other way round, by the same rule.
    const tightLabor = settled(5000, 40);
    expect(output(tightLabor, "farming")).toBeGreaterThan(
      output(tightLabor, "farming_fallow"),
    );
  });

  it("when the wild growth runs out, farming absorbs the rest — Boserup (E6, E13)", () => {
    // Not a switch but a mix: the labour-richest process runs until *its own*
    // limit is reached, and the next takes what is left. With only a little
    // left to gather, gathering cannot carry the settlement and farming must.
    let state = finish(
      createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }),
      "sickle",
    );
    state = {
      ...state,
      completedProjects: { ...state.completedProjects, sedentism: 1 },
      // No water either: the claim is about the fields taking over from the
      // wild, and since fishing came down to the price of gathering it would
      // otherwise be the water that absorbs the rest — true, but a different
      // sentence.
      unownedCapacity: {
        wilderness: { amount: 30, quality: 1 },
        water: { amount: 0, quality: 1 },
      },
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          cohorts: asCohorts(200),
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
      (r) =>
        r.output > 0.01 &&
        index.branch.get(index.process.get(r.process)?.branch ?? "")?.produces === "food",
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

    // Only the store of food is moved. The ranges live in the same record, so
    // replacing it outright empties them, and then the order is decided by
    // whichever range is least ruined rather than by the exposure under test.
    const withFood = (amount: number) => ({
      ...base,
      sectors: {
        ...base.sectors,
        households: {
          ...base.sectors["households"]!,
          stocks: { ...base.sectors["households"]!.stocks, food: amount },
        },
      },
    });
    const thin = withFood(0);
    const fat = withFood(500);

    const leadThin = derive(thin, local).ordering.find((o) => o.branch === "food")?.lead;
    const leadFat = derive(fat, local).ordering.find((o) => o.branch === "food")?.lead;
    expect(leadThin).toBe("gathering_safe");
    expect(leadFat).not.toBe("gathering_safe");
  });

  it("a thinned range pushes away from what it carries (E5, E29)", () => {
    // The other half of what a unit costs. Exposure is one factor in it and the
    // cost of searching is another, and only the first had anything holding it.
    //
    // No process is named: which one leads follows the content and has changed
    // more than once. The range the leader draws from is found first, then that
    // very range is thinned — so the experiment stays controlled whatever the
    // content says today.
    const state = createState(STAGE1, { seed: 7 });
    const held = state.sectors["households"]!.stocks;
    const quarryOf = (process: string): string | undefined =>
      Object.keys(index.process.get(process)?.intermediatesPerOutput ?? {}).find(
        (id) => index.stock.get(id)?.regrowth !== undefined,
      );

    const leadBefore = derive(state, index).ordering.find(
      (o) => o.branch === "food",
    )?.lead;
    const quarry = quarryOf(leadBefore ?? "");
    expect(quarry).toBeDefined();

    const thinned = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          stocks: { ...held, [quarry!]: (held[quarry!] ?? 0) * 0.1 },
        },
      },
    };

    const leadAfter = derive(thinned, index).ordering.find(
      (o) => o.branch === "food",
    )?.lead;
    expect(leadAfter).not.toBe(leadBefore);
    expect(quarryOf(leadAfter ?? "")).not.toBe(quarry);
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
    const start = createState(STAGE1, {
      seed: 7,
      heads: 25,
      wilderness: 1,
      water: 1,
      food: 0,
    });
    const state = {
      ...start,
      sectors: {
        ...start.sectors,
        households: { ...start.sectors["households"]!, stocks: { food: 0, plants: 6 } },
      },
    };
    const d = derive(state, index);
    expect(d.coverage["food_survival"] ?? 1).toBeLessThan(1);
    // The answer is the rank's own and there is no tick-wide one beside it:
    // every rank draws on the one pot, so a single figure for the whole tick
    // belongs to some other rank as often as not.
    const short = d.tiers.find((t) => t.tier === "food_survival");
    expect(short?.binding.kind).not.toBe("none");
    expect(short?.binding.what).not.toBe("food");
  });

  /**
   * The weather is the fourth kind of brake and it is the **residual**: a rank
   * that went short although the solution exhausted no input of its chain was
   * held back by the draw and by nothing else.
   *
   * The case cannot arise out of this epoch's content — every process in it
   * finds its return and therefore sees the draw while it works, so the plan
   * promises exactly what the draw allows. It is reachable only where the
   * effort goes out before the draw is known, and a sown crop is the plainest
   * such thing. So one is built here: it takes hands and nothing else, and
   * there are hands to spare, so nothing whatever can run out on it.
   */
  describe("the weather as the fourth brake (T9)", () => {
    const sown: Config = {
      ...STAGE1,
      projects: [],
      stocks: [...STAGE1.stocks, { id: "grain", decayPerTick: 1 }],
      branches: [
        ...STAGE1.branches,
        { id: "grain", produces: "grain", unlockedFromStart: true },
      ],
      processes: [
        ...STAGE1.processes,
        {
          id: "sowing",
          branch: "grain",
          activity: "sowing",
          priority: 100,
          unlockedFromStart: true,
          // One sows and the weather decides afterwards: the effort is
          // committed before the draw is known.
          yield: "committed",
          exposure: { weather: 1 },
          capacityPerOutput: {},
          intermediatesPerOutput: { labor: 1 },
          qualityWeight: 0,
        },
      ],
      needTiers: [
        {
          id: "grain_need",
          rank: 100,
          stock: "grain",
          branch: "grain",
          // Small, so the hands are never the thing that binds.
          perHead: 0.2,
          perHeadWeight: { growing: 1, grown: 1 },
          consumedOnUse: 1,
        },
      ],
    };
    const sownIndex = indexConfig(sown);

    /** A seed whose draw falls below the one the plan reckoned with. */
    const poorDraw = (): { state: GameState; shocks: Record<string, number> } => {
      const planned = 1 - sown.risk.caution;
      for (let seed = 1; seed < 200; seed += 1) {
        const state = createState(sown, { seed });
        const shocks = drawShocks(state.random, sown);
        if ((shocks.shocks["weather"] ?? 1) < planned - 1e-6)
          return { state, shocks: { ...shocks.shocks } };
      }
      throw new Error("no seed drew below the planned draw");
    };

    const outcome = (): AllocationResult => {
      const { state, shocks } = poorDraw();
      const unlocks = computeUnlocks(state, sownIndex);
      return allocate({
        state,
        index: sownIndex,
        sectorId: "households",
        shocks,
        tierPerHead: unlocks.tierPerHead,
        unlockedBranches: unlocks.branches,
        unlockedProcesses: unlocks.processes,
      });
    };

    it("names the weather where the rank went short and nothing ran out", () => {
      const tier = outcome().tiers.find((t) => t.tier === "grain_need");
      expect(tier?.coverage ?? 1).toBeLessThan(1);
      expect(tier?.binding.kind).toBe("weather");
      // Nothing is named beside it: there was nothing to name.
      expect(tier?.binding.what).toBeUndefined();
    });

    it("between plan and outcome lies only the draw", () => {
      const { state, shocks } = poorDraw();
      const unlocks = computeUnlocks(state, sownIndex);
      const result = allocate({
        state,
        index: sownIndex,
        sectorId: "households",
        shocks,
        tierPerHead: unlocks.tierPerHead,
        unlockedBranches: unlocks.branches,
        unlockedProcesses: unlocks.processes,
      });
      const tier = result.tiers.find((t) => t.tier === "grain_need");
      // The plan committed enough to reach its target at the draw it reckoned
      // with; what came back is that same commitment at the draw that fell. So
      // the coverage is the one draw over the other and nothing else.
      expect(tier?.coverage ?? 0).toBeCloseTo(
        (shocks["weather"] ?? 1) / (1 - sown.risk.caution),
        6,
      );
    });
  });
});

describe("population (E20)", () => {
  it("plenty decides who comes through, the carrying decides who is born (E20, E29)", () => {
    // No need tier moves the births: their pace is the base rate, their level
    // is the carrying brake. What want moves instead is the survival of the
    // growing — care and comfort touch the children and never the grown.
    for (const tier of STAGE1.needTiers) expect(tier.birthRate).toBeUndefined();
    for (const id of ["childcare", "warmth_comfort"]) {
      const tier = STAGE1.needTiers.find((t) => t.id === id);
      expect(tier?.survival).toBeDefined();
      expect(tier?.survival?.per["grown"]).toBe(0);
      expect(tier?.survival?.per["growing"]).toBeGreaterThan(0);
    }
  });

  it("shrinks under famine and grows when sated", () => {
    const start = createState(STAGE1, {
      seed: 7,
      heads: 200,
      wilderness: 20,
      water: 8,
      food: 0,
    });
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
    expect(grows(starving, index)).toBe(false);

    expect(
      grows(
        createState(STAGE1, {
          seed: 7,
          heads: 20,
          wilderness: 4000,
          water: 1600,
          food: 200,
        }),
        index,
      ),
    ).toBe(true);
  });

  it("the newborn land among the growing, never among the workers (E20)", () => {
    // On their own, with nobody dying and nobody growing up, so the only thing
    // that can move a cohort is a birth.
    const only = indexConfig({
      ...STAGE1,
      population: {
        ...STAGE1.population,
        baseSurvival: { growing: 1, grown: 1 },
        transitions: [],
      },
    });
    const state = createState(STAGE1, {
      seed: 7,
      wilderness: 4000,
      water: 1600,
      food: 400,
    });
    const before = state.sectors["households"]!.cohorts;
    const born = derive(state, only).born;
    const after = tick(state, only).sectors["households"]!.cohorts;

    expect(born).toBeGreaterThan(0);
    expect(after["grown"]).toBeCloseTo(before["grown"]!, 9);
    expect(after["growing"]).toBeCloseTo(before["growing"]! + born, 9);
  });

  it("only heads with a labour weight perform work (E20)", () => {
    const state = createState(STAGE1, { seed: 7 });
    const sector = state.sectors["households"]!;
    const d = derive(state, index);

    const byHand =
      sector.cohorts["growing"]! * STAGE1.population.labourWeight["growing"]! +
      sector.cohorts["grown"]! * STAGE1.population.labourWeight["grown"]!;
    expect(d.workingHeads).toBeCloseTo(byHand, 9);
    expect(d.workingHeads).toBeLessThan(d.heads);
    expect(d.laborPerformance).toBeCloseTo(byHand * d.workAbility * d.productivity, 6);
  });

  it("care is asked for the growing and not for the heads (E20)", () => {
    // Same number of people, split two ways. What care asks for has to follow
    // the children and nothing else.
    const shift = (state: GameState, growing: number, grown: number): GameState => ({
      ...state,
      sectors: {
        ...state.sectors,
        households: { ...state.sectors["households"]!, cohorts: { growing, grown } },
      },
    });
    const base = createState(STAGE1, {
      seed: 7,
      wilderness: 4000,
      water: 1600,
      food: 400,
    });
    const askedFor = (state: GameState): number =>
      derive(state, index).tiers.find((t) => t.tier === "childcare")?.need ?? 0;

    const few = askedFor(shift(base, 10, 30));
    const many = askedFor(shift(base, 20, 20));
    expect(many).toBeCloseTo(2 * few, 6);
  });

  it("every transition of a tick is reckoned from the same standing (E20)", () => {
    // Two steps in a row, both moving everybody. Worked one after the other,
    // whoever was in the first would land in the third within one tick; from
    // one standing, each moves exactly one step.
    const chain = indexConfig({
      ...STAGE1,
      population: {
        ...STAGE1.population,
        cohorts: [{ id: "first" }, { id: "second" }, { id: "third" }],
        shareAtStart: { first: 1, second: 0, third: 0 },
        labourWeight: { first: 1, second: 1, third: 1 },
        birthWeight: { first: 0, second: 0, third: 0 },
        backload: {
          ...STAGE1.population.backload!,
          loadWeight: { first: 0, second: 0, third: 0 },
        },
        baseSurvival: { first: 1, second: 1, third: 1 },
        viableWeight: { first: 1, second: 1, third: 1 },
        birthsInto: "first",
        transitions: [
          { from: "first", to: "second", perTick: 1 },
          { from: "second", to: "third", perTick: 1 },
        ],
      },
      needTiers: STAGE1.needTiers.map((t) => ({
        ...t,
        perHeadWeight: { first: 1, second: 1, third: 1 },
        ...(t.survival === undefined
          ? {}
          : { survival: { ...t.survival, per: { first: 1, second: 1, third: 1 } } }),
      })),
    });
    const start = createState(chain.config, {
      seed: 7,
      wilderness: 4000,
      water: 1600,
      food: 400,
    });
    const moved = tick(start, chain).sectors["households"]!.cohorts;

    expect(moved["first"]).toBeCloseTo(0, 9);
    expect(moved["second"]).toBeCloseTo(25, 9);
    expect(moved["third"]).toBeCloseTo(0, 9);
  });

  it("content that leaves a cohort out of a vector is refused (E20)", () => {
    expect(() =>
      indexConfig({
        ...STAGE1,
        population: { ...STAGE1.population, labourWeight: { grown: 1 } },
      }),
    ).toThrow(/growing/);
  });

  it("giving up counts the grown, not the heads (E20)", () => {
    // The same number of people twice over. Ten of them growing and two grown
    // is a community that cannot recover; twelve grown is one that can.
    const base = createState(STAGE1, { seed: 7 });
    const of = (growing: number, grown: number): GameState => ({
      ...base,
      sectors: {
        ...base.sectors,
        households: { ...base.sectors["households"]!, cohorts: { growing, grown } },
      },
    });

    expect(tick(of(10, 2), index).abandonedAt).toBe(0);
    expect(tick(of(0, 12), index).abandonedAt).toBeUndefined();
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

describe("the next range (E13, E29)", () => {
  it("is reckoned from the range left, never from a count of moves", () => {
    const state = createState(STAGE1, { seed: 7 });
    const often = { ...state, landTakings: state.landTakings + 7 };
    expect(nextRangeQuality(often, STAGE1, "wilderness")).toBeCloseTo(
      nextRangeQuality(state, STAGE1, "wilderness"),
      12,
    );
  });

  it("a started move completes on the next tick, however scarce the hands", () => {
    // Walking is never put off for want of hands. The cost is set beyond
    // anything a community could perform in a tick, and the move is over on
    // the tick after it was started all the same — while a thing that is built
    // under the same cost and the same minimum duration does not move at all.
    const outOfReach = 400;
    const config: Config = {
      ...STAGE1,
      projects: STAGE1.projects.map((p) =>
        p.id === "range_change" || p.id === "fire_setting"
          ? { ...p, laborCost: outOfReach }
          : p,
      ),
    };
    const local = indexConfig(config);
    const start = createState(config, { seed: 7 });
    const started = (id: string): GameState =>
      tick(apply(start, { type: "startProject", id }, local).state, local);

    expect(completedCount(started("range_change"), "range_change")).toBe(1);
    expect(completedCount(started("fire_setting"), "fire_setting")).toBe(0);
  });

  it("the move settles the range that was scouted, not the offer at arrival", () => {
    // The offer is redrawn every tick. Whatever the draw does, the range moved
    // into is the one the decision was made on.
    const scoutedAt = 1 + STAGE1.land.qualitySpread;
    let state: GameState = { ...createState(STAGE1, { seed: 7 }), landOffer: scoutedAt };
    const before = state.unownedCapacity["wilderness"]!.quality;
    state = apply(state, { type: "startProject", id: "range_change" }, index).state;
    for (let i = 0; i < 60 && completedCount(state, "range_change") === 0; i += 1) {
      state = tick(state, index);
    }
    expect(completedCount(state, "range_change")).toBe(1);
    expect(state.unownedCapacity["wilderness"]!.quality).toBeCloseTo(
      before * (1 - STAGE1.land.qualityDecayPerTaking) * scoutedAt,
      9,
    );
  });

  it("a good report can beat the range left; an average one is a step below", () => {
    const state = createState(STAGE1, { seed: 7 });
    const step = STAGE1.land.qualityDecayPerTaking;
    const offered = (offer: number): number =>
      nextRangeQuality({ ...state, landOffer: offer }, STAGE1, "wilderness");
    expect(offered(1)).toBeCloseTo(1 - step, 9);
    expect(offered(1 + STAGE1.land.qualitySpread)).toBeGreaterThan(1);
  });
});

describe("combined techniques (E5)", () => {
  it("a technique wanting several crafts opens only once all of them stand", () => {
    const base = createState(STAGE1, { seed: 7 });
    const withDone = (done: Record<string, number>): GameState => ({
      ...base,
      completedProjects: done,
    });
    expect(
      computeUnlocks(withDone({}), index).processes.has("gathering_sickle_mortar"),
    ).toBe(false);
    expect(
      computeUnlocks(withDone({ sickle: 1 }), index).processes.has(
        "gathering_sickle_mortar",
      ),
    ).toBe(false);
    expect(
      computeUnlocks(withDone({ sickle: 1, mortar: 1 }), index).processes.has(
        "gathering_sickle_mortar",
      ),
    ).toBe(true);
  });
});

describe("strain conditions (E28)", () => {
  it("every strain condition has a living reference at the outset", () => {
    // A strain is read against the opening position. An activity that does not
    // run at the opening leaves no reading, and the engine then falls back to
    // an absolute mark of one — meaningful for a searching price (one is fresh
    // country), meaningless for labour per head. Content must not step into
    // that fall-back: three projects hung on it and could never be seen.
    const readings = startReadings(index);
    for (const project of STAGE1.projects) {
      for (const condition of [...project.visibleWhen, ...project.availableWhen]) {
        if (condition.kind !== "strain") continue;
        if (!("labourPerHead" in condition.measure)) continue;
        const key = `labour:${condition.measure.labourPerHead}`;
        expect(readings[key], `${project.id} reads ${key}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("the burnt range (E29)", () => {
  it("a burn carries more, the bonus fades, and a move returns it to the ground", () => {
    const carried = (state: GameState): number => state.rangeCarries["plants"] ?? 0;
    let state = createState(STAGE1, { seed: 7 });
    state = finish(state, "fire_setting");
    const burnt = carried(state);
    expect(burnt).toBeGreaterThan(0);

    const later = runTicks(state, 5);
    expect(carried(later)).toBeLessThan(burnt);
    expect(carried(later)).toBeGreaterThan(0);

    const moved = finish(later, "range_change");
    expect(carried(moved)).toBe(0);
  });

  it("the burn eats standing deadwood", () => {
    const wood = (state: GameState): number =>
      state.sectors["households"]!.stocks["deadwood"] ?? 0;
    const state = createState(STAGE1, { seed: 7 });
    const before = wood(state);
    const burnt = finish(state, "fire_setting");
    const cost = STAGE1.projects.find((p) => p.id === "fire_setting")!.stockCost[
      "deadwood"
    ]!;
    expect(wood(burnt)).toBeLessThan(before - cost * 0.5);
  });
});

describe("the carrying brake (E20, E29)", () => {
  // A hand-shaped allocation: all searching labour on the plants, priced as
  // stated. Only the fields the brake reads are given.
  const searched = (effort: number): AllocationResult =>
    ({
      runs: [{ process: "gathering", output: 10, labor: 5, share: 1 }],
      effortPerStock: { plants: effort },
    }) as unknown as AllocationResult;
  const carrying = { growing: 10, grown: 15 };

  it("dearer searching cuts the births; fresh country carries no brake", () => {
    const cheap = backloadFactor(carrying, searched(1.0), undefined, index);
    const dear = backloadFactor(carrying, searched(1.4), undefined, index);
    const dearer = backloadFactor(carrying, searched(1.8), undefined, index);
    expect(cheap).toBe(1);
    expect(dear).toBeLessThan(cheap);
    expect(dearer).toBeLessThan(dear);
  });

  it("nobody to carry, no brake — however dear the searching", () => {
    expect(
      backloadFactor({ growing: 0, grown: 15 }, searched(2.0), undefined, index),
    ).toBe(1);
  });

  it("settling lifts it for good", () => {
    const settled = { rules: new Set(["settled"]) } as unknown as Unlocks;
    expect(backloadFactor(carrying, searched(2.0), settled, index)).toBe(1);
  });

  it("it can silence the births, never reverse them", () => {
    const crushing = indexConfig({
      ...STAGE1,
      population: {
        ...STAGE1.population,
        backload: { ...STAGE1.population.backload!, strength: 100 },
      },
    });
    expect(backloadFactor(carrying, searched(2.0), undefined, crushing)).toBe(0);
  });

  it("a community on a thinned range bears fewer than the brake-free reckoning", () => {
    // Same state, same allocation — the only difference is the brake, so the
    // gap between the two readings is the brake and nothing else.
    const unburdened = Object.fromEntries(
      Object.entries(STAGE1.population).filter(([key]) => key !== "backload"),
    ) as typeof STAGE1.population;
    const unbraked = indexConfig({ ...STAGE1, population: unburdened });
    const state = createState(STAGE1, { seed: 7 });
    expect(derive(state, index).born).toBeLessThan(derive(state, unbraked).born);
  });
});

describe("sedentism (E29)", () => {
  it("opens branches, processes, the rule and the first fields", () => {
    let state = finish(
      createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }),
      "sickle",
    );
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          cohorts: asCohorts(100),
        },
      },
    };
    state = finish(state, "sedentism");

    const unlocks = computeUnlocks(state, index);
    expect(unlocks.rules.has("settled")).toBe(true);
    expect(unlocks.processes.has("farming")).toBe(true);
    expect(state.sectors["households"]?.capacityHeld["cleared"]?.amount).toBeCloseTo(
      20,
      9,
    );
  });

  it("a project effect opens a whole branch (E12)", () => {
    // Its own fixture rather than a piece of the content: the epoch has no
    // branch that arrives late any more, and a test that hangs on the content
    // moves every time the content does.
    const late = indexConfig({
      ...STAGE1,
      branches: [
        ...STAGE1.branches,
        { id: "later", produces: "later", unlockedFromStart: false },
      ],
      projects: STAGE1.projects.map((p) =>
        p.id === "sedentism"
          ? { ...p, effects: [...p.effects, { type: "branch", id: "later" }] }
          : p,
      ),
    });

    const before = createState(late.config, { seed: 7 });
    expect(computeUnlocks(before, late).branches.has("later")).toBe(false);

    const after = { ...before, completedProjects: { sedentism: 1 } };
    expect(computeUnlocks(after, late).branches.has("later")).toBe(true);
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
          cohorts: asCohorts(0),
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
    let state = finish(
      createState(STAGE1, { seed: 7, wilderness: 300, water: 120 }),
      "sickle",
    );
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          cohorts: asCohorts(100),
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
    expect(
      after.sectors["households"]?.capacityHeld["cleared"]?.amount ?? 0,
    ).toBeGreaterThan(state.sectors["households"]?.capacityHeld["cleared"]?.amount ?? 0);
  });

  it("each taking brings worse land than the one before (E13, Ricardo)", () => {
    let state = finish(
      createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }),
      "sickle",
    );
    state = {
      ...state,
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          cohorts: asCohorts(400),
        },
      },
    };
    state = finish(state, "sedentism");

    // Held against the same report, or the comparison says nothing: what is on
    // offer is the falling mean times a draw that strays by a seventh either
    // way (E25), and a seventh is wider than the twentieth a taking costs. Two
    // ticks read one after the other therefore carry two different draws.
    const afterOne = finish(state, "land_taking");
    const sameOffer = (x: GameState): GameState => ({ ...x, landOffer: 1 });
    const first = derive(sameOffer(state), index).nextTakingQuality;
    const second = derive(sameOffer(afterOne), index).nextTakingQuality;
    expect(second).toBeLessThan(first);
    expect(afterOne.landTakings).toBe(1);

    // And the draw is what makes the two readings differ at all: on the same
    // standing, a better report is worth more country than a poorer one.
    const lucky = derive({ ...state, landOffer: 1.15 }, index).nextTakingQuality;
    const poor = derive({ ...state, landOffer: 0.85 }, index).nextTakingQuality;
    expect(lucky).toBeGreaterThan(poor);
  });
});

describe("supply chains (E4)", () => {
  it("produces an intermediate nobody needs directly", () => {
    // Warmth is made out of wood; nobody needs wood for its own sake — no rank
    // asks for it. Without demand derived through the chain none would ever be
    // made and the fire would stay out.
    let state = createState(STAGE1, { seed: 7, wilderness: 300, water: 120 });

    let everMadeWood = false;
    for (let i = 0; i < 20; i += 1) {
      if ((derive(state, index).produced["wood"] ?? 0) > 0) everMadeWood = true;
      state = tick(state, index);
    }
    expect(everMadeWood).toBe(true);
    expect(index.config.needTiers.some((t) => t.stock === "wood")).toBe(false);
    expect(derive(state, index).coverage["warmth_fire"] ?? 0).toBeGreaterThan(0);
  });

  it("names the upstream bottleneck, not the missing intermediate", () => {
    // Wood is short because there is nothing left to pick up — that is what
    // should be reported, not "wood is missing". Without the axe the standing
    // wood is out of reach, so the fallen wood is the whole of the supply.
    let state = finish(
      createState(STAGE1, { seed: 7, wilderness: 4000, water: 1600 }),
      "sickle",
    );
    state = {
      ...state,
      unownedCapacity: { wilderness: { amount: 0.01, quality: 1 } },
      sectors: {
        ...state.sectors,
        households: {
          ...state.sectors["households"]!,
          cohorts: asCohorts(200),
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
    expect(d.coverage["warmth_fire"] ?? 1).toBeLessThan(1);
    const fire = d.tiers.find((t) => t.tier === "warmth_fire");
    expect(fire?.binding.kind).toBe("stock");
    expect(fire?.binding.what).toBe("deadwood");
  });
});

describe("the tick's record says what the tick did", () => {
  // The view must never recompute what happened: a fresh allocation on the end
  // state is a different allocation, and it has told a shifted story before —
  // the collapse a tick early, the recovery a tick late. So the state records
  // what the population phase actually applied, and the cohorts must follow
  // from that record exactly.
  it("carries every cohort by the recorded survival, moves and births", () => {
    const index = indexConfig(STAGE1);
    const population = STAGE1.population;
    let state = createState(STAGE1, { seed: 11 });
    let checked = 0;
    for (let i = 0; i < 60 && state.abandonedAt === undefined; i += 1) {
      const before = { ...(state.sectors["households"]?.cohorts ?? {}) };
      const next = tick(state, index);
      const expected: Record<string, number> = {};
      for (const cohort of population.cohorts) {
        expected[cohort.id] = Math.max(
          0,
          (before[cohort.id] ?? 0) * (next.lastSurvival[cohort.id] ?? 1),
        );
      }
      for (const move of population.transitions) {
        const moving = Math.max(0, (before[move.from] ?? 0) * move.perTick);
        expected[move.from] = Math.max(0, (expected[move.from] ?? 0) - moving);
        expected[move.to] = (expected[move.to] ?? 0) + moving;
      }
      expected[population.birthsInto] =
        (expected[population.birthsInto] ?? 0) + next.lastBorn;
      const after = next.sectors["households"]?.cohorts ?? {};
      for (const cohort of population.cohorts) {
        expect(after[cohort.id] ?? 0).toBeCloseTo(expected[cohort.id] ?? 0, 8);
        checked += 1;
      }
      state = next;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("records a labour split whose parts add up to what was performed", () => {
    const index = indexConfig(STAGE1);
    let state = createState(STAGE1, { seed: 11 });
    for (let i = 0; i < 20; i += 1) {
      state = tick(state, index);
      const labor = state.lastLabor;
      expect(labor.toProduction + labor.toProjects + labor.unused).toBeCloseTo(
        labor.available,
        8,
      );
    }
  });

  it("records the factors the births were computed with", () => {
    const index = indexConfig(STAGE1);
    const population = STAGE1.population;
    let state = createState(STAGE1, { seed: 11 });
    for (let i = 0; i < 25; i += 1) {
      const before = state.sectors["households"]?.cohorts ?? {};
      const next = tick(state, index);
      const bearers = Object.entries(before).reduce(
        (sum, [id, heads]) => sum + heads * (population.birthWeight[id] ?? 0),
        0,
      );
      const expected =
        population.baseBirthRate *
        next.lastBirthFactors.coverage *
        next.lastBirthFactors.carrying *
        bearers;
      expect(next.lastBorn).toBeCloseTo(Math.max(0, expected), 8);
      state = next;
    }
  });

  it("records runs, bindings and store movement from its own allocation", () => {
    const index = indexConfig(STAGE1);
    let state = createState(STAGE1, { seed: 11 });
    for (let i = 0; i < 25; i += 1) {
      state = tick(state, index);
      // The recorded runs are the production side of the recorded split.
      const ranLabor = state.lastRuns.reduce((sum, run) => sum + run.labor, 0);
      expect(ranLabor).toBeCloseTo(state.lastLabor.toProduction, 8);
      // Every rank that has a recorded coverage has a recorded binding.
      for (const tier of Object.keys(state.lastCoverage)) {
        expect(state.lastBinding[tier]).toBeDefined();
      }
      // The recorded store movement ends where the state's stocks stand.
      const stocks = state.sectors["households"]?.stocks ?? {};
      for (const [id, pair] of Object.entries(state.lastStore)) {
        expect(stocks[id] ?? 0).toBeCloseTo(pair.after, 8);
      }
    }
  });
});

describe("what the record says about a claim", () => {
  const index = indexConfig(STAGE1);

  it("names what held a project's step back, and nothing where the whole step ran", () => {
    let state = createState(STAGE1, { seed: 5 });
    state = apply(state, { type: "startProject", id: "mortar", rank: 1 }, index).state;
    const full = 1 / (index.project.get("mortar")?.minTicks ?? 1);
    let judged = 0;
    for (let i = 0; i < 20; i += 1) {
      const before = state.activeProjects.find((p) => p.id === "mortar")?.progress;
      state = tick(state, index);
      const after = state.activeProjects.find((p) => p.id === "mortar")?.progress;
      const held = state.lastProjectBinding["mortar"];
      if (before === undefined || after === undefined || held === undefined) break;
      if (after - before >= full - 1e-9) expect(held).toEqual([]);
      else expect(held.length).toBeGreaterThan(0);
      judged += 1;
    }
    expect(judged).toBeGreaterThan(0);
  });

  it("names nothing for a project the player has paused — a hand is not a resource", () => {
    let state = createState(STAGE1, { seed: 5 });
    state = apply(state, { type: "startProject", id: "mortar", rank: 1 }, index).state;
    state = apply(
      state,
      { type: "pauseProject", id: "mortar", paused: true },
      index,
    ).state;
    state = tick(state, index);
    expect(state.lastProjectBinding["mortar"]).toEqual([]);
  });

  it("forgets a project that is over: the record is written afresh every tick", () => {
    let state = createState(STAGE1, { seed: 5 });
    state = apply(state, { type: "startProject", id: "mortar", rank: 1 }, index).state;
    state = tick(state, index);
    expect(state.lastProjectBinding["mortar"]).toBeDefined();
    state = apply(state, { type: "abandonProject", id: "mortar" }, index).state;
    state = tick(state, index);
    expect(state.lastProjectBinding["mortar"]).toBeUndefined();
  });

  it("carries a binding for the reserve claims, not only for the needs", () => {
    let state = createState(STAGE1, { seed: 5 });
    state = apply(
      state,
      { type: "setStockTarget", stock: "wood", amount: 12 },
      index,
    ).state;
    state = tick(state, index);
    expect(state.lastBinding["keep:wood"]).toBeDefined();
  });

  /**
   * Two shortages at once, each on its own road, so that a record which mixes
   * them up cannot pass: food can only come off cleared land, and there is
   * almost none of it; the fire can only come off fallen wood, and there is
   * almost none of that. The hands are many, so nothing hangs on them.
   */
  function twoShortages(): GameState {
    const start = createState(STAGE1, { seed: 3, heads: 60, wilderness: 900 });
    const sector = start.sectors["households"]!;
    return {
      ...start,
      stockTargets: { wood: 50 },
      sectors: {
        ...start.sectors,
        households: {
          ...sector,
          stocks: { ...sector.stocks, food: 0, wood: 0, warmth: 0, deadwood: 0.5 },
          capacityHeld: { cleared: { amount: 1, quality: 1 } },
        },
      },
    };
  }

  const onTwoShortages = (): AllocationResult =>
    allocate({
      state: twoShortages(),
      index,
      sectorId: "households",
      shocks: {},
      tierPerHead: new Map(),
      // Only one road to each good: food off the fields, warmth off the fallen
      // wood. Gathering, hunting and felling stay shut, so neither rank has a
      // second source to be blamed on.
      unlockedBranches: new Set(["labor", "food", "wood", "warmth"]),
      unlockedProcesses: new Set(["labor", "farming", "wood_gathering", "open_fire"]),
    });

  it("names each rank what its own chain ran out of, never another rank's", () => {
    const result = onTwoShortages();
    const food = result.tiers.find((t) => t.tier === "food_survival");
    const fire = result.tiers.find((t) => t.tier === "warmth_fire");

    // Both are short, so both have something to report.
    expect(food?.coverage ?? 1).toBeLessThan(1);
    expect(fire?.coverage ?? 1).toBeLessThan(1);

    // The field the food hangs on, and the fallen wood the fire hangs on —
    // and neither rank is handed the other's shortage.
    expect(food?.binding).toEqual({ kind: "capacity", what: "cleared" });
    expect(fire?.binding).toEqual({ kind: "stock", what: "deadwood" });
  });

  it("names a reserve claim what its own chain ran out of, not the needs'", () => {
    // The very thing the player is told beside his woodpile: the pile did not
    // fill because there was nothing left to pick up, not because the fields
    // were small.
    expect(onTwoShortages().claimBinding["keep:wood"]).toEqual({
      kind: "stock",
      what: "deadwood",
    });
  });

  it("names nothing for a reserve on its goal, though other ranks went short", () => {
    // The fallen wood is plentiful and the woodpile fills; the fields are tiny
    // and the food does not. A record that hands the tick's worst shortage to
    // every claim alike puts the fields under the woodpile, where they have no
    // business at all.
    const start = createState(STAGE1, { seed: 3, heads: 60, wilderness: 900 });
    const sector = start.sectors["households"]!;
    const result = allocate({
      state: {
        ...start,
        stockTargets: { wood: 1 },
        sectors: {
          ...start.sectors,
          households: {
            ...sector,
            stocks: { ...sector.stocks, food: 0, wood: 0, warmth: 0 },
            capacityHeld: { cleared: { amount: 1, quality: 1 } },
          },
        },
      },
      index,
      sectorId: "households",
      shocks: {},
      tierPerHead: new Map(),
      unlockedBranches: new Set(["labor", "food", "wood", "warmth"]),
      unlockedProcesses: new Set(["labor", "farming", "wood_gathering", "open_fire"]),
    });
    expect(
      result.tiers.find((t) => t.tier === "food_survival")?.coverage ?? 1,
    ).toBeLessThan(1);
    expect(result.claimBinding["keep:wood"]).toEqual({ kind: "none" });
  });

  it("names nothing for a rank that got everything it asked for", () => {
    const result = allocate({
      state: createState(STAGE1, { seed: 3, heads: 20, wilderness: 900, water: 400 }),
      index,
      sectorId: "households",
      shocks: {},
      tierPerHead: new Map(),
      unlockedBranches: new Set(["labor", "food"]),
      unlockedProcesses: new Set(["labor", "gathering"]),
    });
    const food = result.tiers.find((t) => t.tier === "food_survival");
    expect(food?.coverage).toBeCloseTo(1, 9);
    expect(food?.binding).toEqual({ kind: "none" });
    // And it holds of every covered rank, not only of that one.
    for (const tier of result.tiers) {
      if (tier.coverage >= 1 - 1e-9) expect(tier.binding.kind).toBe("none");
    }
  });

  it("records what each rank asked for beside the share of it that arrived", () => {
    let state = createState(STAGE1, { seed: 5 });
    for (let i = 0; i < 10; i += 1) {
      state = tick(state, index);
      for (const tier of index.config.needTiers) {
        expect(state.lastNeed[tier.id] ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("lets a sheltered store be ranked without naming an amount it does not have", () => {
    const state = createState(STAGE1, { seed: 5 });
    const moved = apply(state, { type: "setStockRank", stock: "food", rank: 250 }, index);
    expect(moved.rejected).toBeUndefined();
    expect(moved.state.stockRanks["food"]).toBe(250);
    // A good that claims nothing of its own cannot be ranked.
    expect(
      apply(state, { type: "setStockRank", stock: "warmth", rank: 1 }, index).rejected,
    ).toBeDefined();
  });
});
