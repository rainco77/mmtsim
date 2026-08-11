import { allocate, type AllocationResult } from "./allocation.ts";
import {
  type ConfigIndex,
  type Effect,
  type LevelSource,
  type QualitySource,
  tierEffectAt,
} from "./config.ts";
import type { CapacityId, ProjectId, StockId } from "./ids.ts";
import {
  backloadFactor,
  carriedPerArea,
  decayed,
  HOUSEHOLDS,
  regrown,
  renewals,
  type Renewal,
} from "./phases.ts";
import { nextRangeQuality } from "./effects.ts";
import { peek } from "./random.ts";
import {
  capacityOf,
  carryingArea,
  totalHeads,
  weighedHeads,
  type Capacity,
  type GameState,
} from "./state.ts";
import {
  allHold,
  computeUnlocks,
  unmetConditions,
  type ConditionContext,
  type Unlocks,
  type Unmet,
} from "./unlocks.ts";
import { startReadings } from "./outset.ts";
import type { OrderingReason } from "./ordering.ts";

/**
 * Everything derivable, as data (T4).
 *
 * Derived quantities are stored nowhere (E22) — without this function they
 * would be out of reach for anyone, the interface included. In particular the
 * binding input: allocation leaves only its results behind, so which input ran
 * out is gone afterwards.
 *
 * It describes the situation as it stands *and what the coming tick would make
 * of it*: the weather is peeked at, not drawn, so nothing advances.
 */
export interface Derived {
  readonly tick: number;

  readonly heads: number;
  /** The people by cohort (E20); `heads` is their sum. */
  readonly cohorts: Readonly<Record<string, number>>;
  /** The heads that supply labour, each weighted by how much (E20). */
  readonly workingHeads: number;
  readonly workAbility: number;
  readonly productivity: number;
  /** workingHeads × workAbility (E16). */
  readonly laborVolume: number;
  /** laborVolume × productivity — the quantity that is allocated (E16). */
  readonly laborPerformance: number;
  readonly laborToProjects: number;
  /** What the processes consumed. */
  readonly laborToProduction: number;
  readonly laborUnused: number;

  /** The peeked shock per stream — mean 1, below 1 is a bad draw (E24). */
  readonly shocks: Readonly<Record<string, number>>;
  /** Ordering per branch with the reason it holds, so a switch is never silent. */
  readonly ordering: readonly BranchOrdering[];

  readonly stocks: Readonly<Record<StockId, number>>;
  /**
   * Where every renewable stock stands (E29): held, what the range carries, and
   * what grows back this tick. Held against the ceiling says how thin it is;
   * growth against what is being taken says whether that will last.
   */
  readonly renewable: Readonly<Record<StockId, Renewal>>;
  readonly unownedCapacity: Readonly<Record<CapacityId, Capacity>>;
  readonly ownedCapacity: Readonly<Record<CapacityId, Capacity>>;
  /**
   * What each capacity offered this tick, whatever its source — held land as
   * well as the people, who are a capacity derived from the heads (E4). Only
   * the allocation sees all of them, so it reports them rather than having them
   * derived a second time somewhere else.
   */
  readonly capacityTotal: Readonly<Record<CapacityId, number>>;
  /** Occupied over available, per capacity — never above 1 (E5). */
  readonly utilization: Readonly<Record<CapacityId, number>>;
  /** Quality the next taking would bring (E13), shown before the click. */
  readonly nextTakingQuality: number;

  readonly coverage: Readonly<Record<string, number>>;
  readonly tiers: AllocationResult["tiers"];
  readonly runs: AllocationResult["runs"];
  readonly produced: Readonly<Record<StockId, number>>;
  /**
   * What lay in store when the tick began and what lies there when it ends, per
   * good. The difference is the one thing a reader needs in order to tell a
   * draw that was put by from one that was lived through — and since making and
   * keeping share one pot (E19), it is the only place that answer comes from.
   */
  /**
   * What taking each renewable stock costs this tick against fresh country —
   * one on untouched ground, higher the harder it is to find (E29). The single
   * measure of how spent the range is; a fill level cannot say it, because it
   * is read after the growing back.
   */
  readonly effortPerStock: Readonly<Record<StockId, number>>;
  readonly storeBefore: Readonly<Record<StockId, number>>;
  readonly storeAfter: Readonly<Record<StockId, number>>;

  /** How many are born this tick — a number of people, not a factor (E20). */
  readonly born: number;
  /** What survives the tick, per cohort; 1 means nobody dies of it (E20). */
  readonly survival: Readonly<Record<string, number>>;
  /** The community was given up and the run is over (E20). */
  readonly communityGivenUp: boolean;
  /** The tick it happened at; absent while it is still going. */
  readonly abandonedAt?: number;

  /**
   * There is deliberately **no tick-wide brake** here. Every rank draws on the
   * one pot, so a single figure for the whole tick belongs to some other rank
   * as often as not; what stopped a rank stands beside it in `tiers`, and the
   * claims that are not ranks of a good have the same answer in the state's own
   * record.
   */
  readonly projects: readonly ProjectView[];
  readonly branches: readonly string[];
  readonly processes: readonly string[];
  readonly rules: readonly string[];
}

/** Why this branch runs what it runs (E5) — data, never text (T6). */
export interface BranchOrdering {
  readonly branch: string;
  readonly reason: OrderingReason;
  readonly processes: readonly string[];
  readonly lead?: string;
}

export interface ProjectView {
  readonly id: ProjectId;
  readonly visible: boolean;
  readonly available: boolean;
  readonly running: boolean;
  readonly paused: boolean;
  readonly progress: number;
  readonly order?: number;
  readonly completed: number;
  /** How often it may be run at all; absent means without limit (E12). */
  readonly limit?: number;
  /** Named, not "locked" (E12). */
  readonly missing: readonly Unmet[];
  /**
   * What starting this would do, reckoned **against the state as it stands**.
   *
   * Data and not prose (T6): the shell turns it into sentences and translates
   * them. It used to be a list of engine words — `capacity:storage`,
   * `process:gathering_sickle` — out of which no interface could build a
   * statement that says anything, and a project whose worth cannot be read is
   * not a choice but a coin toss (E31).
   *
   * Quantities are given as *where you stand now* and *where you would stand*,
   * because that is the comparison the player has to make. A process is given
   * in its own absolute figures instead: the one it would replace is on the
   * screen anyway, and comparing two plain numbers is something a person does
   * better than a rule about which of them counts.
   */
  readonly consequences: readonly Consequence[];

  /**
   * What this project is worth against what is scarce **right now**: how much
   * less of a dear stock its new way of working needs, times what searching
   * that stock costs, times the mouths it would do it for. Nought for anything
   * that only saves labour lying idle anyway.
   *
   * The offers come sorted by it, and that is not a recommendation but a
   * default: a list has an order whether one is chosen or not, and leaving it
   * to the order things happen to stand in the content is how the opening came
   * to lead with the bow — a technique that presses the slowest stock in the
   * range and spares nothing. Beside it every project says *what* it relieves,
   * so a player can take the top or look and disagree, which is what the
   * genre's build-up games do: the default carries the beginner, the knowing
   * one departs from it.
   *
   * Reckoned here and nowhere else. Worked out twice it goes blind twice.
   */
  readonly worth: number;
}

export function derive(state: GameState, index: ConfigIndex): Derived {
  const unlocks = computeUnlocks(state, index);
  const sector = state.sectors[HOUSEHOLDS];
  const cohorts = sector?.cohorts ?? {};
  const heads = totalHeads(cohorts);
  const workingHeads = weighedHeads(cohorts, index.config.population.labourWeight);
  const workAbility = sector?.workAbility ?? 0;
  const productivity = sector?.productivity ?? 0;

  // Peeked, not drawn: describing the situation must not advance anything.
  const shocks: Record<string, number> = {};
  for (const [stream, shape] of Object.entries(index.config.shocks)) {
    const scale = (shape.exponent + 1) / shape.exponent;
    shocks[stream] = Math.pow(peek(state.random, stream), 1 / shape.exponent) * scale;
  }

  // The allocation reckons on what the coming tick will actually have: decay is
  // its first step (E19), and `derive` is asked before it has run. The view
  // below keeps reporting the raw holdings — those are the fact — but planning
  // on them would hand the economy inputs the tick never sees.
  const afterDecay = regrown(decayed(state, index, unlocks), index);

  const allocation = allocate({
    state: afterDecay,
    index,
    sectorId: HOUSEHOLDS,
    shocks,
    tierPerHead: unlocks.tierPerHead,
    unlockedBranches: unlocks.branches,
    unlockedProcesses: unlocks.processes,
  });

  const coverage: Record<string, number> = {};
  for (const outcome of allocation.tiers) coverage[outcome.tier] = outcome.coverage;

  // The same reckoning the population phase does, so what is shown is what
  // will happen (E20): one factor on the births, one on the survival of each
  // cohort.
  let birthFactor = 1;
  const survival: Record<string, number> = {};
  for (const cohort of index.config.population.cohorts) {
    survival[cohort.id] = index.config.population.baseSurvival[cohort.id] ?? 1;
  }
  for (const outcome of allocation.tiers) {
    const tier = index.tier.get(outcome.tier);
    if (tier === undefined) continue;
    birthFactor *= tierEffectAt(tier.birthRate, outcome.coverage);
    if (tier.survival === undefined) continue;
    const kept = tierEffectAt(tier.survival, outcome.coverage);
    for (const cohort of index.config.population.cohorts) {
      const sensitivity = tier.survival.per[cohort.id] ?? 1;
      survival[cohort.id] =
        (survival[cohort.id] ?? 1) * Math.max(0, 1 - sensitivity * (1 - kept));
    }
  }
  const born =
    index.config.population.baseBirthRate *
    birthFactor *
    backloadFactor(cohorts, allocation, unlocks, index) *
    weighedHeads(cohorts, index.config.population.birthWeight);

  const utilization: Record<CapacityId, number> = {};
  for (const type of index.config.capacities) {
    const total = allocation.capacityTotal[type.id] ?? 0;
    utilization[type.id] =
      total > 0 ? (allocation.capacityUsed[type.id] ?? 0) / total : 0;
  }

  const ctx: ConditionContext = {
    state,
    index,
    unlocks,
    coverage,
    population: heads,
    startReadings: startReadings(index),
  };

  /**
   * What a project would save of whatever is scarce — and labour is an input
   * like any other (E4), so it counts here too.
   *
   * A stock's scarcity is what searching it costs; labour's is how little of it
   * lies idle. That is the whole of it, and it settles by itself a thing that
   * would otherwise want a rule: the sickle, which only makes hands quicker, is
   * worth almost nothing while a third of them are unused and becomes worth a
   * great deal once they bind. The mortar, needing less country to the meal, is
   * the other way about. Neither had to be told when its turn is.
   */
  const idleShare =
    allocation.laborAvailable > 0
      ? allocation.laborUnused / allocation.laborAvailable
      : 1;
  const laborScarcity = Math.max(0, Math.min(1, 1 - idleShare));

  /**
   * What the country now on offer is worth (E13, E25): a step below the land
   * the community lives on — its kinds weighted by area — times this tick's
   * report. Which kinds count as land is what the content starts heads with.
   */
  const offeredQuality = (() => {
    let area = 0;
    let weighted = 0;
    for (const kind of Object.keys(index.config.land.perHeadAtStart)) {
      const owned = capacityOf(sector?.capacityHeld ?? {}, kind);
      const unowned = capacityOf(state.unownedCapacity, kind);
      area += owned.amount + unowned.amount;
      weighted += owned.amount * owned.quality + unowned.amount * unowned.quality;
    }
    const current = area > 0 ? weighted / area : index.config.land.baseQuality;
    return current * (1 - index.config.land.qualityDecayPerTaking) * state.landOffer;
  })();

  /** Quality of one kind of ground, over what is held and what is not. */
  const groundQuality = (capacity: CapacityId): number => {
    const owned = capacityOf(sector?.capacityHeld ?? {}, capacity);
    const unowned = capacityOf(state.unownedCapacity, capacity);
    const total = owned.amount + unowned.amount;
    return total > 0
      ? (owned.amount * owned.quality + unowned.amount * unowned.quality) / total
      : 1;
  };

  /**
   * What moving on is worth: the extra searching the worn range is costing right
   * now, for every stock a move would put back to what the ground can carry.
   *
   * Divided by how long a fresh range stays fresh, or it cannot be held against
   * a technique at all — a technique pays for the rest of the epoch, a move only
   * until the range is worn again. Undivided it dwarfs everything else on the
   * list from the moment the range begins to thin.
   *
   * And scaled by what is on offer against what is held: a report of better
   * country makes moving worth more, a poorer one less. Measured against the
   * ground under one's feet and not against a fixed figure, because the mean
   * falls with every taking anyway and only the comparison says anything.
   */
  const worthOfMoving = (def: { readonly effects: readonly Effect[] }): number => {
    let excess = 0;
    let quality = 0;
    let counted = 0;
    let refills = false;
    for (const effect of def.effects) {
      if (effect.type !== "stock" || effect.to.kind !== "ceiling") continue;
      refills = true;
      const price = allocation.effortPerStock[effect.id];
      const taken = allocation.consumed[effect.id] ?? 0;
      if (price !== undefined && price > 1 && taken > 0) excess += (price - 1) * taken;
      const ground = index.stock.get(effect.id)?.regrowth?.capacity;
      if (ground !== undefined) {
        quality += groundQuality(ground);
        counted += 1;
      }
    }
    if (!refills) return 0;
    const standing = counted > 0 ? quality / counted : 1;
    const lasts = Math.max(1, index.config.land.freshRangeLasts);
    return (excess / lasts) * (standing > 0 ? offeredQuality / standing : 1);
  };

  const worthOf = (def: { readonly effects: readonly Effect[] }): number => {
    let total = 0;
    for (const effect of def.effects) {
      if (effect.type !== "process") continue;
      const opened = index.process.get(effect.id);
      if (opened === undefined) continue;
      for (const [stockId, per] of Object.entries(opened.intermediatesPerOutput)) {
        // A stock's price is what searching it costs; labour's is how tightly
        // it binds. Anything else — a good made by another process — is left
        // out: its scarcity shows up in the price of what *it* is made from.
        const price =
          stockId === "labor" ? laborScarcity : allocation.effortPerStock[stockId];
        if (price === undefined || price <= 0 || per <= 0) continue;
        let best = Infinity;
        for (const other of index.config.processes) {
          if (other.branch !== opened.branch || !unlocks.processes.has(other.id))
            continue;
          const theirs = other.intermediatesPerOutput[stockId] ?? 0;
          if (theirs > 0) best = Math.min(best, theirs);
        }
        if (Number.isFinite(best) && per < best) total += (best - per) * price * heads;
      }
    }
    return total + worthOfMoving(def);
  };

  const projects: ProjectView[] = index.config.projects.map((def) => {
    const active = state.activeProjects.find((p) => p.id === def.id);
    const done = state.completedProjects[def.id] ?? 0;
    // A finished one-off project is not available any more, and neither is one
    // already under way. Otherwise a strategy would keep reaching for it.
    const startable =
      active === undefined && (def.limit === undefined || done < def.limit);
    // **What the content demands is the whole of it.** A ceiling on how many
    // may stand open at once is gone: where several needs are short, several
    // answers have to be there. What keeps the opening from being a wall of
    // buttons is that little is affordable yet — the hands, not a shortlist.
    //
    // The worth below still orders the list, because a list has an order
    // whether one is chosen or not, and the order should at least roughly fit.
    // It decides nothing: it used to hide the way out of the epoch, since the
    // pit, the boat, the needle and the range change spare no process and were
    // therefore worth nothing.
    // Once shown, always shown — the phase wrote down when it first was, and
    // that cannot come undone. And nothing is startable that is not on the
    // screen: availability is the second gate, not a separate door.
    const visible =
      state.seenProjects[def.id] !== undefined || allHold(def.visibleWhen, ctx);
    return {
      id: def.id,
      visible,
      available: visible && startable && allHold(def.availableWhen, ctx),
      running: active !== undefined,
      paused: active?.paused ?? false,
      progress: active?.progress ?? 0,
      ...(active === undefined ? {} : { order: active.order }),
      completed: state.completedProjects[def.id] ?? 0,
      ...(def.limit === undefined ? {} : { limit: def.limit }),
      missing: unmetConditions(def.availableWhen, ctx),
      consequences: consequencesOf(def, state, index, unlocks),
      worth: worthOf(def),
    };
  });

  return {
    tick: state.tick,
    heads,
    cohorts,
    workingHeads,
    workAbility,
    productivity,
    laborVolume: workingHeads * workAbility,
    laborPerformance: allocation.laborAvailable,
    laborToProjects: allocation.laborToProjects,
    laborToProduction: allocation.laborToProduction,
    laborUnused: allocation.laborUnused,
    shocks,
    ordering: [...Object.entries(allocation.orderingReason)].map(([branch, reason]) => {
      const lead = allocation.leadProcess[branch];
      return {
        branch,
        reason,
        processes: allocation.runs
          .filter((run) => index.process.get(run.process)?.branch === branch)
          .map((run) => run.process),
        ...(lead === undefined ? {} : { lead }),
      };
    }),
    stocks: sector?.stocks ?? {},
    unownedCapacity: state.unownedCapacity,
    ownedCapacity: sector?.capacityHeld ?? {},
    capacityTotal: allocation.capacityTotal,
    utilization,
    renewable: renewals(afterDecay, index),
    nextTakingQuality: offeredQuality,
    coverage,
    tiers: allocation.tiers,
    runs: allocation.runs,
    produced: allocation.produced,
    storeBefore: allocation.storeBefore,
    effortPerStock: allocation.effortPerStock,
    storeAfter: allocation.storeAfter,
    born,
    survival,
    communityGivenUp: state.abandonedAt !== undefined,
    ...(state.abandonedAt === undefined ? {} : { abandonedAt: state.abandonedAt }),
    // Sorted by what each is worth against what is scarce now, the declared
    // order breaking ties. A list has an order whether one is chosen or not.
    projects: [...projects].sort((a, b) => b.worth - a.worth),
    branches: [...unlocks.branches],
    processes: [...unlocks.processes],
    rules: [...unlocks.rules],
  };
}

/** One consequence of starting a project, in numbers (T6). */
export type Consequence =
  | {
      readonly kind: "capacity";
      readonly capacity: CapacityId;
      readonly from: number;
      readonly to: number;
    }
  | {
      readonly kind: "stock";
      readonly stock: StockId;
      readonly from: number;
      readonly to: number;
    }
  | {
      readonly kind: "quality";
      readonly capacity: CapacityId;
      readonly from: number;
      readonly to: number;
    }
  /** What one head needs of a good, before and after (E9). */
  | {
      readonly kind: "need";
      readonly tier: string;
      readonly from: number;
      readonly to: number;
    }
  /** A way of producing that would open, in its own figures. */
  | {
      readonly kind: "process";
      readonly process: string;
      readonly produces: StockId;
      readonly capacityPerOutput: Readonly<Record<CapacityId, number>>;
      readonly intermediatesPerOutput: Readonly<Record<StockId, number>>;
      readonly exposure: Readonly<Record<string, number>>;
    }
  | { readonly kind: "branch"; readonly branch: string }
  | { readonly kind: "rule"; readonly rule: string; readonly set: boolean };

function consequencesOf(
  def: { readonly effects: readonly Effect[] },
  state: GameState,
  index: ConfigIndex,
  unlocks: Unlocks,
): readonly Consequence[] {
  const out: Consequence[] = [];
  const sector = state.sectors[HOUSEHOLDS];
  for (const effect of def.effects) {
    switch (effect.type) {
      case "capacity": {
        const owned = capacityOf(sector?.capacityHeld ?? {}, effect.capacity);
        const unowned = capacityOf(state.unownedCapacity, effect.capacity);
        const from = effect.sector === undefined ? unowned.amount : owned.amount;
        out.push({
          kind: "capacity",
          capacity: effect.capacity,
          from,
          to: Math.max(0, from + effect.amount),
        });
        if (effect.quality !== undefined) {
          const now = effect.sector === undefined ? unowned.quality : owned.quality;
          out.push({
            kind: "quality",
            capacity: effect.capacity,
            from: now,
            to: qualityOf(effect.quality, state, index, now, effect.capacity),
          });
        }
        break;
      }
      case "tier": {
        const tier = index.tier.get(effect.id);
        out.push({
          kind: "need",
          tier: effect.id,
          from: unlocks.tierPerHead.get(effect.id) ?? tier?.perHead ?? 0,
          to: effect.perHead,
        });
        break;
      }
      case "process": {
        const process = index.process.get(effect.id);
        if (process === undefined) break;
        out.push({
          kind: "process",
          process: process.id,
          produces: index.branch.get(process.branch)?.produces ?? "",
          capacityPerOutput: process.capacityPerOutput,
          intermediatesPerOutput: process.intermediatesPerOutput,
          exposure: process.exposure,
        });
        break;
      }
      case "stock": {
        const from = sector?.stocks[effect.id] ?? 0;
        out.push({
          kind: "stock",
          stock: effect.id,
          from,
          to: levelOf(effect.to, state, index, effect.id),
        });
        break;
      }
      case "setCapacity": {
        const held =
          effect.sector === undefined
            ? capacityOf(state.unownedCapacity, effect.capacity)
            : capacityOf(sector?.capacityHeld ?? {}, effect.capacity);
        if (effect.to !== undefined) {
          out.push({
            kind: "capacity",
            capacity: effect.capacity,
            from: held.amount,
            to: levelOf(effect.to, state, index, ""),
          });
        }
        if (effect.quality !== undefined) {
          out.push({
            kind: "quality",
            capacity: effect.capacity,
            from: held.quality,
            to: qualityOf(effect.quality, state, index, held.quality, effect.capacity),
          });
        }
        break;
      }
      case "takings":
        break;
      case "branch":
        out.push({ kind: "branch", branch: effect.id });
        break;
      case "rule":
        out.push({ kind: "rule", rule: effect.id, set: effect.set });
        break;
    }
  }
  return out;
}

/** What a level source comes to (T3), as a number. */
function levelOf(
  source: LevelSource,
  state: GameState,
  index: ConfigIndex,
  stockId: StockId,
): number {
  if (source.kind === "fixed") return source.value;
  const rule = index.stock.get(stockId)?.regrowth;
  if (rule === undefined) return 0;
  let area = carryingArea(capacityOf(state.unownedCapacity, rule.capacity));
  for (const holder of Object.values(state.sectors)) {
    area += carryingArea(capacityOf(holder.capacityHeld, rule.capacity));
  }
  return area * carriedPerArea(state, rule.densityPerArea, stockId);
}

/** Where the quality of added area would come from (E13), as a number. */
function qualityOf(
  source: QualitySource,
  state: GameState,
  index: ConfigIndex,
  fallback: number,
  capacity: CapacityId,
): number {
  switch (source.kind) {
    case "fixed":
      return source.value;
    case "from":
      return capacityOf(state.sectors[HOUSEHOLDS]?.capacityHeld ?? {}, source.capacity)
        .amount > 0
        ? capacityOf(state.sectors[HOUSEHOLDS]?.capacityHeld ?? {}, source.capacity)
            .quality
        : capacityOf(state.unownedCapacity, source.capacity).quality;
    case "nextTaking":
      return nextRangeQuality(state, index.config, capacity);
    default:
      return fallback;
  }
}
