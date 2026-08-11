import type { NeedTierId, ProjectId } from "../sim/index.ts";

/**
 * The presentation section of the interface, one per epoch (T9). It holds what
 * the surface decides about an epoch's needs, claims and grips — never the
 * model's own definition of them, which knows nothing of alarms, of bands or
 * of how far a grip may be pushed.
 */

/**
 * The ranks whose shortfall counts as distress: the ones whose failure kills
 * the community outright. Care and comfort work mildly and chronically, and
 * comfort in particular is short through the whole early game — an alarm on it
 * would sound at every tick and mean nothing.
 */
export const DISTRESS_TIERS: readonly NeedTierId[] = ["food_survival", "warmth_fire"];

/**
 * The undertakings that are **done in the stroke they are begun**.
 *
 * Walking is what a band does: the people who carry the camp are the people who
 * walk, so there is no half-finished move for anything to be paced by. The
 * surface follows the model rather than dressing it up — starting one plays the
 * tick at once, exactly as if the single step had been pressed straight after,
 * and it never stands in the band as a claim to be weighed against the eating:
 * a claim one could drag is a claim that lasts, and this one does not.
 */
export const PLAYED_AT_ONCE: readonly ProjectId[] = ["range_change"];

/**
 * How far the grip on a store's goal reaches, in ticks.
 *
 * Epoch policy and not a property of the store: what the woodpile may be set to
 * is a judgement about this epoch's play — far enough that putting by is a real
 * decision, near enough that it cannot be set past anything the community could
 * ever gather. A later epoch sets its own span, and the model knows of none.
 */
export const STORE_GOAL_TICKS_MAX = 12;
