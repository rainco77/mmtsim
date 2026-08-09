import type {
  ActivityId,
  CapacityId,
  BranchId,
  CohortId,
  ProcessId,
  ProjectId,
  SectorId,
  StockId,
} from "./ids.ts";
import type { RandomState } from "./random.ts";

/**
 * The whole world state (E22).
 *
 * Rule: only what has a history is stored. Everything derivable is recomputed
 * every tick and lives nowhere — see `derive.ts`.
 *
 * The value is plain and serialisable throughout (T7): no functions, no class
 * instances, no cycles. That is what makes saving, comparing and rewinding
 * possible at all.
 */
export interface GameState {
  /** Game time is the number of ticks. Nothing claims what a tick is (E17). */
  readonly tick: number;

  readonly random: RandomState;

  /**
   * Every stock has a holder from the start (E22). Until property exists there
   * is exactly one sector — but the shape must not change later, because every
   * reading site would be affected.
   */
  readonly sectors: Readonly<Record<SectorId, SectorState>>;

  /**
   * Land that belongs to nobody (E13). Wilderness is unowned, not commonly
   * owned: a regulated commons would be an institution, and there is none.
   */
  readonly unownedCapacity: Readonly<Record<CapacityId, Capacity>>;

  /**
   * How much more of a stock the range carries than the content says, per unit
   * of ground — what husbandry has added (E29).
   *
   * Land itself is not made better here; what lives on it is made more
   * plentiful. A hook and line reach fish a spear never did, burning brings on
   * hazel and browse, and in later epochs manure and breeding do the same thing
   * again. It is history and so belongs in the state: the content says what
   * untouched country carries, this says what has been done to it since.
   */
  readonly rangeCarries: Readonly<Record<StockId, number>>;

  /**
   * How much of a good the player has said to hold in reserve (E1).
   *
   * A **fixed amount**, deliberately, not a multiple of what is used: a setting
   * that grows by itself never has to be looked at again, and then the
   * institution that later takes it over relieves nobody of anything. A fixed
   * one goes out of date as the community grows and has to be brought up — and
   * it is that upkeep the institution removes, which is what makes less control
   * feel like progress rather than merely being called it.
   */
  readonly stockTargets: Readonly<Record<StockId, number>>;

  /**
   * Where each reserve's claim stands in the ranking, when the player has moved
   * it (E18 — the same number a project carries).
   *
   * Absent means the content's default, which is the very back: a reserve that
   * nobody has thought about fills out of what is left over and can never cost
   * anyone their dinner. Bringing it forward is the whole decision — sooner
   * than eating one's fill buys safety with fewer children, sooner than the
   * fire buys it with lives. The danger is chosen, never inflicted.
   */
  readonly stockRanks: Readonly<Record<StockId, number>>;

  /** How often territory was taken; the quality of the next parcel follows (E13). */
  readonly landTakings: number;

  /**
   * What the country now on offer is worth against the mean the takings have
   * come down to — a factor about one, drawn afresh at the end of every tick
   * (E25, stream `land`).
   *
   * Held in the state and not peeked out of the stream, because peeking never
   * advances anything: the same number would stand there for ever and waiting
   * for a better offer could never do anything. Written at the tick's end so
   * that what was on the screen when the decision was made is what the move
   * then gets.
   */
  readonly landOffer: number;

  /**
   * The tick at which the community fell below the minimum viable size and was
   * given up (E20). Absent while it is still going.
   *
   * This is history, not a comparison: once it has happened it stays true, and
   * `heads < minimum` evaluated afresh could stop being. And it has to live
   * here rather than being derived, because from here it stops the world for
   * everybody at once. Left to each caller to notice, it was noticed by none —
   * bots, criteria and measuring scripts all went on computing communities down
   * to a tenth of a person.
   */
  readonly abandonedAt?: number;

  /** How often each project was finished — covers one-off and repeatable alike. */
  readonly completedProjects: Readonly<Record<ProjectId, number>>;

  readonly activeProjects: readonly ActiveProject[];

  /**
   * What each need came to last tick.
   *
   * History, like `leadProcess` beside it: it cannot be worked out again from
   * the state, because it is about a tick that is over. Saving reads it — one
   * puts something by when there was enough, not while going short (E19) — and
   * reading the *past* is what keeps that from being clairvoyance.
   */
  readonly lastCoverage: Readonly<Record<string, number>>;

  /**
   * What taking each renewable stock cost last tick, against what the same
   * taking costs on fresh country (E29). One on untouched ground, higher the
   * harder it has grown to find.
   *
   * History like `lastCoverage` beside it, and for the same reason: only the
   * allocation knows what a taking cost, and it is over by the time anything
   * else asks. Kept here so that the condition for moving on, the bots and the
   * view all read the **one** figure instead of each working out its own idea
   * of how spent the country is — which is what left all three of them unable
   * to see two thirds of a range being taken every tick.
   */
  readonly lastEffort: Readonly<Record<StockId, number>>;

  /**
   * What one head's share of an activity cost last tick, and how hard each
   * capacity was worked — history beside `lastEffort` and for the same reason.
   *
   * Between them and the search costs, every strain a project answers is
   * measurable: a technique that saves hands is called for when the activity it
   * belongs to eats more of everybody's work; one that opens country, when the
   * country grows dear; one that adds country, when what there is is full.
   */
  /**
   * The tick each project was first shown at.
   *
   * **What has once been offered is never withdrawn.** A strain eases again —
   * after a range change, after a poor draw passes — and an offer that vanishes
   * while the player is weighing it up punishes him for thinking. History, so
   * it is kept (E22): the mark said "this is coming", and that stays true.
   */
  readonly seenProjects: Readonly<Record<ProjectId, number>>;

  readonly lastLabourPerHead: Readonly<Record<string, number>>;
  readonly lastUtilisation: Readonly<Record<CapacityId, number>>;

  /**
   * How many were born last tick, and the survival factor each cohort was
   * carried through with — as the population phase actually applied them.
   *
   * History like `lastCoverage` above, and for the same reason: the phase
   * works with the tick's own allocation, which is gone by the time anything
   * else asks. A view that recomputes births and deaths from the end state
   * tells a shifted story — the collapse a tick early, the recovery a tick
   * late — so whatever shows them reads these and never recomputes.
   */
  readonly lastBorn: number;
  readonly lastSurvival: Readonly<Record<CohortId, number>>;

  /**
   * How the tick's labour actually split (E16, E21): performed, into
   * production, into projects, left unused. Recorded from the allocation that
   * ran, for the same reason as `lastBorn` beside it.
   */
  readonly lastLabor: {
    readonly available: number;
    readonly toProduction: number;
    readonly toProjects: number;
    readonly unused: number;
  };

  /** Which process led per branch last tick — shown, not used to decide (E5). */
  readonly leadProcess: Readonly<Record<BranchId, ProcessId>>;

  /**
   * How much has ever been produced at each activity — a counter that only
   * grows (E29).
   *
   * One improves what one does. A sickle comes out of much gathering and a net
   * out of many hauls, so a project that betters an activity asks that the
   * activity has been carried on for a while. That **delays and never blocks**:
   * keep gathering and the sickle comes, and a poor draw costs a few ticks and
   * nothing more. And it orders itself by what the player actually does — fish
   * a great deal and the net arrives first — so the tree grows out of the
   * community's own economy instead of being laid down in advance.
   *
   * Arrow, *Learning by Doing* (1962): unit costs fall with cumulative output,
   * not with time. Archaeologically the same — technique follows practice.
   */
  readonly experience: Readonly<Record<ActivityId, number>>;
}

export interface SectorState {
  /**
   * The people, a figure per cohort (E20). Fractional; displayed rounded.
   *
   * A vector and not a single head count, because dying, growing up and being
   * born do not touch every group alike — and because a newborn is not a pair
   * of hands.
   */
  readonly cohorts: Readonly<Record<CohortId, number>>;

  readonly stocks: Readonly<Record<StockId, number>>;

  /** Owned land, per area type. Empty until property exists. */
  readonly capacityHeld: Readonly<Record<CapacityId, Capacity>>;

  /**
   * Carried factors (E16). They follow from coverage, but coverage follows from
   * production, which follows from them — the circle is broken by carrying them
   * from the previous tick (T2).
   */
  readonly productivity: number;
  readonly workAbility: number;
}

/** Capacity always travels with its quality, because each holder has its own (E13). */
export interface Capacity {
  readonly amount: number;
  readonly quality: number;
}

/** A project under way (E18). */
export interface ActiveProject {
  /**
   * Where this project's claim stands in the ranking (E9), as a plain number,
   * so every position is expressible. What the interface offers of it — free
   * choice or a few named places — is the shell's business (T1).
   *
   * It is per project because projects differ in urgency: a granary may be
   * worth going hungry for and a monument may not. And it is the player's, so
   * the danger of committing is chosen rather than hidden.
   */
  readonly rank: number;
  readonly id: ProjectId;
  /** 0 … 1. Reaching 1 completes it. */
  readonly progress: number;
  /** Lower runs earlier; the start time seeds it, the player may reorder. */
  readonly order: number;
  readonly paused: boolean;
  /**
   * The land report the decision was made on (E13, E29). A move is committed
   * against the country on offer that tick; the offer is drawn afresh every
   * tick, so without this the completion would settle a different range than
   * the one that was scouted, and the shown figure would be a lottery.
   */
  readonly landOfferAtStart: number;
}

export const EMPTY_AREA: Capacity = { amount: 0, quality: 1 };

export function capacityOf(capacityHeld: Readonly<Record<CapacityId, Capacity>>, id: CapacityId): Capacity {
  return capacityHeld[id] ?? EMPTY_AREA;
}

/**
 * How much land this really is, for the purpose of what can live on it (E13).
 *
 * Before there are fields, nobody occupies ground: it is walked over, and what
 * is taken from it grows back. Quality therefore cannot show itself by making a
 * area dearer — no process pays for area at all. It shows itself in what the
 * ground **carries**: poorer country holds fewer deer, less growth, fewer
 * trees. That is Ricardo unchanged, at the only place left where it can bite,
 * and it is what keeps a change of range costly: the next range is the same
 * size and a little poorer, so it feeds a little less.
 */
export function carryingArea(capacity: Capacity): number {
  return capacity.amount * capacity.quality;
}

export function stockOf(stocks: Readonly<Record<StockId, number>>, id: StockId): number {
  return stocks[id] ?? 0;
}

export function completedCount(state: GameState, id: ProjectId): number {
  return state.completedProjects[id] ?? 0;
}

/**
 * Everyone, counted alike. What a run of the mill head count meant before —
 * used where people are meant as people and not as hands (E20).
 */
export function totalHeads(cohorts: Readonly<Record<CohortId, number>>): number {
  let sum = 0;
  for (const heads of Object.values(cohorts)) sum += heads;
  return sum;
}

/**
 * The scalar product of the people with a weighting (E20): how much work is
 * performed, how much of a need is asked for, how many can bear children.
 *
 * A cohort the weighting does not name counts as nought rather than as one,
 * because the index refuses content that leaves one out — so this can only be
 * reached by a weighting built in a test.
 */
export function weighedHeads(
  cohorts: Readonly<Record<CohortId, number>>,
  weight: Readonly<Record<CohortId, number>>,
): number {
  let sum = 0;
  for (const [cohort, heads] of Object.entries(cohorts)) sum += heads * (weight[cohort] ?? 0);
  return sum;
}

export function withSector(
  state: GameState,
  id: SectorId,
  change: (sector: SectorState) => SectorState,
): GameState {
  const sector = state.sectors[id];
  if (sector === undefined) return state;
  return { ...state, sectors: { ...state.sectors, [id]: change(sector) } };
}
