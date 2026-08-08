import type { Action } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/**
 * Does nothing at all, ever — no move, no project, no store.
 *
 * The one true zero point (T4). Everything else is measured as a difference
 * against it, so it must contain no judgement whatever: the moment a baseline
 * decides something, what is measured against it is the difference between two
 * strategies and not the worth of an action.
 */
export class StillPolicy implements Policy {
  readonly id = "still";

  decide(): readonly Action[] {
    return [];
  }
}
