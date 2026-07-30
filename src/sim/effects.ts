import type { Config, Effect, QualitySource } from "./config.ts";
import type { AreaTypeId, SectorId } from "./ids.ts";
import { areaOf, type Area, type GameState } from "./state.ts";

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

/** Area moves between types and holders; amounts may be negative (E12, E13). */
class CapacityEffectHandler implements EffectHandler<CapacityEffect> {
  readonly type = "capacity" as const;

  apply(
    state: GameState,
    effect: CapacityEffect,
    config: Config,
    sector: SectorId,
  ): GameState {
    const { quality, advanceTaking } = resolveQuality(state, config, effect);
    const next = advanceTaking ? { ...state, landTakings: state.landTakings + 1 } : state;

    if (effect.sector === undefined) {
      const current = areaOf(next.unownedAreas, effect.areaType);
      return {
        ...next,
        unownedAreas: {
          ...next.unownedAreas,
          [effect.areaType]: blend(current, effect.amount, quality),
        },
      };
    }

    const target = effect.sector === "self" ? sector : effect.sector;
    const holder = next.sectors[target];
    if (holder === undefined) return next;
    const current = areaOf(holder.areas, effect.areaType);
    return {
      ...next,
      sectors: {
        ...next.sectors,
        [target]: {
          ...holder,
          areas: {
            ...holder.areas,
            [effect.areaType]: blend(current, effect.amount, quality),
          },
        },
      },
    };
  }
}

/** Where the quality of added area comes from (E13) — data, never code. */
function resolveQuality(
  state: GameState,
  config: Config,
  effect: CapacityEffect,
): { quality: number | undefined; advanceTaking: boolean } {
  const source: QualitySource | undefined = effect.quality;
  if (source === undefined) return { quality: undefined, advanceTaking: false };

  switch (source.kind) {
    case "fixed":
      return { quality: source.value, advanceTaking: false };
    case "from":
      return { quality: averageQuality(state, source.areaType), advanceTaking: false };
    case "nextTaking":
      return {
        quality:
          config.land.baseQuality *
          Math.pow(1 - config.land.qualityDecayPerTaking, state.landTakings),
        advanceTaking: true,
      };
  }
}

/** Quality of an area type over all holders and the unowned pool. */
function averageQuality(state: GameState, areaType: AreaTypeId): number {
  let area = 0;
  let weighted = 0;
  const unowned = areaOf(state.unownedAreas, areaType);
  area += unowned.area;
  weighted += unowned.area * unowned.quality;
  for (const sector of Object.values(state.sectors)) {
    const owned = areaOf(sector.areas, areaType);
    area += owned.area;
    weighted += owned.area * owned.quality;
  }
  return area > 0 ? weighted / area : 1;
}

/** Adding area of a stated quality shifts the holder's average (E13). */
function blend(current: Area, amount: number, quality: number | undefined): Area {
  const next = Math.max(0, current.area + amount);
  if (amount <= 0 || quality === undefined) {
    return { area: next, quality: current.quality };
  }
  const total = current.area + amount;
  const blended =
    total > 0 ? (current.area * current.quality + amount * quality) / total : quality;
  return { area: next, quality: blended };
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

const HANDLERS: readonly EffectHandler[] = [
  new CapacityEffectHandler() as EffectHandler,
  new NoStateChangeHandler("process"),
  new NoStateChangeHandler("branch"),
  new NoStateChangeHandler("rule"),
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
