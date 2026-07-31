import type { BranchDef, Config, ConfigIndex, ProcessDef } from "./config.ts";
import type { BranchId, ProcessId } from "./ids.ts";
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
  | { readonly kind: "manual" }
  | { readonly kind: "labor" }
  | { readonly kind: "risk"; readonly buffer: number };

export interface OrderingContext {
  readonly index: ConfigIndex;
  readonly available: readonly ProcessDef[];
  /** Stock over need at the lowest rank; thin means risk hurts (E5). */
  readonly buffer: number;
  /** Land quality of one area type — poor ground means more acres (E13). */
  quality(areaType: string): number;
  readonly manual: readonly ProcessId[] | undefined;
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

/** What the player set for this branch. Absent means: let it be computed. */
export class ManualOrdering implements ProcessOrdering {
  readonly id = "manual";

  order(_branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    const wanted = ctx.manual ?? [];
    const rank = new Map(wanted.map((id, i) => [id, i]));
    const processes = [...ctx.available].sort((a, b) => {
      const ra = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const rb = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ra === rb ? b.priority - a.priority : ra - rb;
    });
    return { processes, reason: { kind: "manual" } };
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
 * measured to pick the technique that produced 43 % less from the same hectare,
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

    // Where dominance is silent: the less exposed process first while the store
    // is thin, otherwise what the content declares — the routine (E5).
    const preference = (a: ProcessDef, b: ProcessDef): number => {
      const risk =
        riskWeight * (exposureMagnitude(a) - exposureMagnitude(b));
      if (Math.abs(risk) > 1e-12) return risk;
      return b.priority - a.priority;
    };

    const rest = [...ctx.available];
    const effective = (process: ProcessDef): number =>
      1 / Math.max(1e-12, 1 - riskWeight * exposureMagnitude(process));
    const ordered: ProcessDef[] = [];
    while (rest.length > 0) {
      // Anything nothing else dominates may go next; among those, preference.
      const free = rest.filter(
        (one) => !rest.some((other) => dominates(other, one, effective, ctx)),
      );
      const pool = free.length > 0 ? free : rest;
      const next = [...pool].sort(preference)[0];
      if (next === undefined) break;
      ordered.push(next);
      rest.splice(rest.indexOf(next), 1);
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
 * more per unit *delivered*, because the acres and the labour are spent in the
 * failed years too. That is the same reasoning as a shock (E24 — risk as named
 * random streams), taken as an expectation instead of as a draw. And it is what
 * the old rule already did to labour: ordering by yield per labour times
 * `1 - weight × exposure` is ordering by the labour coefficient divided by it.
 * Only now every input is treated that way, not labour alone.
 */
function dominates(
  a: ProcessDef,
  b: ProcessDef,
  effective: (process: ProcessDef) => number,
  ctx: OrderingContext,
): boolean {
  const ra = effective(a);
  const rb = effective(b);
  let strictly = false;
  for (const type of new Set([
    ...Object.keys(a.areaPerOutput),
    ...Object.keys(b.areaPerOutput),
  ])) {
    const factor = ctx.quality(type);
    const one =
      ((a.areaPerOutput[type] ?? 0) * ra) /
      Math.max(1e-12, 1 - a.qualityWeight + a.qualityWeight * factor);
    const two =
      ((b.areaPerOutput[type] ?? 0) * rb) /
      Math.max(1e-12, 1 - b.qualityWeight + b.qualityWeight * factor);
    if (one > two + 1e-12) return false;
    if (one < two - 1e-12) strictly = true;
  }
  for (const id of new Set([
    ...Object.keys(a.intermediatesPerOutput),
    ...Object.keys(b.intermediatesPerOutput),
  ])) {
    const one = (a.intermediatesPerOutput[id] ?? 0) * ra;
    const two = (b.intermediatesPerOutput[id] ?? 0) * rb;
    if (one > two + 1e-12) return false;
    if (one < two - 1e-12) strictly = true;
  }
  return strictly;
}

/**
 * Picks the source (E5): the player's hand if he set this branch **and** the
 * rule still allows it, otherwise the computation.
 *
 * Both paths exist from the first day; only one is active. Switching later is
 * therefore a line of configuration (E23).
 */
export class OrderingResolver {
  readonly #manual = new ManualOrdering();
  readonly #computed = new DominanceOrdering();
  readonly #declared = new DeclaredOrdering();

  resolve(
    branch: BranchDef,
    ctx: OrderingContext,
    manualAllowed: boolean,
  ): OrderedProcesses {
    if (ctx.available.length === 0) {
      return { processes: [], reason: { kind: "declared" } };
    }
    if (manualAllowed && ctx.manual !== undefined && ctx.manual.length > 0) {
      return this.#manual.order(branch, ctx);
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
