import { allocate, type AllocationResult } from "./allocation.ts";
import { type ConfigIndex, tierEffectAt } from "./config.ts";
import { applyEffect } from "./effects.ts";
import type { SectorId, StockId } from "./ids.ts";
import { drawShocks, type Shocks } from "./risk.ts";
import {
  stockOf,
  type ActiveProject,
  type GameState,
  type SectorState,
} from "./state.ts";
import { computeUnlocks, type Unlocks } from "./unlocks.ts";

/**
 * The tick is an ordered list of phases (T2). Introducing money later means one
 * more line in that list; no existing phase is touched.
 *
 * Phases may compute but hold nothing (T1). Everything that lives longer than
 * one call is either in the state or in the context, and the context is thrown
 * away at the end of the tick.
 */
export interface TickContext {
  shocks: Shocks;
  unlocks: Unlocks;
  laborAvailable: number;
  laborToProjects: number;
  allocation?: AllocationResult;
  completed: string[];
}

export interface Phase {
  readonly id: string;
  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState;
}

/** Until property exists there is exactly one sector (E22). */
export const HOUSEHOLDS: SectorId = "households";


export function laborPerformance(sector: SectorState | undefined): number {
  if (sector === undefined) return 0;
  return sector.heads * sector.workAbility * sector.productivity;
}

// ------------------------------------------------------------------ weather

/**
 * One draw per random stream per tick (E24, E25). Every process reacts with its
 * own exposure — and two processes on the same stream break down together,
 * which is what makes moving to another stream a real spreading of risk.
 */
export class ShockPhase implements Phase {
  readonly id = "shocks";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    const { shocks, random } = drawShocks(state.random, index.config);
    ctx.shocks = shocks;
    return { ...state, random };
  }
}

// -------------------------------------------------------------------- decay

/**
 * Geometric decay, the first step of the tick (E19): first what falls apart
 * falls apart, then the rest is reckoned with. The usual order of stock
 * accounting — opening balance, outflow, then additions.
 */
export class DecayPhase implements Phase {
  readonly id = "decay";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    const sectors: Record<SectorId, SectorState> = {};
    for (const [id, sector] of Object.entries(state.sectors)) {
      const stocks: Record<StockId, number> = {};
      for (const [stockId, amount] of Object.entries(sector.stocks)) {
        stocks[stockId] = amount * (1 - decayRate(index, stockId, ctx));
      }
      sectors[id] = { ...sector, stocks };
    }
    return { ...state, sectors };
  }
}

// ----------------------------------------------------------------- projects

/**
 * Projects come first (E21), and each needs cost divided by minimum duration of
 * *every* resource per tick. If one is missing the project pauses and consumes
 * nothing (E18) — so a blocked project never eats what it cannot use.
 */
export class ProjectPhase implements Phase {
  readonly id = "projects";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    ctx.unlocks = computeUnlocks(state, index);
    const sector = state.sectors[HOUSEHOLDS];
    ctx.laborAvailable = laborPerformance(sector);

    // Labour is a stock now, so a project spends it like it spends wood. The
    // plan has already produced for it — projects hold the top rank — so this
    // phase only books what was set aside.
    const stocks: Record<StockId, number> = { ...(sector?.stocks ?? {}) };
    let laborLeft = stocks["labor"] ?? 0;

    const ordered = [...state.activeProjects].sort((a, b) => a.order - b.order);
    const remaining: ActiveProject[] = [];
    let next = state;

    for (const active of ordered) {
      const def = index.project.get(active.id);
      if (def === undefined) continue;
      if (active.paused) {
        remaining.push(active);
        continue;
      }

      const step = 1 / def.minTicks;
      const laborNeeded = def.laborCost * step;
      const affordable =
        laborNeeded <= laborLeft + 1e-12 &&
        Object.entries(def.stockCost).every(
          ([id, total]) => total * step <= (stocks[id] ?? 0) + 1e-12,
        );

      if (!affordable) {
        remaining.push(active);
        continue;
      }

      laborLeft -= laborNeeded;
      stocks["labor"] = laborLeft;
      for (const [id, total] of Object.entries(def.stockCost)) {
        stocks[id] = (stocks[id] ?? 0) - total * step;
      }

      const progress = active.progress + step;
      if (progress >= 1 - 1e-9) {
        next = { ...next, completedProjects: bump(next.completedProjects, def.id) };
        for (const effect of def.effects) {
          next = applyEffect(next, effect, index.config, def.sector);
        }
        ctx.completed.push(def.id);
      } else {
        remaining.push({ ...active, progress });
      }
    }

    ctx.laborToProjects = (sector?.stocks["labor"] ?? 0) - laborLeft;

    const current = next.sectors[HOUSEHOLDS];
    return {
      ...next,
      sectors:
        current === undefined
          ? next.sectors
          : { ...next.sectors, [HOUSEHOLDS]: { ...current, stocks } },
      activeProjects: remaining,
    };
  }
}

/**
 * A rule may replace the decay rate (E23): with sedentism food becomes
 * storable, and that is a switch the phase reads — not a fifth effect type.
 */
function decayRate(index: ConfigIndex, stockId: StockId, ctx: TickContext): number {
  const def = index.stock.get(stockId);
  if (def === undefined) return 0;
  for (const override of def.decayWhenRule ?? []) {
    if (ctx.unlocks.rules.has(override.rule)) return override.decayPerTick;
  }
  return def.decayPerTick;
}

function bump(
  counts: Readonly<Record<string, number>>,
  id: string,
): Record<string, number> {
  return { ...counts, [id]: (counts[id] ?? 0) + 1 };
}

// --------------------------------------------------------------- production

/** Allocation and production (E21, E5). The result is kept for later phases. */
export class ProductionPhase implements Phase {
  readonly id = "production";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    const result = allocate({
      state,
      index,
      sectorId: HOUSEHOLDS,
      shocks: ctx.shocks,
      laborToProjects: 0,
      unlockedBranches: ctx.unlocks.branches,
      unlockedProcesses: ctx.unlocks.processes,
    });
    ctx.allocation = result;

    const sector = state.sectors[HOUSEHOLDS];
    if (sector === undefined) return state;

    const stocks: Record<StockId, number> = { ...sector.stocks };
    for (const [id, amount] of Object.entries(result.produced)) {
      stocks[id] = stockOf(stocks, id) + amount;
    }
    for (const [id, amount] of Object.entries(result.consumed)) {
      stocks[id] = Math.max(0, stockOf(stocks, id) - amount);
    }

    return {
      ...state,
      sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, stocks } },
      leadProcess: result.leadProcess,
    };
  }
}

// --------------------------------------------------------------- population

/**
 * Two rates per tick, births and deaths (E20). Each need tier shifts one of
 * them, interpolated linearly between no and full coverage — the non-linearity
 * that famine mortality needs already sits in the ranking.
 *
 * At rank 100 fully covered and nothing above, births equal deaths and the
 * population stands. That fixes both base rates and defines the Malthusian
 * point exactly rather than by feel.
 */
export class PopulationPhase implements Phase {
  readonly id = "population";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    const sector = state.sectors[HOUSEHOLDS];
    const allocation = ctx.allocation;
    if (sector === undefined || allocation === undefined) return state;

    let birthRate = index.config.population.baseBirthRate;
    let deathRate = index.config.population.baseDeathRate;

    for (const outcome of allocation.tiers) {
      const tier = index.tier.get(outcome.tier);
      if (tier === undefined) continue;
      birthRate += tierEffectAt(tier.birthRate, outcome.coverage);
      deathRate += tierEffectAt(tier.deathRate, outcome.coverage);
    }

    const heads = Math.max(0, sector.heads * (1 + birthRate - deathRate));
    return {
      ...state,
      sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, heads } },
    };
  }
}

// ------------------------------------------------------------------ carried

/**
 * The carried factors are written forward at the end of the tick and used in
 * the next one (T2). That is what breaks the circle: coverage needs production,
 * production needs labour performance, labour performance needs these two, and
 * they need coverage.
 *
 * It is not a computational stopgap either — nutrition works on the ability to
 * work with a delay in reality as well.
 */
export class CarryPhase implements Phase {
  readonly id = "carried";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    const sector = state.sectors[HOUSEHOLDS];
    const allocation = ctx.allocation;
    if (sector === undefined || allocation === undefined) return state;

    let productivity = index.config.carried.baseProductivity;
    let workAbility = index.config.carried.baseWorkAbility;

    for (const outcome of allocation.tiers) {
      const tier = index.tier.get(outcome.tier);
      if (tier === undefined) continue;
      productivity += tierEffectAt(tier.productivity, outcome.coverage);
      workAbility += tierEffectAt(tier.workAbility, outcome.coverage);
    }

    const rate = index.config.carried.adjustmentPerTick;
    return {
      ...state,
      sectors: {
        ...state.sectors,
        [HOUSEHOLDS]: {
          ...sector,
          productivity: sector.productivity + (productivity - sector.productivity) * rate,
          workAbility: sector.workAbility + (workAbility - sector.workAbility) * rate,
        },
      },
    };
  }
}

export const PIPELINE: readonly Phase[] = [
  new ShockPhase(),
  new DecayPhase(),

  new ProductionPhase(),
  new ProjectPhase(),
  new PopulationPhase(),
  new CarryPhase(),
  // new MoneyPhase(),  ← later, one line, nothing above is touched
];
