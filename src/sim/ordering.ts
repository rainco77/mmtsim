import type { BranchDef, Config, ConfigIndex, ProcessDef } from "./config.ts";
import type { BranchId } from "./ids.ts";
import { exposureMagnitude } from "./risk.ts";

/**
 * Where the order of processes comes from (E5).
 *
 * Every source delivers the **same shape** — an ordering, never a single chosen
 * process. Only that makes them interchangeable, so switching later is a line of
 * configuration and not a rebuild, and the fallback level keeps working
 * unchanged.
 *
 * **This is an allocation, not an election.** In history there was no switch
 * from hunting to farming: both ran side by side for millennia and the shares
 * shifted as population density rose. Asking every tick "which process wins?"
 * makes the answer swing, because each choice relieves its own shortage. Asking
 * "how much runs on each?" has a stable answer, because every process is limited
 * by **its own** capacity.
 */
export interface ProcessOrdering {
  readonly id: string;
  order(branch: BranchDef, ctx: OrderingContext): OrderedProcesses;
}

export interface OrderedProcesses {
  readonly processes: readonly ProcessDef[];
  /** Why the leader leads — data, never text (T6). */
  readonly reason: OrderingReason;
}

export type OrderingReason =
  | { readonly kind: "declared" }
  | { readonly kind: "labor" }
  | { readonly kind: "risk"; readonly buffer: number };

export interface OrderingContext {
  readonly index: ConfigIndex;
  readonly available: readonly ProcessDef[];
  /** Stock over need at the lowest rank; thin means risk hurts (E5). */
  readonly buffer: number;
  /** Land quality of one capacity — poor ground means more of it (E13). */
  quality(capacity: string): number;
  /**
   * What searching costs this process, because what it takes has grown thin
   * (E29) — one on fresh country, higher the harder its quarry is to find.
   *
   * Without it the comparison read coefficients off the content and never
   * noticed the country. Measured: the moment the bow was finished, the whole
   * of the food went over to hunting because it asks 0.27 of labour against
   * gathering's 0.28 — and the herd, which grows back at a tenth of the rate
   * the greens do, fell from 44 to 4 in two ticks and the community starved. By
   * then a hunted meal really cost 1.92 of labour against 0.29 gathered, six
   * times as much; the ordering just could not see it.
   */
  effort(process: ProcessDef): number;
}

/** The order stated in the content. Fallback only (E5). */
export class DeclaredOrdering implements ProcessOrdering {
  readonly id = "declared";

  order(_branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    return {
      processes: [...ctx.available].sort((a, b) => b.priority - a.priority),
      reason: { kind: "declared" },
    };
  }
}


/**
 * Ordered by **dominance** (E4: labour is an input like any other).
 *
 * A process goes before another when it needs **no more of every input** they
 * both use and less of at least one. That is the standard notion of activity
 * analysis (Koopmans): what is left over is the efficient frontier, and which
 * of those to pick cannot be decided by quantities at all — it needs prices.
 * The plan is therefore not supposed to decide it, and does not.
 *
 * No input is a criterion of its own. Ordering by output per unit of labour was
 * measured to pick the technique that produced 43 % less from the same ground,
 * because labour was the one input in surplus — it saved what was being thrown
 * away anyway (E10: unused labour decays). Ordering by whichever input happens
 * to bind was tried before that and oscillated.
 *
 * What decides where dominance is silent is **scarcity**, and it decides later:
 * the plan starts on the routine and moves demand off whatever does not fit
 * (E21). Land short means the land-sparing technique wins, labour short means
 * the labour-sparing one — symmetrically, with no criterion stated in advance.
 *
 * Processes that work different ground — irrigated against dry fields — never
 * compare: each needs an input the other does not, so neither dominates, and
 * both simply run to their own capacity. That is Boserup as a shifting mix
 * rather than a switch.
 */
export class DominanceOrdering implements ProcessOrdering {
  readonly id = "dominance";

  order(_branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    const riskWeight = ctx.index.config.risk.aversion * Math.max(0, 1 - ctx.buffer);

    // Every coefficient a comparison can ask for, computed once per process.
    // Building them per comparison made the ordering cubic in the number of
    // processes and was measured at 83 % of the whole run time with sixty of
    // them.
    const keys = new Set<string>();
    for (const process of ctx.available) {
      for (const type of Object.keys(process.capacityPerOutput)) keys.add(`a:${type}`);
      for (const id of Object.keys(process.intermediatesPerOutput)) keys.add(`s:${id}`);
    }
    const order = [...keys];

    const costs = ctx.available.map((process) => {
      const risk = 1 / Math.max(1e-12, 1 - riskWeight * exposureMagnitude(process));
      // A fish is still a fish (E29): searching falls on the labour and the
      // ground, never on how much of the quarry a unit of output needs.
      const effort = ctx.effort(process);
      return order.map((key) => {
        if (key.startsWith("a:")) {
          const type = key.slice(2);
          const base = process.capacityPerOutput[type] ?? 0;
          if (base === 0) return 0;
          const factor = 1 - process.qualityWeight + process.qualityWeight * ctx.quality(type);
          return (base * risk * effort) / Math.max(1e-12, factor);
        }
        const id = key.slice(2);
        const per = process.intermediatesPerOutput[id] ?? 0;
        const quarry = ctx.index.stock.get(id)?.regrowth !== undefined;
        return per * risk * (quarry ? 1 : effort);
      });
    });

    // The relation once, then a count of dominators per process — quadratic
    // instead of re-scanning everyone in every round.
    const n = ctx.available.length;
    const beaten: number[][] = Array.from({ length: n }, () => []);
    const dominators = new Array<number>(n).fill(0);
    for (let a = 0; a < n; a += 1) {
      for (let b = 0; b < n; b += 1) {
        if (a !== b && dominates(costs[a] ?? [], costs[b] ?? [])) {
          beaten[a]?.push(b);
          dominators[b] = (dominators[b] ?? 0) + 1;
        }
      }
    }

    const preference = (a: number, b: number): number => {
      const pa = ctx.available[a];
      const pb = ctx.available[b];
      if (pa === undefined || pb === undefined) return 0;
      const risk = riskWeight * (exposureMagnitude(pa) - exposureMagnitude(pb));
      if (Math.abs(risk) > 1e-12) return risk;
      return pb.priority - pa.priority;
    };

    const taken = new Array<boolean>(n).fill(false);
    const ordered: ProcessDef[] = [];
    for (let step = 0; step < n; step += 1) {
      let best: number | undefined;
      for (let i = 0; i < n; i += 1) {
        if (taken[i] === true || (dominators[i] ?? 0) > 0) continue;
        if (best === undefined || preference(i, best) < 0) best = i;
      }
      // Everything left is dominated by something left: a cycle cannot arise
      // from a partial order, but take the rest by preference rather than stall.
      if (best === undefined) {
        for (let i = 0; i < n; i += 1) {
          if (taken[i] === true) continue;
          if (best === undefined || preference(i, best) < 0) best = i;
        }
      }
      if (best === undefined) break;
      taken[best] = true;
      const process = ctx.available[best];
      if (process !== undefined) ordered.push(process);
      for (const other of beaten[best] ?? []) {
        dominators[other] = (dominators[other] ?? 0) - 1;
      }
    }

    // "Risk" only when the discount actually changed who leads — otherwise the
    // declared routine explains it, and saying otherwise would mislead.
    const byRoutine = [...ctx.available].sort((a, b) => b.priority - a.priority);
    const led = ordered[0];
    const wouldLead = byRoutine.find((p) => ordered.includes(p));
    const reason: OrderingReason =
      riskWeight > 0 && led !== undefined && wouldLead !== undefined && led.id !== wouldLead.id
        ? { kind: "risk", buffer: ctx.buffer }
        : { kind: "declared" };

    return { processes: ordered, reason };
  }
}

/**
 * Does `a` need no more of every input than `b`, and less of at least one?
 *
 * Inputs only one of them uses count too — needing an input the other does not
 * is needing more of it. So two processes on different ground never dominate
 * each other, which is what lets both of them run.
 *
 * Compared on **risk-adjusted** coefficients: a process that fails often costs
 * more per unit *delivered*, because the ground and the labour are spent in the
 * failed years too. That is the same reasoning as a shock (E24 — risk as named
 * random streams), taken as an expectation instead of as a draw. And it is what
 * the old rule already did to labour: ordering by yield per labour times
 * `1 - weight × exposure` is ordering by the labour coefficient divided by it.
 * Only now every input is treated that way, not labour alone.
 */
function dominates(a: readonly number[], b: readonly number[]): boolean {
  let strictly = false;
  for (let i = 0; i < a.length; i += 1) {
    const one = a[i] ?? 0;
    const two = b[i] ?? 0;
    if (one > two + 1e-12) return false;
    if (one < two - 1e-12) strictly = true;
  }
  return strictly;
}

/**
 * Picks the source (E5).
 *
 * The interface stays, with more than one implementation behind it, so that
 * switching later is a line of configuration and not a rebuild (E23).
 *
 * Setting the order by hand used to be one of the sources and was measured out:
 * where it chose between processes that do not dominate each other it changed
 * **nothing** — the plan converges on the same allocation whatever it starts
 * from — and where it put a dominated process first it cost 39 % of the
 * population. A lever that can only do harm is neither playable nor
 * instructive, and as a *choice* between hunting and farming it would teach the
 * opposite of Boserup, on whom the model rests.
 */
export class OrderingResolver {
  readonly #computed = new DominanceOrdering();
  readonly #declared = new DeclaredOrdering();

  resolve(branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    if (ctx.available.length === 0) {
      return { processes: [], reason: { kind: "declared" } };
    }
    if (ctx.index.config.risk.aversion < 0) {
      return this.#declared.order(branch, ctx);
    }
    return this.#computed.order(branch, ctx);
  }
}

export const ORDERING_RESOLVER = new OrderingResolver();

export function branchOf(config: Config, id: BranchId): BranchDef | undefined {
  return config.branches.find((branch) => branch.id === id);
}
