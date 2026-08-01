import type { Action, ConfigIndex, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";

/** Net effect of a project on each capacity — the sign is what matters. */
function moves(id: string, index: ConfigIndex): ReadonlyMap<string, number> {
  const net = new Map<string, number>();
  for (const effect of index.project.get(id)?.effects ?? []) {
    if (effect.type !== "capacity") continue;
    net.set(effect.capacity, (net.get(effect.capacity) ?? 0) + effect.amount);
  }
  return net;
}

/** Do these two pull the same capacity in opposite directions? */
function opposes(a: ReadonlyMap<string, number>, b: ReadonlyMap<string, number>): boolean {
  for (const [capacity, one] of a) {
    const two = b.get(capacity) ?? 0;
    if (one * two < 0) return true;
  }
  return false;
}

/**
 * The most output any unlocked process gets from one unit of this capacity.
 *
 * This is the piece a sign cannot supply. Clearing *shrinks* the wilderness and
 * is still right, because the ground it makes carries several times as much
 * food. Reading only which capacity got smaller says the opposite, which is how
 * two earlier attempts at this rule made the player worse rather than better.
 */
function worth(capacity: string, stock: string, index: ConfigIndex): number {
  let best = 0;
  for (const process of index.config.processes) {
    if (index.branch.get(process.branch)?.produces !== stock) continue;
    const per = process.capacityPerOutput[capacity] ?? 0;
    if (per > 0) best = Math.max(best, 1 / per);
  }
  return best;
}

/**
 * Is this capacity the only source of the good, or can it be made elsewhere?
 *
 * That is the whole difference between clearing and deforesting. Food has an
 * alternative — farmland — so turning wilderness into fields is right, and the
 * margin says so loudly: an acre of field carries thirteen times the food of an
 * acre of wild. Wood has no alternative; it grows on standing wilderness and
 * nowhere else. Clearing the last of it therefore does not trade one source for
 * a better one, it ends the source — and the settlement then carries a death
 * penalty it can never lift, and bleeds out over hundreds of ticks.
 */
function soleSource(capacity: string, stock: string, index: ConfigIndex): boolean {
  let onThis = false;
  for (const process of index.config.processes) {
    if (index.branch.get(process.branch)?.produces !== stock) continue;
    if ((process.capacityPerOutput[capacity] ?? 0) > 0) onThis = true;
    else if (Object.keys(process.capacityPerOutput).length > 0) return false;
  }
  return onThis;
}

/** Below this the most basic need is not met and nothing else matters. */
const FED = 0.95;

/**
 * Builds out of surplus: starts something while the people are well fed, and
 * stops while they are not.
 *
 * This is the yardstick for "played thoughtfully" (T4), and it needs no
 * knowledge of the content — only the one signal a player also has in front of
 * him. It is the investment decision itself: hands put into a project are hands
 * not gathering, so you can invest when there is something to spare and not
 * when there is not. A band of thirty therefore builds one thing at a time and
 * a settlement of five hundred builds several, without either being written
 * down anywhere.
 *
 * The contrast with `eager` is deliberate. Starting everything at once is not a
 * more determined version of this but a worse one: the projects compete for the
 * same hands, and building three things while the food fails kills the
 * settlement. That only became true when the projects were given costs that
 * bite.
 */
export class SensiblePolicy implements Policy {
  readonly id = "sensible";

  decide(_state: GameState, derived: Derived, index: ConfigIndex): readonly Action[] {
    // Only the lowest rank has to hold — bare survival. Everything above it is
    // comfort, and building out of comfort is what investment is.
    //
    // Waiting for *every* need was measured to be a trap: at the carrying
    // capacity of its range a band is never comfortable, so it would never
    // invest and never escape, and a hundred people sat with seventy idle hands
    // for a hundred ticks. It was also a rule against a danger that no longer
    // exists — since projects rank below survival (E18) they cannot starve
    // anyone, so there is nothing left to be careful about.
    const lowest = derived.tiers.reduce(
      (rank, tier) => Math.min(rank, tier.rank),
      Number.POSITIVE_INFINITY,
    );
    const alive = derived.tiers
      .filter((tier) => tier.rank === lowest)
      .every((tier) => tier.coverage >= FED);
    if (!alive) return [];

    // Nothing that undoes what is already under way. Clearing and afforestation
    // move the same ground in opposite directions, so running both is not a
    // bolder plan but a self-cancelling one — and a yardstick that contradicts
    // itself measures badly. Read off the capacity effects, not off the names,
    // so it holds for whatever a later epoch adds.
    const underway = derived.projects
      .filter((project) => project.running)
      .map((project) => moves(project.id, index));
    // Every need that is not covered, lowest rank first, with the capacity it
    // is short of. All of them, not only the lowest: a settlement can be short
    // of food and of wood at once, and they pull the land in opposite ways.
    const wanting = [...derived.tiers]
      .filter((tier) => tier.coverage < 0.999 && tier.binding.kind === "capacity")
      .sort((a, b) => a.rank - b.rank)
      .map((tier) => ({
        stock: index.tier.get(tier.tier)?.stock ?? "",
        short: tier.binding.what ?? "",
      }));

    // How much of a capacity has to stay standing: everything that rests on it
    // and has nowhere else to come from. Not a rule of thumb — the size follows
    // from the needs themselves, so it grows with the settlement.
    const reserve = (capacity: string): number => {
      let needed = 0;
      for (const outcome of derived.tiers) {
        const tier = index.tier.get(outcome.tier);
        if (tier === undefined || !soleSource(capacity, tier.stock, index)) continue;
        let per = 0;
        for (const process of index.config.processes) {
          if (index.branch.get(process.branch)?.produces !== tier.stock) continue;
          const cost = process.capacityPerOutput[capacity] ?? 0;
          if (cost > 0) per = per === 0 ? cost : Math.min(per, cost);
        }
        needed += tier.perHead * derived.heads * per;
      }
      return needed;
    };

    // What is being taken from each renewable stock this tick, against what
    // grows back. A stock taken above its growth is being run down, and a
    // thoughtful player does not then pay to take it faster still.
    const overdrawn = new Set<string>();
    for (const [stock, renewal] of Object.entries(derived.renewable)) {
      let taken = 0;
      for (const run of derived.runs) {
        const per = index.process.get(run.process)?.intermediatesPerOutput[stock] ?? 0;
        taken += run.output * per;
      }
      if (taken > renewal.growth + 1e-9) overdrawn.add(stock);
    }
    /** Does this project pay to draw harder on something already run down? */
    const deepens = (id: string): boolean =>
      (index.project.get(id)?.effects ?? []).some((effect) => {
        if (effect.type !== "process") return false;
        const inputs = index.process.get(effect.id)?.intermediatesPerOutput ?? {};
        return Object.keys(inputs).some((stock) => overdrawn.has(stock));
      });

    const open = derived.projects.filter((project) => {
      if (!project.available || project.running) return false;
      if (deepens(project.id)) return false;
      const effect = moves(project.id, index);
      for (const [capacity, amount] of effect) {
        if (amount >= 0) continue;
        const left = (derived.capacityTotal[capacity] ?? 0) + amount;
        if (left < reserve(capacity)) return false;
      }
      return !underway.some((other) => opposes(other, effect));
    });

    /**
     * What starting this would do for the needs that are going unmet: for each
     * of them, how much of the good it is short of this project's land swap
     * would buy or cost. Positive is worth doing.
     */
    const gain = (id: string): number => {
      const effect = moves(id, index);
      let total = 0;
      for (const { stock, short } of wanting) {
        if (short === "") continue;
        for (const [capacity, amount] of effect) {
          const per = worth(capacity, stock, index);
          if (per > 0) total += amount * per;
        }
      }
      return total;
    };

    // What helps most against what is missing; among equals, something new
    // before more of the same.
    const ranked = [...open].sort((a, b) => {
      const byGain = gain(b.id) - gain(a.id);
      if (Math.abs(byGain) > 1e-9) return byGain;
      return (a.completed === 0 ? 0 : 1) - (b.completed === 0 ? 0 : 1);
    });
    const start = ranked[0];
    if (start === undefined) return [];

    // Urgency is part of starting something (E18): this player puts every
    // project just below bare survival — he is willing to go without comfort
    // for it, but not to starve for it. Leaving it at the declared default,
    // which is above every need, is what `eager` does, and it kills.
    return [{ type: "startProject", id: start.id, rank: lowest + 1 }];
  }
}
