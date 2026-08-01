import type {
  CapacityId,
  BranchId,
  NeedTierId,
  ProcessId,
  ProjectId,
  RandomStreamId,
  RuleId,
  SectorId,
  StockId,
} from "./ids.ts";

/**
 * Content is data; the engine interprets it (T3).
 *
 * Nothing in here is a function. A curve is described by a named shape and its
 * parameters, never by code — otherwise balancing would be programming again.
 */

// ---------------------------------------------------------------- stocks

export interface StockDef {
  readonly id: StockId;
  /**
   * Geometric decay: the same share is lost every tick (E19). Zero is allowed
   * and means "keeps forever"; one means "not storable at all".
   */
  readonly decayPerTick: number;
  /**
   * A rule may replace the rate (E23: rules are switches the phases read).
   * That is how food becomes storable with sedentism without a fifth effect
   * type. The first matching active rule wins.
   */
  /**
   * A capacity that protects this stock (E19): a store is not a container with
   * a maximum but capacity that lowers the decay of the amount it covers.
   * There is never a "store full" — what is held beyond it simply spoils at the
   * ordinary rate, so the limit is economic and not arbitrary.
   */
  readonly protectedBy?: {
    readonly capacity: CapacityId;
    readonly decayPerTick: number;
    /** A rule may improve the sheltered rate, as it may the ordinary one. */
    readonly decayWhenRule?: readonly {
      readonly rule: RuleId;
      readonly decayPerTick: number;
    }[];
  };
  readonly decayWhenRule?: readonly {
    readonly rule: RuleId;
    readonly decayPerTick: number;
  }[];
}

// ---------------------------------------------------------------- capacityHeld

export interface CapacityDef {
  readonly id: CapacityId;
  /**
   * Capacity decays too (E19). Land does not — it is not worn out by use — but
   * a storage pit collapses and a mill wears down, and E19 has no separate
   * upkeep: keeping a capacity means building it again.
   */
  readonly decayPerTick?: number;
  /**
   * A capacity supplied by the population itself: available equals the heads,
   * and its quality is work ability times productivity. That is how labour
   * becomes an ordinary input — a stock made by a process out of a capacity,
   * like wood is made out of forest.
   */
  readonly fromPopulation?: boolean;
}

// ---------------------------------------------------------------- branches

/** A branch is where something is produced. */
export interface BranchDef {
  readonly id: BranchId;
  readonly produces: StockId;
  /** Available from the start, or unlocked by a project effect (E12). */
  readonly unlockedFromStart: boolean;
}

// ---------------------------------------------------------------- processes

/**
 * A way of producing (E5). Processes carry an explicit priority: the engine
 * never judges which one is "better". Without that, irrigation — same or lower
 * yield, much lower weather sensitivity — would never run although the canals
 * stand.
 */
export interface ProcessDef {
  readonly id: ProcessId;
  readonly branch: BranchId;

  /**
   * Fallback ordering only (E5): used in the very first tick, when nothing has
   * bound yet, and whenever scarcity gives no answer. Higher runs first; ties
   * are forbidden and are checked by a test.
   */
  readonly priority: number;

  /** Capacity occupied per unit of output, by type. Occupied, not consumed (E4). */
  readonly capacityPerOutput: Readonly<Record<CapacityId, number>>;

  /**
   * Stocks used up per unit of output (E4). Labour is one of them: it is a
   * stock that decays completely each tick, so it cannot be stored, and it has
   * no privileged place in any decision.
   */
  readonly intermediatesPerOutput: Readonly<Record<StockId, number>>;

  /**
   * Exposure per named random stream (E24, E25) — risk is not only weather.
   * Belongs to the process, not to the branch: irrigated and dry fields are the
   * same branch with very different exposure.
   */
  readonly exposure: Readonly<Record<RandomStreamId, number>>;

  /** How strongly land quality enters the yield (E13). Housing does not care. */
  readonly qualityWeight: number;

  readonly unlockedFromStart: boolean;
}

// ---------------------------------------------------------------- needs

/**
 * How strongly a need tier moves a quantity. Interpolated linearly between no
 * coverage and full coverage — the non-linearity that famine mortality needs
 * already sits in the ranking itself (E20).
 */
export interface TierEffect {
  readonly atZero: number;
  readonly atFull: number;
}

/**
 * A need tier (E9). Tiers belong to a branch but are ordered globally by an
 * absolute rank number, so the order in which the player unlocks branches does
 * not matter. Gaps are deliberate.
 */
export interface NeedTierDef {
  readonly id: NeedTierId;

  /**
   * How strongly this need moves with a random stream (E24) — the demand side
   * of a shock. A cold year yields less firewood *and* calls for more of it, so
   * hardship compounds instead of adding up.
   *
   * The direction is the opposite of a process's: there a bad draw lowers the
   * output, here it raises what is needed per head.
   */
  readonly exposure?: Readonly<Record<RandomStreamId, number>>;
  readonly rank: number;
  readonly stock: StockId;
  readonly branch: BranchId;
  readonly perHead: number;

  /**
   * Share of the served amount that is used up in use.
   *
   * Bread is eaten, a roof is lived under. **Consumption hangs on the heads,
   * decay on the stock** — two different things, and E19's decay covers only
   * the second one. Food is 1, housing 0.
   *
   * This is a property of the *need relation*, not of the branch: E3 rightly
   * says a house is slow decay, but the flow through a stock cannot be got at
   * through the decay rate, because that scales with the store and not with
   * the people.
   */
  readonly consumedOnUse: number;

  readonly birthRate?: TierEffect;
  readonly deathRate?: TierEffect;
  readonly productivity?: TierEffect;
  readonly workAbility?: TierEffect;
}

// ---------------------------------------------------------------- projects

export type Condition =
  | { readonly kind: "population"; readonly min: number }
  | { readonly kind: "projectDone"; readonly id: ProjectId; readonly min: number }
  | { readonly kind: "rule"; readonly id: RuleId; readonly set: boolean }
  | { readonly kind: "unownedCapacity"; readonly capacity: CapacityId; readonly min: number }
  /** Capacity the sector holds — the mirror of `unownedCapacity`. */
  | { readonly kind: "ownedCapacity"; readonly capacity: CapacityId; readonly min: number }
  | { readonly kind: "coverage"; readonly tier: NeedTierId; readonly min: number }
  /**
   * A stock actually held, measured per head so it scales with the settlement.
   * Holding a store is what makes staying possible (Testart) — and it cannot be
   * waited for: it needs the capacity to keep it and the output to spare.
   */
  | { readonly kind: "stockPerHead"; readonly stock: StockId; readonly min: number }
  /**
   * Capacity built, per head. Unlike a stock it does not move with the weather,
   * so a run of bad years delays a transition but can never block it — and it
   * is exactly what the player decided, not what luck left in the store.
   */
  | {
      readonly kind: "capacityPerHead";
      readonly capacity: CapacityId;
      readonly min: number;
    };

/**
 * Where the quality of added area comes from — declarative, never a function
 * (T3). `from` inherits the average of another type, which is what clearing
 * does; `nextTaking` uses the falling marginal quality from E13 and advances
 * the count of takings.
 */
export type QualitySource =
  | { readonly kind: "fixed"; readonly value: number }
  | { readonly kind: "from"; readonly capacity: CapacityId }
  | { readonly kind: "nextTaking" };

/** The four effect types from E12. Amounts may be negative. */
export type Effect =
  | {
      readonly type: "capacity";
      readonly capacity: CapacityId;
      /** Omitted means unowned land (E13). */
      readonly sector?: SectorId;
      readonly amount: number;
      /** Quality of the added area; omitted keeps the existing average. */
      readonly quality?: QualitySource;
    }
  | { readonly type: "process"; readonly id: ProcessId }
  | { readonly type: "branch"; readonly id: BranchId }
  | { readonly type: "rule"; readonly id: RuleId; readonly set: boolean }
  /**
   * Changes what one unit of a need costs per head (E9). Grinding stones do not
   * grow more grain — they get more out of the same grain, so they act on the
   * consumption side, which no process can reach.
   */
  | { readonly type: "tier"; readonly id: NeedTierId; readonly perHead: number };

export interface ProjectDef {
  readonly id: ProjectId;

  /** Appears greyed out, with its name (E12). */
  readonly visibleWhen: readonly Condition[];
  /** Can be started. */
  readonly availableWhen: readonly Condition[];

  /** Where its claim stands unless the player says otherwise (E9, E18). */
  readonly defaultRank: number;

  /** Labour performance in total, spread evenly over the minimum duration. */
  readonly laborCost: number;
  /** Stocks in total, likewise spread evenly (E18). */
  readonly stockCost: Readonly<Record<StockId, number>>;

  /**
   * Never faster than this, however many hands are thrown at it — this is the
   * inertia from E3. Longer is possible when an input is missing (E18).
   */
  readonly minTicks: number;

  /**
   * How often it may be run at all. Omitted means without limit.
   *
   * One field rather than a flag plus a hidden condition: "once" and "as often
   * as you like" and "six times" are the same statement at different values.
   * The cap on taking land used to be an availability condition, which said a
   * spent allowance was a missing prerequisite — but nothing is missing, there
   * is simply nothing left. How often something may be done, how far a running
   * one has got, and what it takes to start are three different things (E12).
   */
  readonly limit?: number;

  readonly effects: readonly Effect[];

  /** Which sector carries and receives it. One sector until property exists. */
  readonly sector: SectorId;
}

// ---------------------------------------------------------------- population

export interface PopulationConfig {
  /**
   * Base rates per tick. Equal by construction: with rank 100 fully covered and
   * nothing above it, births equal deaths and the population stands (E20).
   */
  readonly baseBirthRate: number;
  readonly baseDeathRate: number;

  /**
   * Below this the settlement is given up and the run ends (E20). Not a
   * concession to playability: a community under a certain size is not viable.
   */
  readonly minimumViableSize: number;
}

// ---------------------------------------------------------------- weather

/**
 * The shape of one random stream (E24): mean 1, an upper bound, rare severe
 * failures downwards. Harvests have a biological ceiling but no counterpart
 * below, so a bad year is the left edge of this distribution and needs no
 * second mechanism.
 */
export interface ShockShape {
  readonly shape: "powerLeftSkewed";
  readonly exponent: number;
}

/**
 * How strongly a thin buffer pushes towards the reliable process (E5).
 *
 * Not a taste but a consequence of E24: undercovering rank 100 raises the death
 * rate while overcovering brings nothing back, so at the same mean more spread
 * is strictly worse — and the closer to the edge, the more so. Peasants chose
 * the hardy, lower-yielding variety without any politics.
 */
export interface RiskConfig {
  /** 0 switches the risk term off entirely. */
  readonly aversion: number;
  /**
   * How cautiously the plan reckons with a year it cannot know (E24).
   *
   * The plan is blind, so it aims at a year slightly **worse** than the mean —
   * and in an ordinary year it therefore produces a little more than is needed.
   * That surplus is what a store is for, and it is what a project finds waiting
   * when it wants an intermediate nobody has yet asked for.
   *
   * Scaled by each process's own exposure, so it costs nothing where nothing
   * varies: a fire lit indoors needs no margin, a harvest does. One number for
   * the whole economy rather than one per branch — it is a temperament, not a
   * technical datum. Later, when there are firms, this is where the sales
   * forecast sits, and then it may well differ between them.
   *
   * 0 plans on the mean exactly.
   */
  readonly caution: number;
}

// ---------------------------------------------------------------- land

export interface LandConfig {
  /** Quality of the very first territory. */
  readonly baseQuality: number;
  /** Each taking yields land this much worse than the previous one (E13). */
  readonly qualityDecayPerTaking: number;
}

// ---------------------------------------------------------------- carried

export interface CarriedConfig {
  readonly baseProductivity: number;
  readonly baseWorkAbility: number;
  /**
   * How fast the carried factors follow coverage. One means immediately from
   * the previous tick, smaller values smooth over several ticks.
   */
  readonly adjustmentPerTick: number;
}

// ---------------------------------------------------------------- whole

export interface Config {
  readonly stocks: readonly StockDef[];
  readonly capacities: readonly CapacityDef[];
  readonly branches: readonly BranchDef[];
  readonly processes: readonly ProcessDef[];
  readonly needTiers: readonly NeedTierDef[];
  readonly projects: readonly ProjectDef[];
  readonly population: PopulationConfig;
  /** Shape per random stream (E25); streams nobody is exposed to are unused. */
  readonly shocks: Readonly<Record<RandomStreamId, ShockShape>>;
  readonly risk: RiskConfig;
  /** Rules that hold before any project has been finished (E23). */
  readonly rulesFromStart: readonly RuleId[];
  readonly land: LandConfig;
  readonly carried: CarriedConfig;
}

// ---------------------------------------------------------------- lookups

/**
 * Indexed access to the content. Built once per run; holds nothing that
 * changes, so it is not state.
 */
export interface ConfigIndex {
  readonly config: Config;
  readonly stock: ReadonlyMap<StockId, StockDef>;
  readonly branch: ReadonlyMap<BranchId, BranchDef>;
  readonly process: ReadonlyMap<ProcessId, ProcessDef>;
  readonly project: ReadonlyMap<ProjectId, ProjectDef>;
  readonly tier: ReadonlyMap<NeedTierId, NeedTierDef>;
  /** Need tiers sorted by rank, lowest first (E9). */
  readonly tiersByRank: readonly NeedTierDef[];
  /** Processes of a branch sorted by priority, highest first (E5). */
  readonly processesOfBranch: ReadonlyMap<BranchId, readonly ProcessDef[]>;
}

export function indexConfig(config: Config): ConfigIndex {
  const processesOfBranch = new Map<BranchId, ProcessDef[]>();
  for (const process of config.processes) {
    const list = processesOfBranch.get(process.branch) ?? [];
    list.push(process);
    processesOfBranch.set(process.branch, list);
  }
  for (const list of processesOfBranch.values()) {
    list.sort((a, b) => b.priority - a.priority);
  }

  return {
    config,
    stock: new Map(config.stocks.map((s) => [s.id, s])),
    branch: new Map(config.branches.map((b) => [b.id, b])),
    process: new Map(config.processes.map((p) => [p.id, p])),
    project: new Map(config.projects.map((p) => [p.id, p])),
    tier: new Map(config.needTiers.map((t) => [t.id, t])),
    tiersByRank: [...config.needTiers].sort((a, b) => a.rank - b.rank),
    processesOfBranch,
  };
}

/** Linear interpolation of a tier effect by coverage (E20). */
export function tierEffectAt(effect: TierEffect | undefined, coverage: number): number {
  if (effect === undefined) return 0;
  return effect.atZero + (effect.atFull - effect.atZero) * coverage;
}
