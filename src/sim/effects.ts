import type { Config, Effect, LevelSource, QualitySource } from "./config.ts";
import { carriedPerArea } from "./phases.ts";
import type { CapacityId, SectorId, StockId } from "./ids.ts";
import {
  capacityOf,
  carryingArea,
  type Capacity,
  type GameState,
  type SectorState,
} from "./state.ts";

/**
 * Effect handlers as a registry (T2). A new effect type is a new class plus one
 * entry — no existing file is touched. Open/closed in its plain form.
 *
 * Classes may compute but hold nothing (T1): every handler is stateless, and a
 * test checks it.
 */
export interface EffectHandler<T extends Effect = Effect> {
  readonly type: T["type"];
  apply(state: GameState, effect: T, config: Config, sector: SectorId): GameState;
}

type CapacityEffect = Extract<Effect, { type: "capacity" }>;

/** Capacity moves between types and holders; amounts may be negative (E12, E13). */
/**
 * Land added or taken away brings what lives on it along, at the density it
 * already lies at — so opening country never makes its stock look scarcer than
 * it was, and giving country up never makes what is left look richer.
 */
function stocked(
  state: GameState,
  config: Config,
  capacity: CapacityId,
  added: number,
  before: GameState,
): GameState {
  if (added === 0) return state;
  let area = capacityOf(before.unownedCapacity, capacity).amount;
  for (const holder of Object.values(before.sectors)) {
    area += capacityOf(holder.capacityHeld, capacity).amount;
  }
  if (area <= 0) return state;
  const factor = Math.max(0, (area + added) / area);
  const grown = config.stocks.filter((stock) => stock.regrowth?.capacity === capacity);
  if (grown.length === 0) return state;

  const sectors: Record<SectorId, SectorState> = {};
  for (const [id, holder] of Object.entries(state.sectors)) {
    const stocks: Record<StockId, number> = { ...holder.stocks };
    for (const stock of grown) stocks[stock.id] = (stocks[stock.id] ?? 0) * factor;
    sectors[id] = { ...holder, stocks };
  }
  return { ...state, sectors };
}

class CapacityEffectHandler implements EffectHandler<CapacityEffect> {
  readonly type = "capacity" as const;

  apply(
    state: GameState,
    effect: CapacityEffect,
    config: Config,
    sector: SectorId,
  ): GameState {
    const { quality, advanceTaking } = resolveQuality(
      state,
      config,
      effect,
      effect.capacity,
    );
    /**
     * Room added without a quality of its own arrives at the quality that kind
     * of ground stands at in the range — held and unowned together, weighted by
     * area. It is the only figure that changes nothing: the average the range
     * reports is the same before and after, and what is added is neither better
     * nor worse than what is there.
     *
     * At one it was better than the range as soon as the range had been walked
     * once, and the boat's water quietly pulled the reported land quality back
     * up towards fresh country. A taking says where its quality comes from and
     * keeps saying it; this is for everything that does not.
     */
    const arriving = quality ?? averageQuality(state, effect.capacity);
    const withTaking = advanceTaking
      ? { ...state, landTakings: state.landTakings + 1 }
      : state;
    // New country comes with what lives on it (E29). Opening water without its
    // fish left the same fish spread over four times the water, so the boat —
    // which is supposed to open the water — made fishing dearer instead:
    // measured, the price went from 1.20 to 6.64 the tick it was finished,
    // without one fish fewer being there. Everything that grows on a stretch of
    // country therefore grows with it, so that how thick it lies is unchanged.
    const next = stocked(withTaking, config, effect.capacity, effect.amount, state);

    if (effect.sector === undefined) {
      const current = capacityOf(next.unownedCapacity, effect.capacity);
      return {
        ...next,
        unownedCapacity: {
          ...next.unownedCapacity,
          [effect.capacity]: blend(current, effect.amount, arriving),
        },
      };
    }

    const target = effect.sector === "self" ? sector : effect.sector;
    const holder = next.sectors[target];
    if (holder === undefined) return next;
    const current = capacityOf(holder.capacityHeld, effect.capacity);
    return {
      ...next,
      sectors: {
        ...next.sectors,
        [target]: {
          ...holder,
          capacityHeld: {
            ...holder.capacityHeld,
            [effect.capacity]: blend(current, effect.amount, arriving),
          },
        },
      },
    };
  }
}

/**
 * What the next range would be worth (E13, E29): a step below the country
 * being left, times this tick's report. Reckoned from what the community
 * leaves, never from a count — whoever walks trades the range they know for
 * one a step poorer on average, and a good report can beat it. Waiting for
 * one is the player's craft; what it costs is the wearing of the range being
 * sat on.
 */
export function nextRangeQuality(
  state: GameState,
  config: Config,
  capacity: CapacityId,
): number {
  return (
    averageQuality(state, capacity) *
    (1 - config.land.qualityDecayPerTaking) *
    state.landOffer
  );
}

/** Where the quality of added area comes from (E13) — data, never code. */
function resolveQuality(
  state: GameState,
  config: Config,
  effect: { readonly quality?: QualitySource },
  capacity: CapacityId,
): { quality: number | undefined; advanceTaking: boolean } {
  const source: QualitySource | undefined = effect.quality;
  if (source === undefined) return { quality: undefined, advanceTaking: false };

  switch (source.kind) {
    case "fixed":
      return { quality: source.value, advanceTaking: false };
    case "from":
      return { quality: averageQuality(state, source.capacity), advanceTaking: false };
    case "nextTaking":
      return {
        quality: nextRangeQuality(state, config, capacity),
        advanceTaking: true,
      };
  }
}

/** Quality of an area type over all holders and the unowned pool. */
function averageQuality(state: GameState, capacity: CapacityId): number {
  let area = 0;
  let weighted = 0;
  const unowned = capacityOf(state.unownedCapacity, capacity);
  area += unowned.amount;
  weighted += unowned.amount * unowned.quality;
  for (const sector of Object.values(state.sectors)) {
    const owned = capacityOf(sector.capacityHeld, capacity);
    area += owned.amount;
    weighted += owned.amount * owned.quality;
  }
  return area > 0 ? weighted / area : 1;
}

/** Adding area of a stated quality shifts the holder's average (E13). */
function blend(current: Capacity, amount: number, quality: number | undefined): Capacity {
  const next = Math.max(0, current.amount + amount);
  if (amount <= 0 || quality === undefined) {
    return { amount: next, quality: current.quality };
  }
  const total = current.amount + amount;
  const blended =
    total > 0 ? (current.amount * current.quality + amount * quality) / total : quality;
  return { amount: next, quality: blended };
}

/**
 * Unlocking a branch, a process or a rule changes nothing in the state: it
 * follows from the finished projects (E23, see `unlocks.ts`). The handlers
 * exist so that every effect type has exactly one place, and so that an effect
 * that *does* touch the state later needs no change here.
 */
class NoStateChangeHandler implements EffectHandler {
  readonly type: Effect["type"];

  // Written out rather than as a parameter property: Node runs TypeScript by
  // stripping types, and a parameter property is not a type (T5).
  constructor(type: Effect["type"]) {
    this.type = type;
  }

  apply(state: GameState): GameState {
    return state;
  }
}

type StockEffect = Extract<Effect, { type: "stock" }>;
type SetCapacityEffect = Extract<Effect, { type: "setCapacity" }>;
type TakingsEffect = Extract<Effect, { type: "takings" }>;

/**
 * What a level source comes to (T3): a plain figure, or what the range carries
 * of a renewable stock — its area times the density that stands at the stock.
 */
function levelOf(
  state: GameState,
  config: Config,
  source: LevelSource,
  stockId: string,
): number {
  if (source.kind === "fixed") return source.value;
  const rule = config.stocks.find((stock) => stock.id === stockId)?.regrowth;
  if (rule === undefined) return 0;
  let area = carryingArea(capacityOf(state.unownedCapacity, rule.capacity));
  for (const holder of Object.values(state.sectors)) {
    area += carryingArea(capacityOf(holder.capacityHeld, rule.capacity));
  }
  const ceiling = area * carriedPerArea(state, rule.densityPerArea, stockId);
  const closes = source.closes ?? 1;
  if (closes >= 1) return ceiling;
  let held = 0;
  for (const holder of Object.values(state.sectors)) held += holder.stocks[stockId] ?? 0;
  return held + closes * Math.max(0, ceiling - held);
}

/** Sets a stock outright — what is left behind, and what a fresh country holds. */
class StockEffectHandler implements EffectHandler<StockEffect> {
  readonly type = "stock" as const;

  apply(
    state: GameState,
    effect: StockEffect,
    config: Config,
    sector: SectorId,
  ): GameState {
    const holder = state.sectors[sector];
    if (holder === undefined) return state;
    return {
      ...state,
      sectors: {
        ...state.sectors,
        [sector]: {
          ...holder,
          stocks: {
            ...holder.stocks,
            [effect.id]: levelOf(state, config, effect.to, effect.id),
          },
        },
      },
    };
  }
}

/**
 * Sets what a capacity is: how much of it there is, how good it is, or both.
 * The pits stay in the ground when a community moves on, and the country it moves
 * into is the same size but a little poorer.
 */
class SetCapacityEffectHandler implements EffectHandler<SetCapacityEffect> {
  readonly type = "setCapacity" as const;

  apply(
    state: GameState,
    effect: SetCapacityEffect,
    config: Config,
    sector: SectorId,
  ): GameState {
    const { quality, advanceTaking } =
      effect.quality === undefined
        ? { quality: undefined, advanceTaking: false }
        : resolveQuality(state, config, { quality: effect.quality }, effect.capacity);
    const next = advanceTaking ? { ...state, landTakings: state.landTakings + 1 } : state;
    const settle = (current: Capacity): Capacity => ({
      amount:
        effect.to === undefined ? current.amount : levelOf(next, config, effect.to, ""),
      quality: quality ?? current.quality,
    });

    if (effect.sector === undefined) {
      return {
        ...next,
        unownedCapacity: {
          ...next.unownedCapacity,
          [effect.capacity]: settle(capacityOf(next.unownedCapacity, effect.capacity)),
        },
      };
    }
    const target = effect.sector === "self" ? sector : effect.sector;
    const holder = next.sectors[target];
    if (holder === undefined) return next;
    return {
      ...next,
      sectors: {
        ...next.sectors,
        [target]: {
          ...holder,
          capacityHeld: {
            ...holder.capacityHeld,
            [effect.capacity]: settle(capacityOf(holder.capacityHeld, effect.capacity)),
          },
        },
      },
    };
  }
}

/** Forgets how much fresh country has been used up (E29). */
class TakingsEffectHandler implements EffectHandler<TakingsEffect> {
  readonly type = "takings" as const;

  apply(state: GameState, effect: TakingsEffect): GameState {
    return { ...state, landTakings: Math.max(0, effect.set) };
  }
}

type CarriesEffect = Extract<Effect, { type: "carries" }>;

/**
 * The range comes to carry more of something, per unit of ground (E29).
 *
 * What is already there grows in the same proportion. Raising the ceiling
 * alone would make what lives under it read as suddenly scarce — the price of
 * searching is rightly the density, and it would report a herd that nobody had
 * touched as thinned out. That was the boat's mistake before land learned to
 * bring its stock along, and it must not be made twice.
 */
class CarriesEffectHandler implements EffectHandler<CarriesEffect> {
  readonly type = "carries" as const;

  apply(state: GameState, effect: CarriesEffect, config: Config): GameState {
    const rule = config.stocks.find((stock) => stock.id === effect.stock)?.regrowth;
    const added =
      effect.reset === true
        ? -(state.rangeCarries[effect.stock] ?? 0)
        : effect.addPerArea;
    if (rule === undefined || added === 0) return state;
    const was = carriedPerArea(state, rule.densityPerArea, effect.stock);
    const now = Math.max(0, was + added);
    if (was <= 0) return state;
    const factor = now / was;

    const sectors: Record<SectorId, SectorState> = {};
    for (const [id, holder] of Object.entries(state.sectors)) {
      sectors[id] = {
        ...holder,
        stocks: {
          ...holder.stocks,
          [effect.stock]: (holder.stocks[effect.stock] ?? 0) * factor,
        },
      };
    }
    return {
      ...state,
      sectors,
      rangeCarries: {
        ...state.rangeCarries,
        [effect.stock]: (state.rangeCarries[effect.stock] ?? 0) + added,
      },
    };
  }
}

const HANDLERS: readonly EffectHandler[] = [
  new StockEffectHandler() as EffectHandler,
  new SetCapacityEffectHandler() as EffectHandler,
  new CarriesEffectHandler() as EffectHandler,
  new TakingsEffectHandler() as EffectHandler,
  new CapacityEffectHandler() as EffectHandler,
  new NoStateChangeHandler("process"),
  new NoStateChangeHandler("branch"),
  new NoStateChangeHandler("rule"),
  new NoStateChangeHandler("tier"),
];

const REGISTRY: ReadonlyMap<Effect["type"], EffectHandler> = new Map(
  HANDLERS.map((handler) => [handler.type, handler]),
);

export function applyEffect(
  state: GameState,
  effect: Effect,
  config: Config,
  sector: SectorId,
): GameState {
  const handler = REGISTRY.get(effect.type);
  if (handler === undefined) {
    throw new Error(`No handler for effect type "${effect.type}"`);
  }
  return handler.apply(state, effect, config, sector);
}

export function effectTypesWithHandler(): readonly Effect["type"][] {
  return [...REGISTRY.keys()];
}
