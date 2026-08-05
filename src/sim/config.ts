import type {
  ActivityId,
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
    /**
     * Where putting something by stands in the ranking (E9).
     *
     * Behind every need is where it used to stand, and a community at the
     * carrying capacity of its range then never saves anything at all: what is
     * left over after everyone has eaten their fill is nothing, and where there
     * *is* something left it turns into people rather than into stores, because
     * satiety drives births. Seven pits over a hundred and sixty ticks held
     * nothing.
     *
     * Put ahead of comfort instead, laying something by costs what it really
     * costs — **eating less well now**, and fewer children for it. That is the
     * bargain storing actually is, and it makes the store a decision with a
     * price rather than a remainder. It belongs to the good and not to the
     * engine: another epoch may want its stores kept differently.
     */
    readonly rank: number;
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

  /**
   * This good can be laid by without any building — a woodpile needs no shed —
   * so the player may say how much of it to hold, and this is where that claim
   * stands in the ranking (E9).
   *
   * Only for goods that keep on their own. Food spoils at nine tenths a tick:
   * a standing order to hold three ticks of it would command work whose fruit
   * is gone by the next one, so there the pit is not an improvement on saying
   * how much to keep — it is the only way to keep anything at all. That
   * asymmetry is the lesson of the epoch and not a gap in it.
   */
  readonly keeping?: { readonly rank: number };

  /**
   * A stock that **grows back** instead of falling apart (E29).
   *
   * Nothing a forager takes is an area. A hectare of forest is not used up by
   * hunting over it, or by gathering on it, or by picking up the deadwood that
   * lies on it — all three happen on the same ground at once. What is used up
   * is the deer, the growth and the wood, and each of those is taken and comes
   * back. Two things tell the kinds apart, and both matter:
   *
   * - **Exclusive or side by side.** An area, once occupied, is occupied
   *   against everybody: whoever takes it takes it from all the rest. A stock
   *   is only taken from those who draw the *same* stock. Getting that wrong is
   *   what once left a community freezing and naked — food ranks first, so it took
   *   the whole range, and no tick ever produced wood, bast or hides.
   * - **Memory.** An area is unchanged next tick however hard it was worked;
   *   what is missing from a stock stays missing, grows back out of the rest,
   *   and costs more per unit the thinner it gets. So a stock can be overtaxed
   *   and an area cannot.
   *
   * An area is therefore *not* the limiting case of a fast-growing stock. At
   * rate 1 a stock taken in half comes back to three quarters, not to full: it
   * would take a rate of K/stock, rising without bound as the stock thins.
   *
   * Mechanically it is decay with the sign reversed and a ceiling — the
   * logistic curve, the standard model of a renewable resource:
   *
   *     ceiling  K = area of `capacity` × quality × `densityPerArea`
   *     growth     = `ratePerTick` × (stock + `refuge`) × (1 − stock / K)
   *
   * Quality sits in the ceiling because that is where land quality can still be
   * felt once nothing pays for ground: poorer country carries less (E13).
   *
   * `refuge` is what keeps E20 — no state without a way back. At a stock of
   * nought the growth term would be nought as well, and a range hunted empty
   * could never recover. There are always corners nothing reaches, and animals
   * come back out of them; slowly, but they come.
   */
  readonly regrowth?: {
    readonly ratePerTick: number;
    readonly capacity: CapacityId;
    readonly densityPerArea: number;
    readonly refuge: number;
    /**
     * How much dearer taking becomes when the stock is thin — the effort per
     * unit caught, at most.
     *
     * A fish is a fish: a thin lake does not want *more* fish per meal, it
     * wants **more work** for each one. Effort per catch runs inverse to what
     * is left — `catch = q · effort · stock`, the standard bioeconomic form
     * (Gordon and Schaefer), and the same statement optimal foraging makes as
     * a falling encounter rate.
     *
     * Without it, a stock in hand looks free to the plan and is taken to
     * nothing whenever that is the cheapest way — measured, the fishery went
     * from full to dead in nineteen ticks and no brake anywhere reached it in
     * time. With it, taking grows dear before the last one is gone, which is
     * what really saves a stock. The cap keeps a spent range from being
     * infinitely dear, so there is always a way back (E20).
     */
    readonly maxEffort: number;
  };
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

  /**
   * Whether the draw is known while the work is being done (E24).
   *
   * **"found"** — the return shows itself as one goes. A gatherer sees whether
   * the bushes bear and keeps looking while there is not enough; a hunter sees
   * whether the herd is there. The plan may therefore reckon with the draw that
   * really fell: a poor draw makes a unit dearer to find, and the answer to
   * that is more hands, not sitting still. That is optimal foraging as this
   * model already invokes it — a falling encounter rate widens the diet and
   * lengthens the search.
   *
   * **"committed"** — the effort goes out before the draw is known and cannot
   * be taken back. One sows what one means to reap, and what the weather then
   * makes of it is settled without anybody being able to answer. The plan
   * reckons with an average year less a little caution, and the difference
   * lands in the output — which is what makes the plenty of a good draw
   * unexpected, and unexpected plenty is why stores were invented.
   *
   * It belongs to the **process** and not to the model, because both kinds
   * exist side by side as soon as tillage arrives, and this epoch is entirely
   * of the first: nobody in it sows.
   *
   * > *Measured before this was split:* with every process blind, a poor draw
   * > left hands idle beside an uncovered rank 100. Over five seeds and 200
   * > ticks without a single decision, every such tick — ten of them — had a
   * > draw between 0.19 and 0.43 and reported *nothing* as binding: no
   * > capacity, no stock. The community sat out the bad tick instead of
   * > searching harder, which is the one thing a foraging community does not do.
   */
  readonly yield: "found" | "committed";

  /**
   * What is being *done* here, as against what comes out (E29).
   *
   * Not the same as the branch: hunting for meat and hunting for hides deliver
   * into different branches and are one activity. And not the same as the
   * process: a technique replaces its predecessor (E5), so gathering with a
   * sickle is still gathering.
   *
   * It exists so that practice can be counted — one improves what one does —
   * and it is stated here, once, rather than listed again at every project that
   * refers to it. Two projects then cannot disagree about what "gathering" is.
   */
  readonly activity: ActivityId;

  readonly unlockedFromStart: boolean;
}

// ---------------------------------------------------------------- needs

/**
 * How strongly a need tier moves a quantity — as a **factor**, interpolated
 * linearly between no coverage and full coverage.
 *
 * Everything in the model is a product, and there is no addition anywhere: a
 * survival of 0.10 means a tenth of the community lives through the tick, and a
 * productivity of 1.2 means a fifth more is got done. That is not merely
 * tidier, it is the exact composition — independent causes of death combine
 * multiplicatively in *survival*, and adding their mortalities is a
 * approximation that only happens to be close while the rates are small. It
 * also cannot produce a negative population or a negative day's work, which
 * adding could and once did.
 *
 * The non-linearity that a threshold needs does not live here but in the
 * ranking: a need that is deadly only when it fails altogether is split into a
 * small vital rank and a comfort rank above it, as food and warmth both are.
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

  /** Factor on the birth rate; 1 is no effect. */
  readonly birthRate?: TierEffect;
  /** Factor on survival; 1 means nobody dies of this, 0.1 means nine in ten do. */
  readonly survival?: TierEffect;
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
   * A stock actually held, measured per head so it scales with the community.
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
    }
  /**
   * How much has been produced with these processes, all told (E29).
   *
   * One improves what one does: the sickle comes out of many harvests, the net
   * out of many hauls. This **delays and never blocks** — keep at the activity
   * and the improvement arrives, and a bad year costs a few ticks. It also
   * orders itself by what the player actually does, so the tree grows out of
   * the community's own economy rather than being laid down in advance.
   *
   * An activity rather than a process, because a technique replaces its
   * predecessor (E5): once the sickle is in use, plain gathering stops adding
   * to its own tally, and a later improvement of the same activity would wait
   * on a counter that has stopped moving.
   *
   * More than one may be named, and their tallies are added — sewing betters
   * both roads to clothing, so it asks for practice at either.
   */
  /**
   * Taking anything the range carries has grown at least this much dearer than
   * it is on fresh country (E29).
   *
   * A community does not move on a whim; it moves when the country is spent.
   * And because the project only appears then, its appearing *is* the warning.
   *
   * What "spent" means had to be the **price of searching** and not how full
   * the stand looks. A fill level cannot express pressure at all: it is read
   * after the growing back, so a range that fills overnight reads untouched
   * however much is taken from it — over eight seeds the thinnest any stock
   * ever showed was 0.861 while two thirds of the range was being taken every
   * tick, and the move never once became available. The price cannot be fooled
   * that way, because it asks what a taking costs and not what is standing.
   *
   * It also tells efficiency from intensification by itself, which is what this
   * condition wants. Working faster — a sickle — leaves it alone. Needing less
   * of the country for the same meal — a mortar — really does lower it, so
   * intensifying postpones the move, exactly as it should.
   */
  | {
      /**
       * **The strain a project answers, measured against a fresh range.**
       *
       * Every project is there to ease one particular strain, and it should
       * come into view as that strain draws near — early enough to be got ready
       * before it bites. Which strain it is follows from the axis the project
       * works on (E29): one that saves hands is called for when its activity
       * eats more of everybody's day; one that opens country, when the country
       * grows dear; one that adds country, when what there is is full.
       *
       * The content holds only a **factor**, never a figure. The figure it is
       * measured against is worked out once from the starting position, so a
       * change to a density, a coefficient or the range per head carries the
       * marks along instead of leaving them behind as stale claims about a
       * model that has moved. `1.2` means *a fifth dearer than on fresh
       * country* and goes on meaning that.
       *
       * Utilisation is the exception and needs no reference: it already lies
       * between nought and one, so its factor is a plain share.
       */
      readonly kind: "strain";
      readonly measure:
        | { readonly labourPerHead: ActivityId }
        | { readonly searchCost: StockId }
        | { readonly utilisation: CapacityId };
      readonly factor: number;
    }
  | {
      readonly kind: "stockDear";
      /** Omitted asks after the dearest of them all — the range as a whole. */
      readonly stock?: StockId;
      readonly factor: number;
    }
  | {
      readonly kind: "experience";
      readonly activities: readonly ActivityId[];
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

/**
 * Where a *level* comes from when an effect sets one — same idea as
 * `QualitySource`, and for the same reason: content states where the number
 * comes from, the engine works it out (T3).
 *
 * `ceiling` is what a range carries of a renewable stock — the herd of a fresh
 * country, full. Writing that as a figure in the content would be wrong twice
 * over: it moves with the size of the range, and it would have to be kept in
 * step by hand with the density that already stands at the stock.
 */
export type LevelSource =
  | { readonly kind: "fixed"; readonly value: number }
  | { readonly kind: "ceiling" };

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
  | { readonly type: "tier"; readonly id: NeedTierId; readonly perHead: number }
  /**
   * Sets a stock outright, rather than adding to it (E29).
   *
   * What a moving community leaves behind and what it finds in a fresh country are
   * both of this shape: food to nothing, game to what the range carries. It is
   * stated in the content and not in the engine, because *what one can carry*
   * is a claim about the world that will want changing — and changing it must
   * mean editing a list, not the allocation.
   */
  | { readonly type: "stock"; readonly id: StockId; readonly to: LevelSource }
  /**
   * Sets what a capacity *is*, rather than adding to it: how much of it there
   * is, or how good it is, or both.
   *
   * The pits stay in the ground when a community moves on — that is the amount going
   * to nothing. And the country it moves into is the same size but a little
   * poorer — that is the quality, taken from the falling margin of E13. Omitting
   * either leaves it as it was. Without a sector it works on the land that
   * belongs to nobody, exactly as the adding form does.
   */
  | {
      readonly type: "setCapacity";
      readonly capacity: CapacityId;
      readonly sector?: SectorId;
      readonly to?: LevelSource;
      readonly quality?: QualitySource;
    }
  /**
   * Forgets how much fresh country has been used up (E29).
   *
   * Settling resets it: otherwise a decision from the first fifty ticks would
   * tax every later epoch, and an option would be a trap. One settles at a
   * chosen place, and whoever wandered widely has seen a great deal of land.
   */
  | { readonly type: "takings"; readonly set: number }
  /**
   * The range carries more of a stock, per unit of ground (E29).
   *
   * The one thing a project could not do: it could add ground, unlock a way of
   * working, set a stock outright or throw a rule — but not make the same
   * ground hold more. That is what husbandry *is*, and every later epoch turns
   * on it: manure, breeding, crop rotation are all "the same field carries
   * more". This epoch's first case is a hook and line, which reach fish a spear
   * from the shore never did.
   *
   * What is already there grows in the same proportion, so that raising the
   * ceiling never makes what lives under it read as suddenly scarce — the
   * mistake the boat made before land learned to bring its stock along.
   */
  | { readonly type: "carries"; readonly stock: StockId; readonly addPerArea: number };

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
   * The two factors a tick applies to the heads before any need is considered.
   * Reciprocal by construction, so that a community whose needs are all met neither
   * grows nor shrinks: it grows when it is *better* off than it needs to be.
   */
  readonly baseBirthFactor: number;
  readonly baseSurvival: number;

  /**
   * Below this the community is given up and the run ends (E20). Not a
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
  /**
   * How much of each capacity a community starts with **per head** (E14).
   *
   * Stated per head rather than as a total, because that is what the rule
   * actually says: a community on a range that carries it. Written as two loose
   * figures, the range and the community drifted apart the moment either was tuned —
   * and the same mistake put the starting stocks out of step with their own
   * ceilings, so a community began in a fished-out water.
   */
  readonly perHeadAtStart: Readonly<Record<CapacityId, number>>;
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
  /**
   * Which way the tick's allocation is worked out. Content, not code, so that
   * one and the same economy can be run through either and the two held against
   * each other — "shift" starts on a declared order and moves demand off
   * whatever runs out, "program" states the whole tick as one ranked program.
   */
  readonly planner?: "shift" | "program";

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

/** Linear interpolation of a tier factor by coverage; absent means 1 (E20). */
export function tierEffectAt(effect: TierEffect | undefined, coverage: number): number {
  if (effect === undefined) return 1;
  return effect.atZero + (effect.atFull - effect.atZero) * coverage;
}

/**
 * Does this process live off the named stretch of country?
 *
 * Two ways it can, and anything judging land has to count both. It may pay the
 * ground directly, as a field does — or it may take a stock that **grows** on
 * that ground, as hunting and fishing do, without occupying a step of it.
 *
 * Nothing that reads land may ask only the first question. When the epoch
 * stopped paying for ground, everything that did went quietly blind: four laws
 * about density measured flat across every technology, "the water carries part
 * of the food" read nought while people were eating mussels, and the bot lost
 * its one safeguard against clearing the last of the wood.
 */
export function livesOn(
  process: ProcessDef,
  capacity: CapacityId,
  index: ConfigIndex,
): boolean {
  if ((process.capacityPerOutput[capacity] ?? 0) > 0) return true;
  for (const id of Object.keys(process.intermediatesPerOutput)) {
    if (index.stock.get(id)?.regrowth?.capacity === capacity) return true;
  }
  return false;
}

/**
 * What one unit of this stretch of country can yield of a good per tick, at
 * best, without being run down.
 *
 * For ground that is occupied and given back it is simply the reciprocal of
 * what a unit of output costs. For a stock growing on it, the honest figure is
 * what the ground **grows**: a logistic stock at half its ceiling puts on
 * `rate × ceiling / 4` per tick, and the ceiling of one unit of ground is its
 * density. Anything above that is eating the capital.
 */
export function yieldPerCapacity(
  process: ProcessDef,
  capacity: CapacityId,
  index: ConfigIndex,
): number {
  const direct = process.capacityPerOutput[capacity] ?? 0;
  if (direct > 0) return 1 / direct;
  let best = 0;
  for (const [id, per] of Object.entries(process.intermediatesPerOutput)) {
    const rule = index.stock.get(id)?.regrowth;
    if (rule === undefined || rule.capacity !== capacity || per <= 0) continue;
    best = Math.max(best, (rule.ratePerTick * rule.densityPerArea) / 4 / per);
  }
  return best;
}
