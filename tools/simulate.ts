import { STAGE1 } from "../src/content/stage1.ts";
import { EagerPolicy, PassivePolicy } from "../src/policy/bots/index.ts";
import type { Policy } from "../src/policy/policy.ts";
import {
  apply,
  createState,
  derive,
  indexConfig,
  tick,
  type GameState,
} from "../src/sim/index.ts";

/**
 * Headless runs (T4, E27).
 *
 * The same seed makes comparisons exact: two runs differ only by the number
 * that was changed. Many seeds make them dependable — a balance that holds at
 * seed 42 can fail at seed 7, and at fractions of a second per run a hundred
 * seeds are free.
 *
 *   node tools/simulate.ts --ticks 400 --seeds 20 --policy eager
 */

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]?.replace(/^--/, "");
  const value = process.argv[i + 1];
  if (key !== undefined && value !== undefined) args.set(key, value);
}

const ticks = Number(args.get("ticks") ?? 400);
const seeds = Number(args.get("seeds") ?? 1);
const policyName = args.get("policy") ?? "eager";
const trace = args.has("trace");

const POLICIES: Record<string, Policy> = {
  passive: new PassivePolicy(),
  eager: new EagerPolicy(),
};

function pickPolicy(name: string): Policy {
  const found = POLICIES[name];
  if (found === undefined) {
    process.stderr.write(
      `unknown policy "${name}" (have: ${Object.keys(POLICIES).join(", ")})\n`,
    );
    process.exit(1);
  }
  return found;
}

const policy = pickPolicy(policyName);

const index = indexConfig(STAGE1);

interface RunResult {
  readonly seed: number;
  readonly finalPopulation: number;
  readonly peakPopulation: number;
  readonly abandonedAt: number | null;
  readonly completed: readonly string[];
  /** How often each input was the binding one — the check on E6. */
  readonly bindingHistogram: Readonly<Record<string, number>>;
  readonly laborWasted: number;
}

function run(seed: number): RunResult {
  let state: GameState = createState(STAGE1, { seed });
  let peak = state.sectors["households"]?.heads ?? 0;
  let abandonedAt: number | null = null;
  let laborWasted = 0;
  const binding: Record<string, number> = {};

  for (let step = 0; step < ticks; step += 1) {
    const derived = derive(state, index);
    if (derived.communityGivenUp && abandonedAt === null) abandonedAt = state.tick;

    const key =
      derived.binding.kind === "none"
        ? "none"
        : `${derived.binding.kind}:${derived.binding.what ?? ""}`;
    binding[key] = (binding[key] ?? 0) + 1;
    laborWasted += derived.laborUnused;

    if (trace) {
      process.stdout.write(
        JSON.stringify({
          tick: derived.tick,
          heads: round(derived.heads),
          food: round(derived.stocks["food"] ?? 0),
          cov: Object.fromEntries(
            Object.entries(derived.coverage).map(([k, v]) => [k, round(v)]),
          ),
          binding: key,
          unused: round(derived.laborUnused),
        }) + "\n",
      );
    }

    for (const action of policy.decide(state, derived, index)) {
      state = apply(state, action, index).state;
    }
    state = tick(state, index);
    peak = Math.max(peak, state.sectors["households"]?.heads ?? 0);
  }

  return {
    seed,
    finalPopulation: round(state.sectors["households"]?.heads ?? 0),
    peakPopulation: round(peak),
    abandonedAt,
    completed: Object.keys(state.completedProjects),
    bindingHistogram: binding,
    laborWasted: round(laborWasted),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

const results = Array.from({ length: seeds }, (_, i) => run(42 + i));
process.stdout.write(
  JSON.stringify({ ticks, policy: policyName, results }, null, 2) + "\n",
);
