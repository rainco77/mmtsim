import { allocate, type AllocationResult } from "./allocation.ts";
import { type ConfigIndex, tierEffectAt } from "./config.ts";
import { applyEffect } from "./effects.ts";
import type { CapacityId, ProcessId, SectorId, StockId } from "./ids.ts";
import { drawShocks, type Shocks } from "./risk.ts";
import {
  capacityOf,
  stockOf,
  type ActiveProject,
  type Capacity,
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
/**
 * What falls apart, falls apart — reckoned in one place (E19).
 *
 * Pure, and exported, because two callers need exactly this answer: the phase,
 * which is the first step of the tick, and `derive`, which previews what the
 * tick will make of the state. `derive` is asked *between* two ticks, so the
 * stocks it is handed still carry what the coming decay will take off; letting
 * it plan on those was giving the economy inputs the tick would never see —
 * most visibly with labour, which decays completely, so the previous tick's
 * remainder was planned in again.
 *
 * The view keeps showing the raw holdings, which are the fact of the matter.
 * Only the allocation reckons with what is left after the decay.
 */
export function decayed(state: GameState, index: ConfigIndex, unlocks: Unlocks): GameState {
  const sectors: Record<SectorId, SectorState> = {};
  for (const [id, sector] of Object.entries(state.sectors)) {
    const stocks: Record<StockId, number> = {};
    for (const [stockId, amount] of Object.entries(sector.stocks)) {
      const def = index.stock.get(stockId);
      const ordinary = decayRate(index, stockId, unlocks);
      const shelter = def?.protectedBy;
      if (shelter === undefined) {
        stocks[stockId] = amount * (1 - ordinary);
        continue;
      }
      // A store is capacity, not a container (E19): what it covers keeps, the
      // rest spoils at the ordinary rate. There is no "store full".
      const covered = Math.min(amount, capacityOf(sector.capacityHeld, shelter.capacity).amount);
      const sheltered =
        shelter.decayWhenRule?.find((entry) => unlocks.rules.has(entry.rule))?.decayPerTick ??
        shelter.decayPerTick;
      stocks[stockId] = covered * (1 - sheltered) + (amount - covered) * (1 - ordinary);
    }
    // Capacity decays too, and keeping it means building it again (E19).
    const capacityHeld: Record<CapacityId, Capacity> = {};
    for (const [held_id, held] of Object.entries(sector.capacityHeld)) {
      const rate = index.config.capacities.find((c) => c.id === held_id)?.decayPerTick ?? 0;
      capacityHeld[held_id] = { ...held, amount: held.amount * (1 - rate) };
    }
    sectors[id] = { ...sector, stocks, capacityHeld };
  }
  return { ...state, sectors };
}

export class DecayPhase implements Phase {
  readonly id = "decay";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    return decayed(state, index, ctx.unlocks);
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

      // The minimum duration is the **fastest** pace, not a condition: it says
      // how much may flow in per tick. Less available means slower, not
      // nothing. All-or-nothing threw the difference away — measured, six of
      // the 7.5 units a project could take were produced and lost, and the
      // progress bar did not move.
      const full = 1 / def.minTicks;
      const laborWanted = def.laborCost * full;

      // Every resource in lockstep (E18): the pace is set by the scarcest of
      // them, and exactly that fraction of each is taken.
      let pace = 1;
      if (laborWanted > 0) pace = Math.min(pace, laborLeft / laborWanted);
      for (const [id, total] of Object.entries(def.stockCost)) {
        const wanted = total * full;
        if (wanted > 0) pace = Math.min(pace, (stocks[id] ?? 0) / wanted);
      }
      pace = Math.max(0, Math.min(1, pace));

      if (pace <= 1e-12) {
        remaining.push(active);
        continue;
      }

      const step = full * pace;
      laborLeft -= laborWanted * pace;
      stocks["labor"] = laborLeft;
      for (const [id, total] of Object.entries(def.stockCost)) {
        stocks[id] = (stocks[id] ?? 0) - total * full * pace;
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
function decayRate(index: ConfigIndex, stockId: StockId, unlocks: Unlocks): number {
  const def = index.stock.get(stockId);
  if (def === undefined) return 0;
  for (const override of def.decayWhenRule ?? []) {
    if (unlocks.rules.has(override.rule)) return override.decayPerTick;
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
      tierPerHead: ctx.unlocks.tierPerHead,
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

    // One improves what one does (E29): every run adds to the tally of its own
    // process, and the tally never falls.
    const experience: Record<ProcessId, number> = { ...state.experience };
    for (const run of result.runs) {
      if (run.output <= 0) continue;
      experience[run.process] = (experience[run.process] ?? 0) + run.output;
    }

    return {
      ...state,
      sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, stocks } },
      leadProcess: result.leadProcess,
      experience,
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
    const next: GameState = {
      ...state,
      sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, heads } },
    };

    // Below the minimum viable size the settlement is given up (E20), and that
    // is written down rather than left to be noticed: from the next tick on
    // nothing moves any more.
    return heads < index.config.population.minimumViableSize
      ? { ...next, abandonedAt: state.tick }
      : next;
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
