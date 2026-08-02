import type {
  ActivityId,
  CapacityId,
  BranchId,
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

  /** How often territory was taken; the quality of the next parcel follows (E13). */
  readonly landTakings: number;

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

  /** Which process led per branch last tick — shown, not used to decide (E5). */
  readonly leadProcess: Readonly<Record<BranchId, ProcessId>>;

  /**
   * How much has ever been produced at each activity — a counter that only
   * grows (E29).
   *
   * One improves what one does. A sickle comes out of many harvests and a net
   * out of many hauls, so a project that betters an activity asks that the
   * activity has been carried on for a while. That **delays and never blocks**:
   * keep gathering and the sickle comes, and a bad year costs a few ticks and
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
  /** Fractional; displayed rounded (E20). */
  readonly heads: number;

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
 * hectare dearer — no process pays hectares at all. It shows itself in what the
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

export function withSector(
  state: GameState,
  id: SectorId,
  change: (sector: SectorState) => SectorState,
): GameState {
  const sector = state.sectors[id];
  if (sector === undefined) return state;
  return { ...state, sectors: { ...state.sectors, [id]: change(sector) } };
}
