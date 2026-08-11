import {
  HOUSEHOLDS,
  shockFactor,
  type ConfigIndex,
  type GameState,
  type ProcessDef,
  type StockId,
} from "../sim/index.ts";
import { PLAYED_AT_ONCE } from "./presentation.ts";

/**
 * What the band shows, worked out from the record and from nothing else (T9).
 *
 * The band is the one overview: every claim on the tick's labour side by side,
 * in rank order, left first. **Width is what full coverage of that claim would
 * have cost this tick**, fill is how far the claim is met — for a need the
 * coverage of this one tick, for a claim the standing it has reached. Nothing
 * here is smoothed: smoothing would falsify what the tick did, and the honest
 * flicker is what makes the band an overview rather than a mood.
 *
 * Everything is read out of the tick's own record. Where a figure could be
 * recomputed instead, it is not: worked out afresh against the coming tick's
 * draw it is a different number every time it is looked at, and then the band
 * and the card below it tell two stories.
 */

/** Which claims exist beside the needs, and how the surface names them. */
export type FieldKind = "need" | "project" | "store" | "idle";

export interface BandField {
  /** Stable across ticks, so a re-sort does not close an open card. */
  readonly key: string;
  readonly kind: FieldKind;
  readonly id: string;
  readonly rank: number;
  /** Labour this tick, for the whole claim. The widths are its shares. */
  readonly cost: number;
  /** Share of the band, out of a hundred. */
  readonly share: number;
  /** 0 … 1 — coverage for a need, standing reached for a claim. */
  readonly fill: number;
  /** A need below full coverage: its fill and its number turn crisis red. */
  readonly short: boolean;
  /** The sign in the field; a running project carries none. */
  readonly icon?: string;
  /** Ochre: the player has it in his hand and may drag it. */
  readonly claim: boolean;
  /** Ochre for something being built, teal for a store. */
  readonly tone?: "build" | "store";
}

/** The one place the surface says which sign belongs to which rank. */
const ICONS: Readonly<Record<string, string>> = {
  food_survival: "i-berry",
  warmth_fire: "i-flame",
  childcare: "i-child",
  clothing_cover: "i-garment",
  food_satiety: "i-bowl",
  warmth_comfort: "i-comfort",
  "store:wood": "i-logs",
  "store:food": "i-pit",
};

/** Labour is the unit every width is measured in: one of it costs one. */
const LABOR: StockId = "labor";

/**
 * What a unit of each good cost in labour this tick, the whole chain counted.
 *
 * A garment is not made of hands alone — hides and fibre stand behind it, and
 * they were found by somebody. So a good's price is the labour that went into
 * its own making plus the labour carried by what it was made from. Read off
 * the tick's runs, so it carries what searching cost this tick: the effort of
 * a thinning range is charged to the labour of the process that searches it.
 *
 * **The draw is divided out of the recipe.** What a run put in stands against
 * what came out of it, and between the two lies the tick's draw: a recipe's
 * coefficient is per unit of the level that was set, while the output is that
 * level times the draw. Left in, a good draw made every chain look cheap in its
 * inputs and dear in nothing, and the band's widths moved with the weather
 * instead of with the work. The labour needs no such correction — it is read
 * off the run as it really went.
 *
 * The draw is read out of the tick's record and never peeked from the stream:
 * peeking answers about the coming tick, and then the band would price this
 * tick with next tick's weather.
 *
 * A good nothing was made of this tick has no price here. The last one it had
 * stands in for it — see `unitCost` below, which is where that rule lives.
 */
function unitCostsOfTick(state: GameState, index: ConfigIndex): Map<StockId, number> {
  interface Tally {
    output: number;
    labor: number;
    inputs: Map<StockId, number>;
  }
  const tally = new Map<StockId, Tally>();
  for (const run of state.lastRuns) {
    const process = index.process.get(run.process);
    if (process === undefined || run.output <= 0) continue;
    const made = index.branch.get(process.branch)?.produces;
    if (made === undefined || made === LABOR) continue;
    const entry = tally.get(made) ?? { output: 0, labor: 0, inputs: new Map() };
    entry.output += run.output;
    entry.labor += run.labor;
    const shock = shockFactor(process, state.lastShocks);
    for (const [id, per] of Object.entries(process.intermediatesPerOutput)) {
      if (id === LABOR || per <= 0) continue;
      const perOutput = shock > 0 ? per / shock : per;
      entry.inputs.set(id, (entry.inputs.get(id) ?? 0) + run.output * perOutput);
    }
    tally.set(made, entry);
  }

  // One of labour costs one of labour: that is the unit, and it has to be said
  // outright, because the process that makes it consumes no labour at all.
  const prices = new Map<StockId, number>([[LABOR, 1]]);
  // Resolved by repetition rather than by sorting the chain: a good is priced
  // once everything below it is, and the chain of this epoch is a few links
  // deep. What is still unpriced counts as nothing for that pass and is picked
  // up by the next.
  for (let pass = 0; pass < tally.size + 1; pass += 1) {
    for (const [id, entry] of tally) {
      let sum = entry.labor;
      for (const [input, amount] of entry.inputs)
        sum += amount * (prices.get(input) ?? 0);
      prices.set(id, sum / entry.output);
    }
  }
  return prices;
}

/**
 * What a unit of a good costs, and what stands in when this tick made none of
 * it: **the last price it was known to have**. A rank whose good nobody made
 * this tick is not free — it is a rank nobody could serve.
 */
export function unitCost(
  history: readonly GameState[],
  index: ConfigIndex,
  stock: StockId,
): number {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const state = history[i];
    if (state === undefined) continue;
    const price = pricesOf(state, index).get(stock);
    if (price !== undefined) return price;
  }
  return 0;
}

/**
 * The prices of one tick, kept once they are worked out. The band is redrawn
 * at every beat of the clock and the history behind it only grows, so a tick
 * already priced is never priced again.
 */
const priceCache = new WeakMap<GameState, Map<StockId, number>>();

function pricesOf(state: GameState, index: ConfigIndex): Map<StockId, number> {
  const known = priceCache.get(state);
  if (known !== undefined) return known;
  const prices = unitCostsOfTick(state, index);
  priceCache.set(state, prices);
  return prices;
}

/** What falls apart of a good in one tick, the shelter of a store counted. */
export function decayLoss(
  state: GameState,
  index: ConfigIndex,
  rules: ReadonlySet<string>,
  stock: StockId,
): number {
  const def = index.stock.get(stock);
  if (def === undefined) return 0;
  const held = state.sectors[HOUSEHOLDS]?.stocks[stock] ?? 0;
  const ordinary =
    def.decayWhenRule?.find((entry) => rules.has(entry.rule))?.decayPerTick ??
    def.decayPerTick;
  const shelter = def.protectedBy;
  if (shelter === undefined) return held * ordinary;
  // A store is capacity, not a container (E19): what it covers keeps, the rest
  // spoils at the ordinary rate.
  const room = state.sectors[HOUSEHOLDS]?.capacityHeld[shelter.capacity]?.amount ?? 0;
  const covered = Math.min(held, room);
  const sheltered =
    shelter.decayWhenRule?.find((entry) => rules.has(entry.rule))?.decayPerTick ??
    shelter.decayPerTick;
  return covered * sheltered + (held - covered) * ordinary;
}

/**
 * How much of a good full coverage of a claim would take this tick.
 *
 * Two kinds, and the difference is E19's: a good that is **used up** has to be
 * made afresh in its whole amount, a good that is only **worn** has to be
 * mended — what fell apart, plus whatever is still missing from the level
 * asked for. Counting the whole wardrobe as this tick's cost said that a
 * community which has clothed itself is spending everything on clothes.
 */
function quantityFor(
  state: GameState,
  index: ConfigIndex,
  rules: ReadonlySet<string>,
  stock: StockId,
  asked: number,
  usedUp: boolean,
): number {
  if (usedUp) return asked;
  const held = state.sectors[HOUSEHOLDS]?.stocks[stock] ?? 0;
  const loss = decayLoss(state, index, rules, stock);
  return loss + Math.max(0, asked - (held - loss));
}

/** What a store is aiming at: the player's word, or what the pits hold. */
export function goalOf(state: GameState, index: ConfigIndex, stock: StockId): number {
  const def = index.stock.get(stock);
  if (def?.keeping !== undefined) return state.stockTargets[stock] ?? 0;
  const shelter = def?.protectedBy;
  if (shelter === undefined) return 0;
  return state.sectors[HOUSEHOLDS]?.capacityHeld[shelter.capacity]?.amount ?? 0;
}

/** Where a store's claim stands in the ranking. */
export function rankOfStore(
  state: GameState,
  index: ConfigIndex,
  stock: StockId,
): number {
  const def = index.stock.get(stock);
  return (
    state.stockRanks[stock] ??
    def?.keeping?.rank ??
    def?.protectedBy?.rank ??
    Number.MAX_SAFE_INTEGER
  );
}

/** The rank id the allocation records a store's claim under. */
export function claimTierId(index: ConfigIndex, stock: StockId): string {
  return index.stock.get(stock)?.keeping !== undefined
    ? `keep:${stock}`
    : `store:${stock}`;
}

/** How far a store stands towards its goal; a store with no goal has none. */
export function storeStanding(
  state: GameState,
  index: ConfigIndex,
  stock: StockId,
): number {
  const goal = goalOf(state, index, stock);
  if (goal <= 1e-9) return 1;
  return Math.min(1, (state.sectors[HOUSEHOLDS]?.stocks[stock] ?? 0) / goal);
}

/**
 * The fields of the band for one tick, in rank order — left is served first.
 *
 * The idle field stands last and is not a rank: it is what no process and no
 * project called for, and at the tick's end it is gone.
 */
export function bandFields(
  history: readonly GameState[],
  index: ConfigIndex,
  rules: ReadonlySet<string>,
): readonly BandField[] {
  const state = history[history.length - 1];
  if (state === undefined) return [];
  const price = (stock: StockId): number => unitCost(history, index, stock);
  const fields: BandField[] = [];

  for (const tier of index.config.needTiers) {
    const asked = state.lastNeed[tier.id] ?? 0;
    const coverage = state.lastCoverage[tier.id] ?? 1;
    const quantity = quantityFor(
      state,
      index,
      rules,
      tier.stock,
      asked,
      tier.consumedOnUse >= 1 - 1e-9,
    );
    fields.push({
      key: `need:${tier.id}`,
      kind: "need",
      id: tier.id,
      rank: tier.rank,
      cost: quantity * price(tier.stock),
      share: 0,
      fill: coverage,
      short: coverage < 1 - 1e-9,
      ...(ICONS[tier.id] === undefined ? {} : { icon: ICONS[tier.id] }),
      claim: false,
    });
  }

  for (const active of state.activeProjects) {
    const def = index.project.get(active.id);
    if (def === undefined) continue;
    // An undertaking that is over in the stroke it was begun is no claim to be
    // weighed against the eating: it never stands in the band and never comes
    // into the hand.
    if (PLAYED_AT_ONCE.includes(active.id)) continue;
    const step = 1 / def.minTicks;
    // A paused project claims nothing this tick, and its field falls to the
    // minimum width — it stays on the band because it is still the player's.
    let cost = active.paused ? 0 : def.laborCost * step;
    if (!active.paused) {
      for (const [stock, total] of Object.entries(def.stockCost)) {
        cost += total * step * price(stock);
      }
    }
    fields.push({
      key: `project:${active.id}`,
      kind: "project",
      id: active.id,
      rank: active.rank,
      cost,
      share: 0,
      fill: active.progress,
      short: false,
      claim: true,
      tone: "build",
    });
  }

  for (const def of index.config.stocks) {
    if (def.keeping === undefined && def.protectedBy === undefined) continue;
    const goal = goalOf(state, index, def.id);
    // No goal, no claim: a store nobody has asked for takes nothing and is not
    // in the allocation either.
    if (goal <= 1e-9) continue;
    const quantity = quantityFor(state, index, rules, def.id, goal, false);
    const key = `store:${def.id}`;
    fields.push({
      key,
      kind: "store",
      id: def.id,
      rank: rankOfStore(state, index, def.id),
      cost: quantity * price(def.id),
      share: 0,
      fill: storeStanding(state, index, def.id),
      short: false,
      ...(ICONS[key] === undefined ? {} : { icon: ICONS[key] }),
      claim: true,
      tone: "store",
    });
  }

  fields.sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key));
  // Lay nothing idle, no idle field. It is the one field with neither a sign
  // nor a grip to keep room for, so it is never held open artificially and
  // never shown for nothing — the only exception to the minimum width.
  const idle = Math.max(0, state.lastLabor.unused);
  if (idle > 1e-9) {
    fields.push({
      key: "idle",
      kind: "idle",
      id: "idle",
      rank: Number.MAX_SAFE_INTEGER,
      cost: idle,
      share: 0,
      fill: 0,
      short: false,
      claim: false,
    });
  }

  const total = fields.reduce((sum, field) => sum + field.cost, 0);
  return fields.map((field) => ({
    ...field,
    share: total > 0 ? (field.cost / total) * 100 : 0,
  }));
}

// ------------------------------------------------------------------ the curve

/** The window every card's curve is drawn over — shorter, never longer (T9). */
export const CURVE_TICKS = 20;

/**
 * Where a brake came from, as far as the player's own lever is concerned.
 *
 * The distinction the empty answer of a card turns on: what the range would not
 * give more of, against what the ranks in front took. Both are in the end the
 * range's doing — hands are short because searching is dear — but only one of
 * them is a thing the player can move, so the two are told apart.
 *
 * `weather` is the residual the core reports where nothing at all ran out.
 */
export type BrakeKind = "stock" | "capacity" | "labour" | "weather";

/** What braked a tick: the id the surface names it by, and where it came from. */
export interface Brake {
  readonly what: string;
  readonly kind: BrakeKind;
}

/** The id the weather answers under; it names no stock and no capacity. */
export const WEATHER: string = "weather";

/** One tick of a card's curve: what arrived, and what held it back. */
export interface CurvePoint {
  readonly tick: number;
  /** 0 … 1 — the share of what the claim wanted that arrived. */
  readonly value: number;
  /** What limited this tick; empty where nothing did. */
  readonly brake: readonly Brake[];
}

/**
 * The curve of one field over its window.
 *
 * The reading is the same everywhere: **per tick, the share of what the claim
 * wanted that arrived**. For a need that is the coverage, for a project the
 * inflow (one figure, because every resource of a project flows in lockstep),
 * for a store the coverage of its refilling claim — its wish is to stand on
 * its goal at the tick's end, and a full store wishes nothing and counts full.
 */
export function curveOf(
  history: readonly GameState[],
  index: ConfigIndex,
  field: BandField,
  since: number,
): readonly CurvePoint[] {
  const out: CurvePoint[] = [];
  const first = Math.max(0, history.length - CURVE_TICKS);
  for (let i = first; i < history.length; i += 1) {
    const state = history[i];
    if (state === undefined || state.tick < since) continue;
    const point = pointOf(history, index, field, i);
    if (point !== undefined) out.push(point);
  }
  return out;
}

function pointOf(
  history: readonly GameState[],
  index: ConfigIndex,
  field: BandField,
  at: number,
): CurvePoint | undefined {
  const state = history[at];
  if (state === undefined) return undefined;

  /**
   * The rank's own record, read as a brake. A capacity the people stand behind
   * is the labour: that is what the model calls a shortage of hands, and the
   * player is told about it in the only terms he can act in.
   */
  const named = (binding: { kind: string; what?: string } | undefined): Brake[] => {
    if (binding === undefined || binding.kind === "none") return [];
    if (binding.kind === "weather") return [{ what: WEATHER, kind: "weather" }];
    if (binding.what === undefined) return [];
    if (binding.kind === "capacity") {
      const fromPeople = index.config.capacities.find(
        (one) => one.id === binding.what,
      )?.fromPopulation;
      return [{ what: binding.what, kind: fromPeople === true ? "labour" : "capacity" }];
    }
    return [{ what: binding.what, kind: "stock" }];
  };

  switch (field.kind) {
    case "need": {
      const value = state.lastCoverage[field.id];
      if (value === undefined) return undefined;
      return {
        tick: state.tick,
        value,
        brake: value < 1 - 1e-9 ? named(state.lastBinding[field.id]) : [],
      };
    }
    case "project": {
      const def = index.project.get(field.id);
      const now = state.activeProjects.find((p) => p.id === field.id);
      if (def === undefined || now === undefined) return undefined;
      const was = history[at - 1]?.activeProjects.find((p) => p.id === field.id);
      const step = 1 / def.minTicks;
      const value = Math.max(
        0,
        Math.min(1, (now.progress - (was?.progress ?? 0)) / step),
      );
      // A project's record names the resources themselves; the labour among
      // them is the labour and is told apart from the goods.
      return {
        tick: state.tick,
        value,
        brake: (state.lastProjectBinding[field.id] ?? []).map((stock) => ({
          what: stock,
          kind: stock === LABOR ? ("labour" as const) : ("stock" as const),
        })),
      };
    }
    case "store": {
      const value = storeStanding(state, index, field.id);
      return {
        tick: state.tick,
        value,
        brake:
          value < 1 - 1e-9 ? named(state.lastBinding[claimTierId(index, field.id)]) : [],
      };
    }
    case "idle": {
      const labour = state.lastLabor;
      const idle = labour.available > 0 ? labour.unused / labour.available : 0;
      // The one curve that is not a coverage: it is drawn as it is, and it is
      // the share of the hands nobody called for.
      return { tick: state.tick, value: idle, brake: [] };
    }
  }
}

/** How often each brake appeared in a window, the commonest first. */
export function brakesByFrequency(points: readonly CurvePoint[]): readonly Brake[] {
  const counts = new Map<string, { brake: Brake; times: number }>();
  for (const point of points) {
    for (const brake of point.brake) {
      const seen = counts.get(brake.what);
      if (seen === undefined) counts.set(brake.what, { brake, times: 1 });
      else seen.times += 1;
    }
  }
  return [...counts.values()].sort((a, b) => b.times - a.times).map((one) => one.brake);
}

/** How many ticks of the window fell short of what the claim wanted. */
export function shortTicks(points: readonly CurvePoint[]): number {
  return points.filter((point) => point.value < 1 - 1e-9).length;
}

// --------------------------------------------------------- what a project needs

/** The resources a project claims, in the order they stand in the content. */
export function projectResources(index: ConfigIndex, id: string): readonly StockId[] {
  const def = index.project.get(id);
  if (def === undefined) return [];
  const out: StockId[] = def.laborCost > 0 ? [LABOR] : [];
  for (const [stock, total] of Object.entries(def.stockCost)) {
    if (total > 0) out.push(stock);
  }
  return out;
}

/**
 * How many ticks a running project needs at the very least: what is left of
 * it, over the step a whole tick moves it. Exact, so it carries no tilde, and
 * it is an earliest and never a latest — what it will really take hangs on
 * what it gets.
 */
export function ticksLeft(index: ConfigIndex, id: string, progress: number): number {
  const def = index.project.get(id);
  if (def === undefined) return 0;
  return Math.max(1, Math.ceil((1 - progress) / (1 / def.minTicks) - 1e-9));
}

// ------------------------------------------------------------- what a store holds

/**
 * How much of a good one tick draws — what a store's goal is read in ticks
 * against. The wood at the camp is drawn by the fire, the food in the pits by
 * the eating, and both are in the tick's own record.
 */
export function drawPerTick(
  state: GameState,
  index: ConfigIndex,
  stock: StockId,
): number {
  const def = index.stock.get(stock);
  // A good that is eaten is drawn by the ranks that eat it.
  if (def?.protectedBy !== undefined) {
    let sum = 0;
    for (const tier of index.config.needTiers) {
      if (tier.stock === stock) sum += state.lastNeed[tier.id] ?? 0;
    }
    return sum;
  }
  // A good that is burnt is drawn by whatever process burns it.
  let sum = 0;
  for (const run of state.lastRuns) {
    const process: ProcessDef | undefined = index.process.get(run.process);
    const per = process?.intermediatesPerOutput[stock] ?? 0;
    if (per > 0) sum += run.output * per;
  }
  return sum;
}

/** How many pits, boats, huts a capacity stands for — built things, counted. */
export function builtCount(state: GameState, index: ConfigIndex, stock: StockId): number {
  const shelter = index.stock.get(stock)?.protectedBy;
  if (shelter === undefined) return 0;
  // Each finished project that adds this room counts once, however far the
  // room has since decayed: the pits stand there, they are not a resource.
  let built = 0;
  for (const def of index.config.projects) {
    const adds = def.effects.some(
      (effect) => effect.type === "capacity" && effect.capacity === shelter.capacity,
    );
    if (adds) built += state.completedProjects[def.id] ?? 0;
  }
  return built;
}

// ---------------------------------------------------------------- re-ranking

/**
 * The ranks that put the claims into a given order.
 *
 * Needs hold fixed ranks the content set; a claim lives between them. Rather
 * than nudging one number and hoping, the whole gap between two need ranks is
 * shared out evenly among the claims that are to stand in it — otherwise two
 * claims that came into the world at the same default rank could never be
 * ordered against each other at all, and dragging one of them did nothing.
 */
export function ranksForOrder(order: readonly BandField[]): Map<string, number> {
  const out = new Map<string, number>();
  const claims = order.filter((field) => field.kind !== "idle");
  let i = 0;
  while (i < claims.length) {
    if (claims[i]?.claim !== true) {
      i += 1;
      continue;
    }
    let end = i;
    while (claims[end]?.claim === true) end += 1;
    const before = claims[i - 1]?.rank;
    const after = claims[end]?.rank;
    const run = end - i;
    for (let k = 0; k < run; k += 1) {
      const field = claims[i + k];
      if (field === undefined) continue;
      const low = before ?? (after ?? 0) - 100;
      const high = after ?? low + 100 * (run + 1);
      out.set(field.key, low + ((high - low) * (k + 1)) / (run + 1));
    }
    i = end;
  }
  return out;
}
