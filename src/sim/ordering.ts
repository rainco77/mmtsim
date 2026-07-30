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
  | { readonly kind: "binding"; readonly input: string }
  | { readonly kind: "risk"; readonly buffer: number };

export interface OrderingContext {
  readonly index: ConfigIndex;
  readonly available: readonly ProcessDef[];
  /** How tight each input was last tick, in [0, 1] (E5: yesterday's scarcity). */
  readonly scarcity: Readonly<Record<string, number>>;
  /** Stock over need at the lowest rank; thin means risk hurts (E5). */
  readonly buffer: number;
  /** Which input counted as scarce last tick; it keeps its place (E5). */
  readonly heldInput: string | undefined;
  /** Which process led last tick — it keeps the lead when the input changed. */
  readonly lead: ProcessId | undefined;
  /** How much of the binding input a process needs per unit of output. */
  bindingCost(process: ProcessDef, input: string): number;
  readonly manual: readonly ProcessId[] | undefined;
}

/** The order stated in the content. First tick, and fallback (E5). */
export class DeclaredOrdering implements ProcessOrdering {
  readonly id = "declared";

  order(branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    void branch;
    return {
      processes: [...ctx.available].sort((a, b) => b.priority - a.priority),
      reason: { kind: "declared" },
    };
  }
}

/** What the player set for this branch. Absent means: let it be computed. */
export class ManualOrdering implements ProcessOrdering {
  readonly id = "manual";

  order(branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    void branch;
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
 * Ordered by yield in the **binding** input, less a risk discount weighted by
 * how thin the buffer is (E5).
 *
 * A fixed order cannot be right for every situation, because the binding input
 * wanders (E6): with land to spare and labour scarce, hunting is right; with
 * land scarce, farming is. Forcing farming would have the settlement work itself
 * into hunger while the forest lies idle.
 */
export class ScarcityOrdering implements ProcessOrdering {
  readonly id = "scarcity";

  order(branch: BranchDef, ctx: OrderingContext): OrderedProcesses {
    void branch;
    const config = ctx.index.config;
    const input = tightestInput(ctx.scarcity, ctx.heldInput, config.risk.switchMargin);
    if (input === undefined) return new DeclaredOrdering().order(branch, ctx);

    const riskWeight = config.risk.aversion * Math.max(0, 1 - ctx.buffer);

    const scored = ctx.available.map((process) => ({
      process,
      score: score(process, input, riskWeight, ctx),
      plain: score(process, input, 0, ctx),
    }));
    scored.sort((a, b) => b.score - a.score);

    // Stickiness **only when the scarce input has just changed.** Each choice
    // relieves its own shortage, so without this the economy swings between two
    // processes for ever. But under an unchanged input the best simply wins:
    // otherwise a newly unlocked technique, often only twenty per cent better,
    // would never be adopted at all.
    const inputChanged = ctx.heldInput !== undefined && ctx.heldInput !== input;
    const leader = scored[0];
    if (inputChanged && ctx.lead !== undefined && leader?.process.id !== ctx.lead) {
      const held = scored.find((entry) => entry.process.id === ctx.lead);
      if (
        held !== undefined &&
        leader !== undefined &&
        leader.score < held.score * (1 + config.risk.switchMargin)
      ) {
        scored.splice(scored.indexOf(held), 1);
        scored.unshift(held);
      }
    }

    // The reason is "risk" only when the discount actually changed who leads —
    // otherwise scarcity alone explains it, and saying otherwise would mislead.
    const winner = scored[0];
    const withoutRisk = [...scored].sort((a, b) => b.plain - a.plain)[0];
    const reason: OrderingReason =
      winner !== undefined &&
      withoutRisk !== undefined &&
      winner.process.id !== withoutRisk.process.id
        ? { kind: "risk", buffer: ctx.buffer }
        : { kind: "binding", input };

    return { processes: scored.map((entry) => entry.process), reason };
  }
}

function score(
  process: ProcessDef,
  input: string,
  riskWeight: number,
  ctx: OrderingContext,
): number {
  const cost = ctx.bindingCost(process, input);
  if (!Number.isFinite(cost)) return 0;
  // A process that does not touch the scarce input at all is the best possible
  // answer to that scarcity — not the worst. Farming needs no wilderness, so
  // once the forest runs out it must win, and that is exactly Boserup.
  const yieldPerUnit = cost <= 0 ? Number.MAX_SAFE_INTEGER : 1 / cost;
  return yieldPerUnit * Math.max(0, 1 - riskWeight * exposureMagnitude(process));
}

/**
 * The input that counts as scarce. The one held so far keeps its place unless a
 * challenger clears the margin — relieving a shortage makes it stop binding, and
 * without this the choice would swing back every tick.
 */
export function tightestInput(
  scarcity: Readonly<Record<string, number>>,
  held: string | undefined,
  margin: number,
): string | undefined {
  let best: string | undefined;
  let value = 0;
  for (const [input, tightness] of Object.entries(scarcity)) {
    if (tightness > value) {
      value = tightness;
      best = input;
    }
  }
  if (best === undefined) return held;
  if (held === undefined || held === best) return best;

  const heldValue = scarcity[held] ?? 0;
  return value > heldValue * (1 + margin) ? best : held;
}

/**
 * Picks the source (E5): the player's hand if he set this branch **and** the
 * rule still allows it, otherwise the computation, otherwise what the content
 * declared.
 *
 * Both paths exist from the first day; only one is active. Switching later is
 * therefore a line of configuration.
 */
export class OrderingResolver {
  readonly #manual = new ManualOrdering();
  readonly #scarcity = new ScarcityOrdering();
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
    if (ctx.index.config.risk.aversion >= 0 && Object.keys(ctx.scarcity).length > 0) {
      return this.#scarcity.order(branch, ctx);
    }
    return this.#declared.order(branch, ctx);
  }
}

export const ORDERING_RESOLVER = new OrderingResolver();

export function branchOf(config: Config, id: BranchId): BranchDef | undefined {
  return config.branches.find((branch) => branch.id === id);
}
