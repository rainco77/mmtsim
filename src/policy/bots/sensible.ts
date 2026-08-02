import { livesOn, yieldPerCapacity } from "../../sim/index.ts";
import type { Action, ConfigIndex, Derived, GameState, ProcessDef } from "../../sim/index.ts";
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
    best = Math.max(best, yieldPerCapacity(process, capacity, index));
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
 * a better one, it ends the source — and the community then carries a death
 * penalty it can never lift, and bleeds out over hundreds of ticks.
 */
function soleSource(capacity: string, stock: string, index: ConfigIndex): boolean {
  let onThis = false;
  for (const process of index.config.processes) {
    if (index.branch.get(process.branch)?.produces !== stock) continue;
    if (livesOn(process, capacity, index)) {
      onThis = true;
      continue;
    }
    // Somewhere else in the country, so this stretch is not the only source.
    for (const other of index.config.capacities) {
      if (other.id !== capacity && livesOn(process, other.id, index)) return false;
    }
  }
  return onThis;
}

/** Below this the most basic need is not met and nothing else matters. */
const FED = 0.95;

/**
 * Where this player puts a project: behind everything that costs lives or the
 * strength to work, ahead of putting by, eating one's fill and being warm.
 *
 * The bargain is then the one a project ought to be — progress bought with
 * fewer children and less comfort, never with anybody's life. It used to sit
 * one place below bare hunger, on the reasoning that this player would go
 * without comfort but not starve; but below hunger does not come comfort, it
 * comes **fire**, and going without fire kills three in five. Measured, the
 * community was down from twenty-five to eight by tick 3 with warmth at
 * nought, in every run — so "thoughtful play fails" was measuring a beginner's
 * mistake in the yardstick, not anything about the game.
 *
 * The declared default stays at the very back, where nothing can ever die of
 * it. Moving up to here is what a player learns, and this is the player who
 * has learnt it.
 */
const BOUGHT_WITH_COMFORT = 450;

/**
 * Above this price the country counts as pressed and a technique that only
 * saves hands on it is a trap rather than a relief (E29).
 */
const PRESSED = 1.3;

/** Hands lying idle before a second building site is worth opening. */
const SPARE_HANDS = 2;

/**
 * Above this price the country counts as spent, and this player moves before it
 * hurts: twice the walking for the same meal (E29). The one figure the
 * allocation writes — a fill level cannot say it, being read after the growing
 * back.
 */
const SPENT = 1.5;

/**
 * Builds out of surplus: starts something while the people are well fed, and
 * stops while they are not.
 *
 * This is the yardstick for "played thoughtfully" (T4), and it needs no
 * knowledge of the content — only the one signal a player also has in front of
 * him. It is the investment decision itself: hands put into a project are hands
 * not gathering, so you can invest when there is something to spare and not
 * when there is not. A community of thirty therefore builds one thing at a time and
 * a community of five hundred builds several, without either being written
 * down anywhere.
 *
 * The contrast with `eager` is deliberate. Starting everything at once is not a
 * more determined version of this but a worse one: the projects compete for the
 * same hands, and building three things while the food fails kills the
 * community. That only became true when the projects were given costs that
 * bite.
 */
export class SensiblePolicy implements Policy {
  readonly id = "sensible";

  decide(_state: GameState, derived: Derived, index: ConfigIndex): readonly Action[] {
    // Only the lowest rank has to hold — bare survival. Everything above it is
    // comfort, and building out of comfort is what investment is.
    //
    // Waiting for *every* need was measured to be a trap: at the carrying
    // capacity of its range a community is never comfortable, so it would never
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

    // One thing at a time, unless there are hands genuinely lying idle.
    //
    // This is the plainest lesson of playing by hand: I built the mortar,
    // waited for it, then the sickle, and the community grew throughout. The
    // bot started a new project every tick instead — five at once — because
    // its test was whether the lowest rank was covered, and with projects
    // claiming behind every need that stays covered while they quietly eat the
    // surplus. Measured: ten of seventeen hands went to five building sites,
    // production got seven, and twenty-five people became twelve.
    //
    // Idle labour is the honest signal for affording another. It is what a
    // second site would have to come out of, and when there is none, a second
    // site comes out of somebody's dinner by another name.
    const building = derived.projects.filter((project) => project.running).length;
    if (building > 0 && derived.laborUnused < SPARE_HANDS) return [];

    // Nothing that undoes what is already under way. Clearing and afforestation
    // move the same ground in opposite directions, so running both is not a
    // bolder plan but a self-cancelling one — and a yardstick that contradicts
    // itself measures badly. Read off the capacity effects, not off the names,
    // so it holds for whatever a later epoch adds.
    const underway = derived.projects
      .filter((project) => project.running)
      .map((project) => moves(project.id, index));
    // Every need that is not covered, lowest rank first, with the capacity it
    // is short of. All of them, not only the lowest: a community can be short
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
    // from the needs themselves, so it grows with the community.
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

    // Which of the things the country carries have grown dear to search for —
    // read off the one figure the allocation writes, never worked out again
    // here. Above this a stock is being pressed, whatever its stand looks like.
    const pressed = new Set(
      Object.entries(derived.effortPerStock)
        .filter(([, price]) => price >= PRESSED)
        .map(([stock]) => stock),
    );

    /**
     * Does this project pay to draw harder on something already pressed?
     *
     * The lesson of the bow, played by hand: it makes hunting quicker, so the
     * whole of the food went over to a herd that grows back at a tenth of the
     * rate the greens do, and it fell from 44 to 4 in two ticks. A technique
     * that only saves hands on a slow stock does not relieve anything — it
     * spends the capital faster. What is worth building against a dear country
     * is a technique that needs **less of the country** for the same output.
     */
    const deepens = (id: string): boolean =>
      (index.project.get(id)?.effects ?? []).some((effect) => {
        if (effect.type !== "process") return false;
        const opened = index.process.get(effect.id);
        if (opened === undefined) return false;
        return Object.entries(opened.intermediatesPerOutput).some(([stock, per]) => {
          if (per <= 0 || !pressed.has(stock)) return false;
          // Unless it asks less of that very thing than what it replaces —
          // then it is intensification and exactly what a pressed country
          // wants (Boserup).
          return !sparesTheCountry(opened, stock);
        });
      });

    /** Does this process need less of a stock per unit than its predecessors? */
    const sparesTheCountry = (opened: ProcessDef, stock: string): boolean => {
      const per = opened.intermediatesPerOutput[stock] ?? 0;
      for (const other of index.config.processes) {
        if (other.id === opened.id) continue;
        if (other.branch !== opened.branch) continue;
        if (!derived.processes.includes(other.id)) continue;
        const theirs = other.intermediatesPerOutput[stock] ?? 0;
        if (theirs > 0 && per < theirs - 1e-9) return true;
      }
      return false;
    };

    // A range that has been hunted or fished out is not mended by working
    // harder in it — a community that can still move, moves (E29). The cost takes
    // care of itself: what is in the ground stays there, so a community with
    // many pits will not do this lightly.
    const spent = Object.values(derived.renewable).some(
      () => Object.values(derived.effortPerStock).some((price) => price >= SPENT),
    );
    if (spent) {
      const move = derived.projects.find(
        (project) =>
          project.available &&
          !project.running &&
          (index.project.get(project.id)?.effects ?? []).some(
            (effect) => effect.type === "stock" && effect.to.kind === "ceiling",
          ),
      );
      if (move !== undefined) return [{ type: "startProject", id: move.id, rank: BOUGHT_WITH_COMFORT }];
    }

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

    return [{ type: "startProject", id: start.id, rank: BOUGHT_WITH_COMFORT }];
  }
}
