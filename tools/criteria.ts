import { STAGE1 } from "../src/content/stage1.ts";
import { EagerPolicy, PassivePolicy } from "../src/policy/bots/index.ts";
import type { Policy } from "../src/policy/policy.ts";
import { apply, createState, derive, indexConfig, tick } from "../src/sim/index.ts";

/**
 * Balancing is a measurement, not an impression (E27). Checked against the
 * criteria that follow from the decisions, over many seeds — a balance that
 * holds at seed 42 can fail at seed 7.
 *
 *   node tools/criteria.ts --ticks 600 --seeds 40
 */

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]?.replace(/^--/, "");
  const value = process.argv[i + 1];
  if (key !== undefined && value !== undefined) args.set(key, value);
}
const TICKS = Number(args.get("ticks") ?? 600);
const SEEDS = Number(args.get("seeds") ?? 40);

const index = indexConfig(STAGE1);

interface Trace {
  readonly finalHeads: number;
  readonly peakHeads: number;
  readonly bindings: readonly string[];
  readonly idleShare: number;
  readonly sedentismAt: number | null;
  readonly satietyLow: number;
  readonly satietyRecovered: boolean;
  readonly abandoned: boolean;
  readonly farmingShareEnd: number;
}

function play(seed: number, policy: Policy): Trace {
  let state = createState(STAGE1, { seed });
  const bindings: string[] = [];
  let idle = 0;
  let available = 0;
  let peak = 0;
  let sedentismAt: number | null = null;
  let satietyLow = 1;
  let recovered = false;
  let sawLow = false;
  let abandoned = false;
  let farmingShare = 0;

  for (let i = 0; i < TICKS; i += 1) {
    const d = derive(state, index);
    bindings.push(
      d.binding.kind === "none" ? "none" : `${d.binding.kind}:${d.binding.what ?? ""}`,
    );
    idle += d.laborUnused;
    available += d.laborPerformance;
    peak = Math.max(peak, d.heads);
    if (d.settlementAbandoned) abandoned = true;
    if (sedentismAt === null && (state.completedProjects["sedentism"] ?? 0) > 0) {
      sedentismAt = state.tick;
    }
    const satiety = d.coverage["food_satiety"] ?? 1;
    if (sedentismAt !== null) {
      satietyLow = Math.min(satietyLow, satiety);
      if (satiety < 0.6) sawLow = true;
      if (sawLow && satiety > 0.9) recovered = true;
    }
    farmingShare = d.runs
      .filter((r) => r.process.startsWith("farming"))
      .reduce((sum, r) => sum + r.share, 0);

    for (const action of policy.decide(state, d, index)) {
      state = apply(state, action, index).state;
    }
    state = tick(state, index);
  }

  return {
    finalHeads: state.sectors["households"]?.heads ?? 0,
    peakHeads: peak,
    bindings,
    idleShare: available > 0 ? idle / available : 0,
    sedentismAt,
    satietyLow,
    satietyRecovered: recovered,
    abandoned,
    farmingShareEnd: farmingShare,
  };
}

const eager = Array.from({ length: SEEDS }, (_, i) =>
  play(101 + i * 13, new EagerPolicy()),
);
const passive = Array.from({ length: SEEDS }, (_, i) =>
  play(101 + i * 13, new PassivePolicy()),
);

const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const share = (xs: readonly boolean[]) => xs.filter(Boolean).length / (xs.length || 1);

const distinctBindings = eager.map((t) => new Set(t.bindings).size);
const eagerFinal = eager.map((t) => t.finalHeads);
const passiveFinal = passive.map((t) => t.finalHeads);

const report = {
  ticks: TICKS,
  seeds: SEEDS,
  criteria: {
    "E6 — binding input changes over the run": {
      distinctBindingsMean: round(mean(distinctBindings)),
      runsWithAtLeastTwo: round(share(distinctBindings.map((n) => n >= 2))),
      pass: share(distinctBindings.map((n) => n >= 2)) > 0.9,
    },
    "E7/E20 — the trap bites and lets go": {
      satietyLowMean: round(mean(eager.map((t) => t.satietyLow))),
      recoveredShare: round(share(eager.map((t) => t.satietyRecovered))),
      pass: mean(eager.map((t) => t.satietyLow)) < 0.6,
    },
    "E6/E13 — intensification wins in the end": {
      farmingShareEndMean: round(mean(eager.map((t) => t.farmingShareEnd))),
      pass: mean(eager.map((t) => t.farmingShareEnd)) > 0.5,
    },
    "T4 — decisions matter": {
      eagerFinalMean: round(mean(eagerFinal)),
      passiveFinalMean: round(mean(passiveFinal)),
      ratio: round(mean(eagerFinal) / Math.max(1, mean(passiveFinal))),
      pass: mean(eagerFinal) > mean(passiveFinal) * 1.5,
    },
    "E20 — no state without a way back": {
      abandonedShareEager: round(share(eager.map((t) => t.abandoned))),
      pass: share(eager.map((t) => t.abandoned)) < 0.05,
    },
    "E10 — labour is not idle en masse": {
      idleShareMean: round(mean(eager.map((t) => t.idleShare))),
      pass: mean(eager.map((t) => t.idleShare)) < 0.35,
    },
    "pacing — stage one is short": {
      sedentismAtMean: round(mean(eager.map((t) => t.sedentismAt ?? TICKS))),
      neverSettled: round(share(eager.map((t) => t.sedentismAt === null))),
      pass: mean(eager.map((t) => t.sedentismAt ?? TICKS)) < TICKS * 0.3,
    },
    "scale — the population stays readable": {
      finalMean: round(mean(eagerFinal)),
      peakMax: round(Math.max(...eager.map((t) => t.peakHeads))),
      pass: Math.max(...eager.map((t) => t.peakHeads)) < 5000,
    },
  },
};

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
