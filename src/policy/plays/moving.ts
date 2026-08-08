import type { Action, ConfigIndex, Derived, GameState, StockId } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/**
 * Above this a stand counts as dear: the same meal costs half again as much
 * searching as it does where nothing has been taken (E29). Read off the one
 * figure the allocation writes — how full a stand looks says nothing, because
 * it is read after the growing back.
 */
const DEAR = 1.35;

/**
 * What a move has to be worth: it must leave at least this much more standing
 * than there was. A move only closes part of the gap to what the ground could
 * carry, so on a stand that is nearly full it gains almost nothing and the
 * walking is paid for nothing.
 */
const WORTH_IT = 0.1;

/**
 * Hands count as bound below this. Nothing is being braked while there are
 * hands to spare: a dear stand is then simply paid for out of the slack.
 */
const BOUND = 0.02;

/**
 * A range of any quality is not taken. The report on the next range is drawn
 * afresh every tick, so a braked community waits for one worth nearly what the
 * worn range still is — a few ticks of patience against a step that cannot be
 * taken back.
 */
const WORTH_LEAVING_FOR = 0.97;

/**
 * Moves on, and does nothing else.
 *
 * **A dear stand is not by itself a reason to walk.** What makes it one is that
 * the community is living off that stand *now*, that the searching is dear, that
 * a move would leave materially more standing, and that there are no idle hands
 * — for while there are, the dearness costs slack and brakes nothing.
 *
 * Residential mobility is the ordinary adaptation of people who live off what a
 * range carries (Binford), not a clever stroke; so it belongs in a strategy of
 * its own, between doing nothing and building.
 */
export class MovingPolicy implements Policy {
  readonly id = "moving";

  decide(_state: GameState, derived: Derived, index: ConfigIndex): readonly Action[] {
    if (derived.projects.some((project) => project.running)) return [];
    const idle = derived.laborPerformance > 0 ? derived.laborUnused / derived.laborPerformance : 1;
    if (idle > BOUND) return [];
    if (!this.braked(derived, index)) return [];
    if (derived.nextTakingQuality < WORTH_LEAVING_FOR * this.landQuality(derived, index)) {
      return [];
    }

    // Whatever the content offers that sets stocks back towards what the range
    // carries. Named by what it does, not by its id, so this holds for whatever
    // a later epoch calls it.
    const move = derived.projects.find(
      (project) =>
        project.available &&
        !project.running &&
        (index.project.get(project.id)?.effects ?? []).some(
          (effect) => effect.type === "stock" && effect.to.kind === "ceiling",
        ),
    );
    return move === undefined ? [] : [{ type: "startProject", id: move.id }];
  }

  /** Quality of the land lived on now, its kinds weighted by area. */
  private landQuality(derived: Derived, index: ConfigIndex): number {
    let area = 0;
    let weighted = 0;
    for (const kind of Object.keys(index.config.land.perHeadAtStart)) {
      for (const pool of [derived.ownedCapacity[kind], derived.unownedCapacity[kind]]) {
        if (pool === undefined) continue;
        area += pool.amount;
        weighted += pool.amount * pool.quality;
      }
    }
    return area > 0 ? weighted / area : 1;
  }

  /** Is some stand the community draws on now dear, and would a move relieve it? */
  private braked(derived: Derived, index: ConfigIndex): boolean {
    for (const stockId of this.drawnOn(derived, index)) {
      if ((derived.effortPerStock[stockId] ?? 1) < DEAR) continue;
      const stand = derived.renewable[stockId];
      if (stand === undefined || stand.held <= 0 || stand.ceiling <= 0) continue;
      if ((stand.ceiling - stand.held) / stand.held >= WORTH_IT) return true;
    }
    return false;
  }

  /** The renewable stands that something actually took from this tick. */
  private drawnOn(derived: Derived, index: ConfigIndex): ReadonlySet<StockId> {
    const drawn = new Set<StockId>();
    for (const run of derived.runs) {
      if (run.output <= 0) continue;
      const def = index.process.get(run.process);
      if (def === undefined) continue;
      for (const input of Object.keys(def.intermediatesPerOutput)) {
        if (derived.renewable[input] !== undefined) drawn.add(input);
      }
    }
    return drawn;
  }
}
