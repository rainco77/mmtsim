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
  /** Output per unit of labour, including everything up the chain (E4). */
  yieldPerLabor(process: ProcessDef): number;
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
 * Ordered by **output per unit of labour**, less a risk discount weighted by how
 * thin the buffer is (E5).
 *
 * Labour is the one input every process needs; every other is a capacity of its
 * own. So the greedy answer to "cover the need with the least labour" is: the
 * labour-richest process first, limited by *its* capacity, then the next takes
 * what is left. Hunting runs until the wilderness is used up, farming absorbs
 * the rest — both at once, and the share shifts monotonically as the population
 * grows. That is Boserup as a shifting mix, not as a flip.
 *
 * It is stable because the order depends on nothing the allocation itself
 * changes: yield per labour is a property of the process.
 *
 * Processes that trade land productivity — irrigated against dry fields — are
 * not ranked against each other at all: they are told apart by their **area
 * type**, so each runs on its own ground, and the decision is whether to build
 * the canals (E13).
 */
export class LaborYieldOrdering implements ProcessOrdering {
  readonly id = "laborYield";

  order(_branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    const riskWeight = ctx.index.config.risk.aversion * Math.max(0, 1 - ctx.buffer);

    const scored = ctx.available.map((process) => {
      const plain = ctx.yieldPerLabor(process);
      return {
        process,
        plain,
        score: plain * Math.max(0, 1 - riskWeight * exposureMagnitude(process)),
      };
    });
    scored.sort((a, b) => b.score - a.score);

    // "Risk" only when the discount actually changed who leads — otherwise
    // labour alone explains it, and saying otherwise would mislead.
    const winner = scored[0];
    const withoutRisk = [...scored].sort((a, b) => b.plain - a.plain)[0];
    const reason: OrderingReason =
      winner !== undefined &&
      withoutRisk !== undefined &&
      winner.process.id !== withoutRisk.process.id
        ? { kind: "risk", buffer: ctx.buffer }
        : { kind: "labor" };

    return { processes: scored.map((entry) => entry.process), reason };
  }
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
  readonly #computed = new LaborYieldOrdering();
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
