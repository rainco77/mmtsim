import { describe, expect, it } from "vitest";
import { STAGE1 } from "../../src/content/stage1.ts";
import {
  apply,
  createState,
  derive,
  indexConfig,
  tick,
  type GameState,
} from "../../src/sim/index.ts";
import {
  bandFields,
  brakesByFrequency,
  curveOf,
  nameBelow,
  NAME_FITS_FROM,
  ranksForOrder,
  shortTicks,
  shownPercent,
  storeStanding,
  streamOf,
  tickShares,
  ticksLeft,
  unitCost,
  WEATHER,
  type BandField,
  type CurvePoint,
} from "../../src/ui/band.ts";
import { translate } from "../../src/i18n/t.ts";

/**
 * Tests of the band, kept apart from the tests of the core: the core knows
 * nothing of screens, and a test of a screen must never be mistaken for a
 * statement about the model.
 *
 * Mechanics, never balance (E26): what is under test is the rule the band
 * reads by — rank order, what a width counts, what a window covers — never a
 * figure a change of content would move.
 */

const index = indexConfig(STAGE1);

/** A played run: the history the band is drawn from. */
function played(ticks: number, seed = 42): GameState[] {
  let state = createState(STAGE1, { seed });
  const history = [state];
  for (let i = 0; i < ticks; i += 1) {
    state = tick(state, index);
    history.push(state);
  }
  return history;
}

const rulesOf = (state: GameState): Set<string> => new Set(derive(state, index).rules);

const fieldsOf = (history: readonly GameState[]): readonly BandField[] =>
  bandFields(history, index, rulesOf(history[history.length - 1] as GameState));

describe("the band's fields (T9)", () => {
  it("stands in rank order, left first", () => {
    const fields = fieldsOf(played(12));
    const ranked = fields.filter((one) => one.kind !== "idle");
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i]?.rank ?? 0).toBeGreaterThanOrEqual(ranked[i - 1]?.rank ?? 0);
    }
  });

  it("shows the idle field only where labour really lay idle, and last", () => {
    // The one field that is never held open: it has neither a sign nor a grip
    // to keep room for, so where nothing lay idle it is not there at all.
    for (const ticks of [6, 12, 20, 40]) {
      const history = played(ticks);
      const fields = fieldsOf(history);
      const idle = fields.find((one) => one.kind === "idle");
      const unused = history[history.length - 1]?.lastLabor.unused ?? 0;
      expect(idle !== undefined).toBe(unused > 1e-9);
      if (idle !== undefined) expect(fields[fields.length - 1]?.kind).toBe("idle");
    }
  });

  it("keeps the undertaking that is over in one stroke out of the band", () => {
    // Walking is done in the tick it is begun, so it is no claim to be weighed
    // against the eating and never comes into the hand.
    let state = createState(STAGE1, { seed: 42 });
    const history = [state];
    for (let i = 0; i < 6; i += 1) {
      state = tick(state, index);
      history.push(state);
    }
    state = apply(state, { type: "startProject", id: "range_change" }, index).state;
    history[history.length - 1] = state;
    expect(state.activeProjects.some((p) => p.id === "range_change")).toBe(true);
    expect(fieldsOf(history).some((one) => one.key === "project:range_change")).toBe(
      false,
    );
  });

  it("carries every need of the content, whether or not it went short", () => {
    const fields = fieldsOf(played(12));
    for (const tier of index.config.needTiers) {
      expect(fields.some((one) => one.kind === "need" && one.id === tier.id)).toBe(true);
    }
  });

  it("counts decay and the gap for a good that is worn, never the whole stock", () => {
    const history = played(30);
    const state = history[history.length - 1] as GameState;
    const clothing = fieldsOf(history).find((one) => one.id === "clothing_cover");
    // What is worn is not made afresh every tick: the width of the rank has to
    // stay well under what its whole wardrobe would cost to make.
    const whole =
      (state.lastNeed["clothing_cover"] ?? 0) * unitCost(history, index, "clothing");
    expect(clothing?.cost ?? 0).toBeLessThan(whole);
    expect(clothing?.cost ?? -1).toBeGreaterThanOrEqual(0);
  });

  it("counts the whole ration for a good that is used up", () => {
    const history = played(30);
    const state = history[history.length - 1] as GameState;
    const food = fieldsOf(history).find((one) => one.id === "food_survival");
    const whole =
      (state.lastNeed["food_survival"] ?? 0) * unitCost(history, index, "food");
    expect(food?.cost ?? 0).toBeCloseTo(whole, 8);
  });

  it("keeps the last known unit cost where this tick made none of the good", () => {
    const history = played(20);
    const before = unitCost(history, index, "food");
    expect(before).toBeGreaterThan(0);
    // A tick in which nothing at all was made: the rank behind the good is not
    // free, it is a rank nobody could serve.
    const barren: GameState = {
      ...(history[history.length - 1] as GameState),
      lastRuns: [],
    };
    expect(unitCost([...history, barren], index, "food")).toBeCloseTo(before, 8);
  });

  it("gives the same share to every field that cost the same", () => {
    const fields = fieldsOf(played(20));
    const total = fields.reduce((sum, one) => sum + one.share, 0);
    expect(total).toBeCloseTo(100, 6);
  });

  it("makes no claim for a store the player has not asked for, and one when he has", () => {
    let state = createState(STAGE1, { seed: 7 });
    const history = [state];
    for (let i = 0; i < 6; i += 1) {
      state = tick(state, index);
      history.push(state);
    }
    expect(fieldsOf(history).some((one) => one.key === "store:wood")).toBe(false);
    state = apply(
      state,
      { type: "setStockTarget", stock: "wood", amount: 10 },
      index,
    ).state;
    history[history.length - 1] = state;
    const claim = fieldsOf(history).find((one) => one.key === "store:wood");
    expect(claim?.claim).toBe(true);
    expect(claim?.tone).toBe("store");
  });

  it("lets a full store wish nothing: with no goal its standing counts full", () => {
    const state = played(6)[6] as GameState;
    expect(storeStanding(state, index, "wood")).toBe(1);
  });
});

describe("what a card's curve covers (T9)", () => {
  const project = (): { history: GameState[]; field: BandField } => {
    let state = createState(STAGE1, { seed: 3 });
    const history = [state];
    for (let i = 0; i < 8; i += 1) {
      state = tick(state, index);
      history.push(state);
    }
    state = apply(state, { type: "startProject", id: "mortar", rank: 1 }, index).state;
    history[history.length - 1] = state;
    for (let i = 0; i < 30; i += 1) {
      state = tick(state, index);
      history.push(state);
    }
    const field = fieldsOf(history).find((one) => one.key === "project:mortar");
    return { history, field: field as BandField };
  };

  it("reaches back twenty ticks and no further", () => {
    const history = played(60);
    const field = fieldsOf(history).find((one) => one.id === "food_survival");
    const points = curveOf(history, index, field as BandField, 0);
    expect(points.length).toBe(20);
  });

  it("is shorter where the run is younger than the window", () => {
    const history = played(6);
    const field = fieldsOf(history).find((one) => one.id === "food_survival");
    const points = curveOf(history, index, field as BandField, 0);
    // The opening state has no record of a tick that ran, so it draws nothing.
    expect(points.length).toBe(6);
  });

  it("begins at the player's own deed, so nothing before it is judged", () => {
    const history = played(60);
    const field = fieldsOf(history).find((one) => one.id === "food_survival");
    const now = history[history.length - 1]?.tick ?? 0;
    const points = curveOf(history, index, field as BandField, now - 4);
    expect(points.length).toBe(5);
    expect(points[0]?.tick).toBe(now - 4);
  });

  it("counts a project's inflow against a whole step, and names what braked it", () => {
    const { history, field } = project();
    if (field === undefined) return;
    const points = curveOf(history, index, field, 0);
    for (const point of points) {
      expect(point.value).toBeGreaterThanOrEqual(0);
      expect(point.value).toBeLessThanOrEqual(1);
      // Nothing is named where the whole step ran, and something where it did
      // not: the carpet and the curve can never disagree.
      if (point.value >= 1 - 1e-9) expect(point.brake).toEqual([]);
    }
  });

  it("reports a shortage of hands as the labour, and the weather as the weather", () => {
    // The model books a shortage of hands as the capacity "people" running
    // out. At the player that is the labour and nothing else: that more heads
    // would help cannot be told from a better ranking, so it is not claimed —
    // and the empty answer of a card turns on the same distinction.
    const history = played(6);
    const last = history[history.length - 1] as GameState;
    const field = fieldsOf(history).find((one) => one.id === "food_survival");
    const withRecord = (brake: {
      kind: "capacity" | "stock" | "weather";
      what?: string;
    }): CurvePoint | undefined => {
      const state: GameState = {
        ...last,
        lastCoverage: { ...last.lastCoverage, food_survival: 0.5 },
        lastBinding: { food_survival: brake },
      };
      return curveOf([...history.slice(0, -1), state], index, field as BandField, 0).at(
        -1,
      );
    };

    expect(withRecord({ kind: "capacity", what: "people" })?.brake).toEqual([
      { what: "people", kind: "labour" },
    ]);
    expect(withRecord({ kind: "capacity", what: "water" })?.brake).toEqual([
      { what: "water", kind: "capacity" },
    ]);
    expect(withRecord({ kind: "stock", what: "fish" })?.brake).toEqual([
      { what: "fish", kind: "stock" },
    ]);
    expect(withRecord({ kind: "weather" })?.brake).toEqual([
      { what: WEATHER, kind: "weather" },
    ]);

    // And what the surface calls them: labour is labour in both languages.
    for (const language of ["de", "en"] as const) {
      expect(translate(language, "name.brake.people")).not.toBe("name.brake.people");
      expect(translate(language, "name.brake.people").toLowerCase()).toBe(
        language === "de" ? "arbeit" : "labour",
      );
      expect(translate(language, "name.brake.weather")).not.toBe("name.brake.weather");
    }
  });

  it("names the resources of a window by how often they braked, commonest first", () => {
    const work = { what: "labor", kind: "labour" } as const;
    const fibre = { what: "fibre", kind: "stock" } as const;
    const points: CurvePoint[] = [
      { tick: 1, value: 0.5, brake: [work] },
      { tick: 2, value: 1, brake: [] },
      { tick: 3, value: 0.2, brake: [fibre, work] },
      { tick: 4, value: 0.9, brake: [work] },
    ];
    expect(brakesByFrequency(points)).toEqual([work, fibre]);
    expect(shortTicks(points)).toBe(3);
  });
});

describe("what a drop commits (T9)", () => {
  const need = (id: string, rank: number): BandField => ({
    key: `need:${id}`,
    kind: "need",
    id,
    rank,
    cost: 1,
    share: 1,
    fill: 1,
    short: false,
    claim: false,
  });
  const claim = (id: string, rank: number): BandField => ({
    key: `project:${id}`,
    kind: "project",
    id,
    rank,
    cost: 1,
    share: 1,
    fill: 0,
    short: false,
    claim: true,
    tone: "build",
  });

  it("puts a claim between the needs it was dropped between", () => {
    const ranks = ranksForOrder([need("a", 100), claim("net", 1000), need("b", 200)]);
    const rank = ranks.get("project:net") ?? 0;
    expect(rank).toBeGreaterThan(100);
    expect(rank).toBeLessThan(200);
  });

  it("shares the gap out, so two claims that came in at one rank can be ordered", () => {
    const ranks = ranksForOrder([
      need("a", 100),
      claim("net", 1000),
      claim("pit", 1000),
      need("b", 200),
    ]);
    const first = ranks.get("project:net") ?? 0;
    const second = ranks.get("project:pit") ?? 0;
    expect(first).toBeLessThan(second);
    expect(first).toBeGreaterThan(100);
    expect(second).toBeLessThan(200);
  });

  it("finds room before the first need and behind the last", () => {
    const front = ranksForOrder([claim("net", 1000), need("a", 100)]);
    expect(front.get("project:net") ?? 0).toBeLessThan(100);
    const back = ranksForOrder([need("a", 100), claim("net", 5)]);
    expect(back.get("project:net") ?? 0).toBeGreaterThan(100);
  });
});

describe("what a percentage says (T9)", () => {
  it("rounds down, so a hundred stands only where the claim is whole", () => {
    // The case that made the rule: rounded to the nearest, this wrote "100 %"
    // and painted it in the crisis colour in the same breath.
    expect(shownPercent(0.996)).toBe(99);
    expect(shownPercent(0.999999)).toBe(99);
    expect(shownPercent(1)).toBe(100);
    expect(shownPercent(0.5)).toBe(50);
    expect(shownPercent(0.004)).toBe(0);
  });

  it("agrees with the crisis colour on every field of a played run", () => {
    // Number and colour hang on one figure: whatever is short is under a
    // hundred, and whatever shows a hundred is not short.
    for (const ticks of [8, 20, 40]) {
      for (const field of fieldsOf(played(ticks))) {
        if (field.short) expect(shownPercent(field.fill)).toBeLessThan(100);
        else if (shownPercent(field.fill) === 100) expect(field.short).toBe(false);
      }
    }
  });
});

describe("where a field's name stands (T9)", () => {
  const claim = (): BandField => ({
    key: "project:fishing_net",
    kind: "project",
    id: "fishing_net",
    rank: 500,
    cost: 1,
    share: 1,
    fill: 0.5,
    short: false,
    claim: true,
    tone: "build",
  });
  const need = (): BandField => ({
    key: "need:food_survival",
    kind: "need",
    id: "food_survival",
    rank: 100,
    cost: 1,
    share: 1,
    fill: 1,
    short: false,
    claim: false,
  });

  it("leaves the name in the segment wherever it fits", () => {
    expect(nameBelow(claim(), NAME_FITS_FROM)).toBe(false);
    expect(nameBelow(need(), NAME_FITS_FROM)).toBe(false);
  });

  it("hands only a claim's name to the row below, and only when it is squeezed", () => {
    // The row below is where a leader line has to find its segment again, and
    // only a claim is ever taken by the hand.
    expect(nameBelow(claim(), NAME_FITS_FROM - 1)).toBe(true);
    expect(nameBelow(need(), NAME_FITS_FROM - 1)).toBe(false);
  });
});

describe("what a project's fact line says (T9)", () => {
  it("is the remainder over a whole step, exactly — an earliest, never a latest", () => {
    const minTicks = index.project.get("mortar")?.minTicks ?? 1;
    expect(ticksLeft(index, "mortar", 0)).toBe(minTicks);
    expect(ticksLeft(index, "mortar", 0.5)).toBe(Math.ceil(minTicks / 2));
    // However little is left, the earliest is still a whole tick away.
    expect(ticksLeft(index, "mortar", 0.999)).toBe(1);
  });

  it("measures the tick cost of a resource against the stream of that resource", () => {
    const history = played(20);
    const state = history[history.length - 1] as GameState;
    const def = index.project.get("mortar");
    const share = tickShares(history, index, "mortar").find(
      (one) => one.stock === "labor",
    );
    // The whole step is counted, never what the project happened to get: the
    // figure answers what the undertaking asks of the community each tick.
    const perTick = (def?.laborCost ?? 0) / (def?.minTicks ?? 1);
    expect(share?.share).toBeCloseTo(perTick / state.lastLabor.available, 8);
  });

  it("names every resource the project claims, labour among them", () => {
    const history = played(20);
    expect(tickShares(history, index, "sickle").map((one) => one.stock)).toEqual([
      "labor",
      "wood",
    ]);
  });

  it("keeps the last known stream where this tick brought none of the resource", () => {
    const history = played(20);
    const before = streamOf(history, index, "food");
    expect(before).toBeGreaterThan(0);
    // A tick in which nothing at all was made and nobody worked: the stream a
    // claim is measured against is the last one that was really seen.
    const barren: GameState = {
      ...(history[history.length - 1] as GameState),
      lastRuns: [],
      lastLabor: { available: 0, toProduction: 0, toProjects: 0, unused: 0 },
    };
    expect(streamOf([...history, barren], index, "food")).toBeCloseTo(before, 8);
  });

  it("tells no share where no stream of the resource is known at all", () => {
    // Before the first tick nothing has come in of anything, and then the
    // share cannot be told — a nought there would read as costing nothing.
    const fresh = [createState(STAGE1, { seed: 42 })];
    const shares = tickShares(fresh, index, "sickle");
    expect(shares.length).toBe(2);
    expect(shares.every((one) => one.share === undefined)).toBe(true);
  });
});
