import type { NeedTierId } from "../sim/index.ts";

/**
 * The presentation section of the interface, one per epoch (T9). It holds what
 * the surface decides about an epoch's needs — never the model's own
 * definition of them, which knows nothing of alarms or names.
 */

/**
 * The ranks whose shortfall counts as distress: the ones whose failure kills
 * the community outright. Care and comfort work mildly and chronically, and
 * comfort in particular is short through the whole early game — an alarm on it
 * would sound at every tick and mean nothing.
 */
export const DISTRESS_TIERS: readonly NeedTierId[] = ["food_survival", "warmth_fire"];
