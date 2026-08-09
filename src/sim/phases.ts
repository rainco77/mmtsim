import { allocate, type AllocationResult } from "./allocation.ts";
import { type Config, type ConfigIndex, tierEffectAt } from "./config.ts";
import { applyEffect } from "./effects.ts";
import type { ActivityId, ProjectId, CapacityId, SectorId, StockId } from "./ids.ts";
import { draw, type RandomState } from "./random.ts";
import { drawShocks, type Shocks } from "./risk.ts";
import {
  capacityOf,
  carryingArea,
  stockOf,
  totalHeads,
  weighedHeads,
  type ActiveProject,
  type Capacity,
  type GameState,
  type SectorState,
} from "./state.ts";
import { allHold, computeUnlocks, type ConditionContext, type Unlocks } from "./unlocks.ts";

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
  /** What the strain measures read in the position a run begins in — see `outset.ts`. */
  startReadings: Readonly<Record<string, number>>;
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

/**
 * The stream the report on the next range is drawn from (E25). Its own stream,
 * so that adding it shifts nothing the weather does — a draw is a pure function
 * of seed, stream and counter.
 */
const LAND_STREAM = "land";

/**
 * What the country now on offer is worth against the mean: a factor about one,
 * even about it, so the mean the takings have come down to is left exactly
 * where it was.
 */
export function drawLandOffer(
  random: RandomState,
  config: ConfigIndex["config"],
): { offer: number; random: RandomState } {
  const spread = config.land.qualitySpread ?? 0;
  const result = draw(random, LAND_STREAM);
  return { offer: 1 + spread * (2 * result.value - 1), random: result.random };
}


/**
 * The carrying brake on the births (E20, E29): how hard the children weigh is
 * their load per bearer, times how far the searching ranges beyond fresh
 * country.
 *
 * The distance is the tick's own. Every stand that was taken from is priced by
 * the allocation, and the prices are averaged over the labour that went into
 * the taking — whoever spends most of the day searching far sets most of the
 * weight. Nothing searched, or searching as cheap as fresh country, means no
 * brake; and a community that has settled carries nothing, whatever the
 * searching costs.
 */
export function backloadFactor(
  cohorts: Readonly<Record<string, number>>,
  allocation: AllocationResult,
  unlocks: Unlocks | undefined,
  index: ConfigIndex,
): number {
  const backload = index.config.population.backload;
  if (backload === undefined) return 1;
  if (unlocks !== undefined && unlocks.rules.has(backload.liftedByRule)) return 1;

  const bearers = weighedHeads(cohorts, index.config.population.birthWeight);
  if (bearers <= 0) return 1;
  const load = weighedHeads(cohorts, backload.loadWeight) / bearers;

  let labour = 0;
  let priced = 0;
  for (const run of allocation.runs) {
    if (run.labor <= 0) continue;
    const def = index.process.get(run.process);
    if (def === undefined) continue;
    for (const input of Object.keys(def.intermediatesPerOutput)) {
      if (index.stock.get(input)?.regrowth === undefined) continue;
      labour += run.labor;
      priced += run.labor * (allocation.effortPerStock[input] ?? 1);
    }
  }
  const effort = labour > 0 ? priced / labour : 1;

  return Math.max(0, 1 - backload.strength * load * Math.max(0, effort - 1));
}

/**
 * What the community can do this tick: the heads that supply labour, weighted
 * by how much each supplies, times work ability times productivity (E20).
 *
 * The weighting is where a half-grown pair of hands lives. Work ability and
 * productivity stay one figure each, because they would say the same thing
 * twice — somebody who supplies no labour cannot be made less productive in any
 * way that shows.
 */
export function laborPerformance(sector: SectorState | undefined, config: Config): number {
  if (sector === undefined) return 0;
  return (
    weighedHeads(sector.cohorts, config.population.labourWeight) *
    sector.workAbility *
    sector.productivity
  );
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

/**
 * What grows back, grows back (E29) — the mirror of the decay above, and it
 * runs beside it at the head of the tick: the herd breeds out of what the
 * last tick's hunting left standing, and only then is this one reckoned.
 */
/**
 * Where a renewable stock stands: what is held, what the range can carry, and
 * what will grow back this tick (E29).
 *
 * The third number is the one that matters. A stock on its own says nothing —
 * "three hundred deer" is neither much nor little until the ceiling stands
 * beside it — and neither does a ceiling, until one can see what grows. Held
 * against the ceiling says *how thin it is*; growth against what is being taken
 * says *whether that will last*. That comparison is the whole of husbandry, and
 * without it the thinning of a range is a silent drift in the numbers that
 * nobody, player or bot, can act on.
 */
/**
 * How much of a stock a unit of ground holds: what untouched country carries,
 * plus whatever husbandry has added to it since (E29).
 */
export function carriedPerArea(state: GameState, base: number, stockId: StockId): number {
  return base + (state.rangeCarries[stockId] ?? 0);
}

export interface Renewal {
  readonly held: number;
  readonly ceiling: number;
  readonly growth: number;
}

function renewalIn(
  state: GameState,
  index: ConfigIndex,
  sector: SectorState,
  stockId: StockId,
): Renewal | undefined {
  const rule = index.stock.get(stockId)?.regrowth;
  if (rule === undefined) return undefined;
  const owned = carryingArea(capacityOf(sector.capacityHeld, rule.capacity));
  const unowned = carryingArea(capacityOf(state.unownedCapacity, rule.capacity));
  const ceiling = (owned + unowned) * carriedPerArea(state, rule.densityPerArea, stockId);
  const held = sector.stocks[stockId] ?? 0;
  if (ceiling <= 0) return { held, ceiling: 0, growth: 0 };
  const raw = rule.ratePerTick * (held + rule.refuge) * (1 - held / ceiling);
  // What will really be added, after the ceiling and the floor have their say.
  const growth = Math.max(0, Math.min(ceiling, held + raw)) - held;
  return { held, ceiling, growth };
}

/** The same, for every renewable stock and over every holder — for the view. */
export function renewals(state: GameState, index: ConfigIndex): Record<StockId, Renewal> {
  const out: Record<StockId, Renewal> = {};
  for (const def of index.config.stocks) {
    if (def.regrowth === undefined) continue;
    let held = 0;
    let ceiling = 0;
    let growth = 0;
    for (const sector of Object.values(state.sectors)) {
      const one = renewalIn(state, index, sector, def.id);
      if (one === undefined) continue;
      held += one.held;
      ceiling += one.ceiling;
      growth += one.growth;
    }
    out[def.id] = { held, ceiling, growth };
  }
  return out;
}

/**
 * What grows back, grows back (E29) — the mirror of the decay below, and it
 * runs beside it at the head of the tick: the herd breeds out of what the
 * last tick's hunting left standing, and only then is this one reckoned.
 */
export function regrown(state: GameState, index: ConfigIndex): GameState {
  const sectors: Record<SectorId, SectorState> = {};
  let touched = false;
  for (const [id, sector] of Object.entries(state.sectors)) {
    const stocks: Record<StockId, number> = { ...sector.stocks };
    for (const def of index.config.stocks) {
      if (def.regrowth === undefined) continue;
      const one = renewalIn(state, index, sector, def.id);
      if (one === undefined) continue;
      stocks[def.id] = one.held + one.growth;
      touched = true;
    }
    sectors[id] = { ...sector, stocks };
  }
  return touched ? { ...state, sectors } : state;
}

export class RegrowthPhase implements Phase {
  readonly id = "regrowth";

  run(state: GameState, index: ConfigIndex): GameState {
    return regrown(fadedCarries(state, index), index);
  }
}

/**
 * A carried bonus fades as the underbrush returns (E29): each tick takes the
 * stated share of it, and what lives on the bonus goes with it — the same
 * proportional step a burn makes, run backwards, so the searching never reads
 * a fading range as untouched.
 */
function fadedCarries(state: GameState, index: ConfigIndex): GameState {
  let next = state;
  for (const [stockId, bonus] of Object.entries(state.rangeCarries)) {
    if (bonus === 0) continue;
    const rate = index.stock.get(stockId)?.regrowth?.carriedFadePerTick ?? 0;
    if (rate <= 0) continue;
    next = applyEffect(
      next,
      { type: "carries", stock: stockId, addPerArea: -rate * bonus },
      index.config,
      HOUSEHOLDS,
    );
  }
  return next;
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
    ctx.laborAvailable = laborPerformance(sector, index.config);

    // Labour is a stock now, so a project spends it like it spends wood. The
    // plan has already produced for it — projects hold the top rank — so this
    // phase only books what was set aside.
    const opening: Readonly<Record<StockId, number>> = sector?.stocks ?? {};
    const stocks: Record<StockId, number> = { ...opening };
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
        // The effects settle against the report the project was started on:
        // whoever committed to a range moves into that range, not into
        // whatever the offer happens to say the tick the walking ends.
        const liveOffer = next.landOffer;
        next = { ...next, landOffer: active.landOfferAtStart };
        for (const effect of def.effects) {
          next = applyEffect(next, effect, index.config, def.sector);
        }
        next = { ...next, landOffer: liveOffer };
        ctx.completed.push(def.id);
      } else {
        remaining.push({ ...active, progress });
      }
    }

    ctx.laborToProjects = (sector?.stocks["labor"] ?? 0) - laborLeft;

    const current = next.sectors[HOUSEHOLDS];
    // What this phase spent, laid on top of whatever the effects left — not the
    // copy it started from. Written back whole, it silently undid every stock a
    // finished project had touched: the boat opened four times the water and
    // the fish that came with it were thrown away in the same tick, and the
    // change of range set the country back to full for exactly as long as it
    // took to reach this line.
    const kept: Record<StockId, number> = { ...(current?.stocks ?? {}) };
    for (const id of new Set([...Object.keys(opening), ...Object.keys(stocks)])) {
      const spent = (opening[id] ?? 0) - (stocks[id] ?? 0);
      if (spent !== 0) kept[id] = Math.max(0, (kept[id] ?? 0) - spent);
    }
    return {
      ...next,
      sectors:
        current === undefined
          ? next.sectors
          : { ...next.sectors, [HOUSEHOLDS]: { ...current, stocks: kept } },
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
    // *activity*, and the tally never falls.
    const experience: Record<ActivityId, number> = { ...state.experience };
    for (const run of result.runs) {
      if (run.output <= 0) continue;
      const activity = index.process.get(run.process)?.activity;
      if (activity === undefined) continue;
      experience[activity] = (experience[activity] ?? 0) + run.output;
    }

    return {
      ...state,
      sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, stocks } },
      leadProcess: result.leadProcess,
      lastCoverage: Object.fromEntries(result.tiers.map((t) => [t.tier, t.coverage])),
      lastEffort: result.effortPerStock,
      lastLabor: {
        available: result.laborAvailable,
        toProduction: result.laborToProduction,
        toProjects: result.laborToProjects,
        unused: result.laborUnused,
      },
      lastLabourPerHead: labourPerHead(result, index, totalHeads(sector.cohorts)),
      lastUtilisation: utilisationOf(result),
      experience,
    };
  }
}

/** What each activity cost, per head — the strain a labour-saving technique eases. */
function labourPerHead(
  result: AllocationResult,
  index: ConfigIndex,
  heads: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (heads <= 0) return out;
  for (const run of result.runs) {
    const activity = index.process.get(run.process)?.activity;
    if (activity === undefined) continue;
    out[activity] = (out[activity] ?? 0) + run.labor / heads;
  }
  return out;
}

/** How hard each capacity was worked, in [0, 1] — the strain more country eases. */
function utilisationOf(result: AllocationResult): Record<CapacityId, number> {
  const out: Record<CapacityId, number> = {};
  for (const [id, total] of Object.entries(result.capacityTotal)) {
    out[id] = total > 0 ? Math.min(1, (result.capacityUsed[id] ?? 0) / total) : 0;
  }
  return out;
}

// --------------------------------------------------------------- population

/**
 * Dying, growing up and being born, all three reckoned from the same standing
 * and applied together (E20).
 *
 * **Together** is the point. Worked one after another, the outcome would hang
 * on the order the transitions happen to stand in the content — somebody would
 * grow up and fall ill in the same tick, and nobody could see it from the
 * content. So everything below reads `sector.cohorts` and nothing reads what
 * the step before it wrote.
 *
 * Each of the three is a different shape, because each yields something
 * different. Dying is a factor per cohort, element by element, and gives the
 * vector back. Being born is a scalar product — how many — and a unit vector —
 * where they land. Growing up is a share moved from one entry to another.
 *
 * The base rates balance each other and nothing else: births run at 0.0833 per
 * grown head against a base survival of 0.97, so with a group six tenths grown
 * the two come out level once the tiers between them come to six tenths. Where
 * that is depends on which of them are covered:
 *
 * | covered | births | deaths | per tick |
 * |---|---|---|---|
 * | rank 100 alone | 0.6 × 0.0833 × 0.40 = 0.020 | 1 − 0.94 × 0.97 = 0.088 | **−6.8 %** |
 * | 100 and 200 | 0.020 | 0.030 | **−1.0 %** |
 * | everything | 0.6 × 0.0833 = 0.050 | 0.030 | **+2.0 %** |
 *
 * Fed but cold is a community that loses seven in a hundred a tick; fed and
 * warm and nothing above still loses one, because want of care and of comfort
 * holds the births down. Only a community that has everything grows.
 */
export class PopulationPhase implements Phase {
  readonly id = "population";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    const sector = state.sectors[HOUSEHOLDS];
    const allocation = ctx.allocation;
    if (sector === undefined || allocation === undefined) return state;

    const population = index.config.population;
    const before = sector.cohorts;

    // How hard each rank landed this tick. Births are one factor for everyone,
    // survival is a factor per cohort — the ranking says how much of it a
    // cohort takes, and a loss scaled by two takes twice as many.
    let birthFactor = 1;
    const survival: Record<string, number> = {};
    for (const cohort of population.cohorts) {
      survival[cohort.id] = population.baseSurvival[cohort.id] ?? 1;
    }
    for (const outcome of allocation.tiers) {
      const tier = index.tier.get(outcome.tier);
      if (tier === undefined) continue;
      birthFactor *= tierEffectAt(tier.birthRate, outcome.coverage);
      if (tier.survival === undefined) continue;
      const kept = tierEffectAt(tier.survival, outcome.coverage);
      for (const cohort of population.cohorts) {
        const sensitivity = tier.survival.per[cohort.id] ?? 1;
        survival[cohort.id] = (survival[cohort.id] ?? 1) * Math.max(0, 1 - sensitivity * (1 - kept));
      }
    }

    const born =
      population.baseBirthRate *
      birthFactor *
      backloadFactor(before, allocation, ctx.unlocks, index) *
      weighedHeads(before, population.birthWeight);

    const after: Record<string, number> = {};
    for (const cohort of population.cohorts) {
      after[cohort.id] = Math.max(0, (before[cohort.id] ?? 0) * (survival[cohort.id] ?? 1));
    }
    for (const move of population.transitions) {
      const moving = Math.max(0, (before[move.from] ?? 0) * move.perTick);
      after[move.from] = Math.max(0, (after[move.from] ?? 0) - moving);
      after[move.to] = (after[move.to] ?? 0) + moving;
    }
    after[population.birthsInto] = (after[population.birthsInto] ?? 0) + Math.max(0, born);

    const next: GameState = {
      ...state,
      sectors: { ...state.sectors, [HOUSEHOLDS]: { ...sector, cohorts: after } },
      lastBorn: Math.max(0, born),
      lastSurvival: survival,
    };

    // Below the minimum viable size the community is given up (E20), and that
    // is written down rather than left to be noticed: from the next tick on
    // nothing moves any more. Counted over the grown, because whether a
    // community can still recover hangs on them — they do the work and they
    // bear the children.
    return weighedHeads(after, population.viableWeight) < population.minimumViableSize
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
      productivity *= tierEffectAt(tier.productivity, outcome.coverage);
      workAbility *= tierEffectAt(tier.workAbility, outcome.coverage);
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

/**
 * What has come into view is written down, and never taken back (E12, E31).
 *
 * Last of all, so that it reads the tick that has just happened rather than the
 * one before it. A strain eases again — a range change, a poor draw passing —
 * and an offer that vanishes while the player is weighing it up punishes him
 * for thinking about it.
 */
export class OfferPhase implements Phase {
  readonly id = "offers";

  run(state: GameState, index: ConfigIndex, ctx: TickContext): GameState {
    const ctxFor: ConditionContext = {
      state,
      index,
      unlocks: ctx.unlocks,
      coverage: state.lastCoverage,
      population: totalHeads(state.sectors[HOUSEHOLDS]?.cohorts ?? {}),
      startReadings: ctx.startReadings,
    };
    let seen: Record<ProjectId, number> | undefined;
    for (const project of index.config.projects) {
      if (state.seenProjects[project.id] !== undefined) continue;
      if (!allHold(project.visibleWhen, ctxFor)) continue;
      seen ??= { ...state.seenProjects };
      seen[project.id] = state.tick;
    }
    // And the scouts come back: what stands on offer for the coming decision.
    // Drawn here, at the tick's end, so that the figure a decision is made
    // against is the one the move then gets.
    const { offer, random } = drawLandOffer(state.random, index.config);
    const next = seen === undefined ? state : { ...state, seenProjects: seen };
    return { ...next, landOffer: offer, random };
  }
}

export const PIPELINE: readonly Phase[] = [
  new ShockPhase(),
  new DecayPhase(),
  new RegrowthPhase(),

  new ProductionPhase(),
  new ProjectPhase(),
  new PopulationPhase(),
  new CarryPhase(),
  new OfferPhase(),
  // new MoneyPhase(),  ← later, one line, nothing above is touched
];
