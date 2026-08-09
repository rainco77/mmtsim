import { STAGE1 } from "../src/content/stage1.ts";
import { StillPolicy, MovingPolicy, BuildingPolicy, ThoroughPolicy } from "../src/policy/plays/index.ts";
import type { Policy } from "../src/policy/policy.ts";
import {
  apply,
  createState,
  derive,
  indexConfig,
  tick,
  totalHeads,
  type Action,
  type ConfigIndex,
  type Derived,
  type GameState,
} from "../src/sim/index.ts";

/**
 * The measuring stand: what the epoch's story says should happen, read off runs
 * (E27, E29, E30).
 *
 *   node tools/measure.ts --seeds 8 --cap 600
 *
 * **Three strategies, and the difference between them is the measurement.**
 * `still` does nothing at all and is the zero point; `moving` only walks away
 * from a spent range; `building` also builds. A claim about what moving is
 * worth is the difference between the first two, and a claim about what
 * progress is worth is the difference between the last two. One run on its own
 * says nothing about either.
 *
 * **Most of what it prints is a reading and not a verdict.** A verdict needs a
 * boundary, and most of the story's claims are deliberately unquantified — "a
 * large part of the hands", "good ticks leave some free". Those are printed for
 * a person to judge. Only where the boundary follows from the story itself does
 * this file pass or fail: nobody is given up, progress shows up in heads, no
 * stand is run into the ground, and every need claims roughly the share of the
 * work it is meant to.
 */

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]?.replace(/^--/, "");
  const value = process.argv[i + 1];
  if (key !== undefined && value !== undefined) args.set(key, value);
}
const SEEDS = Number(args.get("seeds") ?? 8);
/** How long a run may go on when nothing ends it. */
const CAP = Number(args.get("cap") ?? 600);
/**
 * The window the resting level is read from — long enough past the opening to
 * be a rest, short enough to be inside an epoch. Beyond it a strategy that
 * keeps moving has spent the good country of the world (E13), and a strategy
 * that has settled is running on content that does not exist yet, so neither
 * says anything about this epoch any more.
 */
const REST_FROM = Number(args.get("from") ?? 100);
const REST_TO = Number(args.get("to") ?? 200);

const index = indexConfig(STAGE1);

// ---------------------------------------------------------------- what a run is

interface Row {
  readonly tick: number;
  readonly heads: number;
  readonly idle: number;
  /** Ranges taken so far — a step up marks the tick after a move. */
  readonly takings: number;
  readonly comfort: number;
  readonly hunger: number;
  readonly density: number;
  readonly thinnest: number;
  /** Food lying in store at the end of the tick. */
  readonly food: number;
}

/**
 * A setback and what became of it: the heads before it, the trough after, and
 * when the community was back within a twentieth of where it stood. A run of
 * hungry ticks counts once — the player lives through one bad patch, not five.
 */
interface Setback {
  readonly at: number;
  readonly depth: number;
  readonly recoveredAfter: number | null;
  readonly nextAfter: number | null;
}

function setbacksIn(rows: readonly Row[]): Setback[] {
  const starts: number[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    if ((rows[i]?.hunger ?? 1) < 0.999 && (rows[i - 1]?.hunger ?? 1) >= 0.999) starts.push(i);
  }
  return starts.map((at, k) => {
    const before = rows[at - 1]?.heads ?? 0;
    let trough = before;
    let troughAt = at;
    for (let i = at; i < Math.min(rows.length, at + 40); i += 1) {
      const heads = rows[i]?.heads ?? 0;
      if (heads < trough) {
        trough = heads;
        troughAt = i;
      }
    }
    let recoveredAfter: number | null = null;
    for (let i = troughAt; i < rows.length; i += 1) {
      if ((rows[i]?.heads ?? 0) >= before * 0.95) {
        recoveredAfter = i - at;
        break;
      }
    }
    const next = starts[k + 1];
    return {
      at,
      depth: before > 0 ? 1 - trough / before : 0,
      recoveredAfter,
      nextAfter: next === undefined ? null : next - at,
    };
  });
}

/** Of these setbacks, how many were made good before the next one began. */
function gotOverInTime(all: readonly Setback[]): number {
  if (all.length === 0) return 1;
  const done = all.filter(
    (s) => s.recoveredAfter !== null && (s.nextAfter === null || s.recoveredAfter < s.nextAfter),
  ).length;
  return done / all.length;
}

interface Trace {
  readonly seed: number;
  readonly rows: readonly Row[];
  readonly moves: number;
  readonly projectsDone: number;
  readonly sedentismAt: number | null;
  readonly pitAt: number | null;
  readonly abandoned: boolean;
  readonly headsAtSedentism: number;
  /** Every project that was ever on the screen, grey or not. */
  readonly seen: ReadonlySet<string>;
  /** Labour into each process, summed over the run — for the roads that must stay open. */
  readonly labour: Readonly<Record<string, number>>;
  /** Completions per project when the run ended. */
  readonly built: Readonly<Record<string, number>>;
  /** Renewable stands something actually took from, over the whole run. */
  readonly drawn: ReadonlySet<string>;
  /** Food in store and the hunger tier's asking at the settling tick. */
  readonly settleFoodStore: number;
  readonly settleHungerNeed: number;
  /** Tick each project first completed, for the roads that open mid-run. */
  readonly doneAt: Readonly<Record<string, number>>;
}

function play(seed: number, policy: Policy, settle = true, forbid?: string): Trace {
  let state = createState(STAGE1, { seed });
  const rows: Row[] = [];
  let sedentismAt: number | null = null;
  let pitAt: number | null = null;
  let headsAtSedentism = 0;
  let settleFoodStore = 0;
  let settleHungerNeed = 0;
  const seen = new Set<string>();
  const labour: Record<string, number> = {};
  const drawn = new Set<string>();
  const doneAt: Record<string, number> = {};

  for (let i = 0; i < CAP; i += 1) {
    const d = derive(state, index);
    if (d.communityGivenUp) break;
    // **A run ends with the settling.** What comes after belongs to a stage
    // whose content does not exist yet, and averaging it in only falsifies.
    if ((state.completedProjects["sedentism"] ?? 0) > 0) {
      sedentismAt = state.tick;
      headsAtSedentism = totalHeads(state.sectors["households"]!.cohorts);
      settleFoodStore = state.sectors["households"]!.stocks["food"] ?? 0;
      settleHungerNeed = d.tiers.find((t) => t.tier === "food_survival")?.need ?? 0;
      break;
    }

    for (const action of policy.decide(state, d, index)) {
      // Held back rather than filtered inside the strategy, so the same written
      // rule is measured either way and only the horizon differs.
      if (!settle && action.type === "startProject" && action.id === "sedentism") continue;
      if (forbid !== undefined && action.type === "startProject" && action.id === forbid) continue;
      const result = apply(state, action, index);
      if (result.rejected === undefined) state = result.state;
    }

    if (pitAt === null && (state.completedProjects["storage_pit"] ?? 0) > 0) pitAt = state.tick;

    const after = derive(state, index);
    for (const project of after.projects) if (project.visible) seen.add(project.id);
    for (const run of after.runs) {
      labour[run.process] = (labour[run.process] ?? 0) + run.labor;
      if (run.output <= 0) continue;
      const def = index.process.get(run.process);
      if (def === undefined) continue;
      for (const input of Object.keys(def.intermediatesPerOutput)) {
        if (after.renewable[input] !== undefined) drawn.add(input);
      }
    }
    for (const [id, count] of Object.entries(state.completedProjects)) {
      if (count > 0 && doneAt[id] === undefined) doneAt[id] = state.tick;
    }
    const shares: number[] = [];
    for (const stand of Object.values(after.renewable)) {
      if (stand !== undefined && stand.ceiling > 0) shares.push(stand.held / stand.ceiling);
    }
    rows.push({
      tick: state.tick,
      heads: totalHeads(state.sectors["households"]!.cohorts),
      idle: after.laborPerformance > 0 ? after.laborUnused / after.laborPerformance : 0,
      takings: state.landTakings,
      comfort: after.coverage["warmth_comfort"] ?? 0,
      hunger: after.coverage["food_survival"] ?? 1,
      density: shares.length > 0 ? shares.reduce((a, b) => a + b, 0) / shares.length : 1,
      thinnest: shares.length > 0 ? Math.min(...shares) : 1,
      food: after.stocks["food"] ?? 0,
    });
    state = tick(state, index);
  }

  const last = derive(state, index);
  return {
    seed,
    rows,
    moves: state.landTakings,
    projectsDone: Object.keys(state.completedProjects).length,
    sedentismAt,
    pitAt,
    abandoned: last.communityGivenUp,
    headsAtSedentism,
    seen,
    labour,
    built: { ...state.completedProjects },
    drawn,
    settleFoodStore,
    settleHungerNeed,
    doneAt,
  };
}

// ------------------------------------------------------------------- small help

const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
const round = (x: number, places = 2): number => Number(x.toFixed(places));
const late = (t: Trace): readonly Row[] =>
  t.rows.filter((r) => r.tick >= REST_FROM && r.tick <= REST_TO);
const pct = (x: number): string => `${(x * 100).toFixed(1)} %`;
const median = (xs: readonly number[]): number => {
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted.length === 0 ? 0 : (sorted[Math.floor(sorted.length / 2)] ?? 0);
};

// -------------------------------------------------------------- the three plays

/**
 * Deliberately foolish: burns whenever the burn is on offer, everything else
 * as the eager builder. If this play ever beats the eager one, constant
 * burning is a winning move and the content owes a saturation.
 */
class BurnerPolicy implements Policy {
  readonly id = "burner";
  private readonly eager = new BuildingPolicy();

  decide(state: GameState, derived: Derived, index: ConfigIndex): readonly Action[] {
    const burn = derived.projects.find(
      (p) => p.id === "fire_setting" && p.available && !p.running,
    );
    if (burn !== undefined && state.activeProjects.length === 0) {
      return [{ type: "startProject", id: "fire_setting" }];
    }
    return this.eager.decide(state, derived, index);
  }
}

const seeds = Array.from({ length: SEEDS }, (_, i) => i + 1);
const still = seeds.map((s) => play(s, new StillPolicy()));
const moving = seeds.map((s) => play(s, new MovingPolicy()));
/** For the resting level: the same rule, but it does not end the epoch. */
const growing = seeds.map((s) => play(s, new BuildingPolicy(), false));
/** For the end of the epoch: the same rule, settling as soon as it can. */
const building = seeds.map((s) => play(s, new BuildingPolicy()));
/** Settles last: what of the tree can be lived before the epoch ends. */
const thorough = seeds.map((s) => play(s, new ThoroughPolicy()));
/** The tripwire: burning before everything. */
const burner = seeds.map((s) => play(s, new BurnerPolicy()));

const restingOf = (runs: readonly Trace[]): number => mean(runs.map((t) => mean(late(t).map((r) => r.heads))));
const startHeads = mean(still.map((t) => t.rows[0]?.heads ?? 0));

const verdicts: [string, boolean][] = [];
const judge = (what: string, pass: boolean): string => {
  verdicts.push([what, pass]);
  return pass ? "ja" : "NEIN";
};

console.log(`Seeds 1..${SEEDS}, up to tick ${CAP}, resting level read between ticks ${REST_FROM} and ${REST_TO}.\n`);

// ---------------------------------------------------------- 1: how it begins
console.log("== How it begins: the still play ==");
{
  const resting = restingOf(still);
  const rows = still.flatMap((t) => late(t));
  const back = still.flatMap((t) => setbacksIn(t.rows));
  const first = mean(still.map((t) => t.rows[0]?.density ?? 0));
  const settledDensity = mean(rows.map((r) => r.density));
  const idle = mean(rows.map((r) => r.idle));

  console.log(`Heads at the start               ${round(startHeads, 1)}`);
  console.log(
    `Resting level                    ${round(resting, 1)} ` +
      `(lowest ${round(mean(still.map((t) => Math.min(...late(t).map((r) => r.heads)))), 1)}, ` +
      `highest ${round(mean(still.map((t) => Math.max(...late(t).map((r) => r.heads)))), 1)})`,
  );
  console.log(
    `  against the start              ${pct(resting / Math.max(1e-9, startHeads))} — ` +
      `${judge("with no projects it rests at what it starts with", resting >= startHeads * 0.8 && resting <= startHeads * 1.2)}`,
  );
  console.log(
    `Density of the range             first tick ${round(first)} -> at rest ${round(settledDensity)} — ` +
      `${judge("the range thins instead of recovering", first >= settledDensity)}`,
  );
  console.log(`Idle hands on average            ${pct(idle)}`);
  console.log(`  ticks with more than 5 % free  ${pct(rows.filter((r) => r.idle > 0.05).length / Math.max(1, rows.length))}`);
  console.log(`Hunger ticks per hundred         ${round((rows.filter((r) => r.hunger < 0.999).length / Math.max(1, rows.length)) * 100, 1)}`);
  console.log(
    `Setbacks per run                 ${round(back.length / SEEDS, 1)}, mean depth ${pct(mean(back.map((b) => b.depth)))} of the heads`,
  );
  console.log(
    // The middling crisis has to be got over before the next one comes. A
    // share of all setbacks is a reading only: what drags it are double blows
    // landing inside a recovery — the very case the pit is dug for, so a
    // boundary on the share would demand of a pitless community what only the
    // pit delivers.
    (() => {
      const gap = median(back.filter((b) => b.nextAfter !== null).map((b) => b.nextAfter ?? 0));
      const recovery = median(
        back.filter((b) => b.recoveredAfter !== null).map((b) => b.recoveredAfter ?? 0),
      );
      return (
        `  gap / recovery, median         ${gap} against ${recovery} ticks — ` +
        `${judge("the middling crisis is got over before the next one comes", recovery < gap)}`
      );
    })(),
  );
  console.log(`  got over before the next       ${pct(gotOverInTime(back))}`);
  console.log(
    `Given up                         ${still.filter((t) => t.abandoned).length} of ${SEEDS} — ${judge("no community is given up for doing nothing", !still.some((t) => t.abandoned))}`,
  );
}

// ------------------------------------------------------------- 2: der Umzug
console.log("\n== What moving buys: moving against still — a reading, no verdict ==");
{
  const a = restingOf(still);
  const b = restingOf(moving);
  console.log(`Moves per run                    ${round(mean(moving.map((t) => t.moves)), 1)}`);
  console.log(`Resting level still              ${round(a, 1)}`);
  console.log(`Resting level moving             ${round(b, 1)}  (${b > a ? "+" : ""}${round(((b - a) / Math.max(1e-9, a)) * 100, 1)} %)`);
  console.log(`Density moving against still     ${round(mean(moving.map((t) => mean(late(t).map((r) => r.density)))))} against ${round(mean(still.map((t) => mean(late(t).map((r) => r.density)))))}`);
  console.log(`Given up                         ${moving.filter((t) => t.abandoned).length} of ${SEEDS}`);

  // The idle hands over the range cycle: free on fresh country, bound again as
  // it thins towards the next move. Read on the moving play, because only
  // there is the cycle lived. A reading for now; it becomes a verdict once
  // moving carries a community through, so the cycle exists long enough to be
  // judged.
  const fresh: number[] = [];
  const worn: number[] = [];
  let sinking = 0;
  let cycles = 0;
  for (const t of moving) {
    let from = 0;
    for (let i = 1; i <= t.rows.length; i += 1) {
      if (i < t.rows.length && t.rows[i]!.takings === t.rows[from]!.takings) continue;
      const segment = t.rows.slice(from, i);
      from = i;
      if (segment.length < 8 || segment[0]!.takings === 0) continue;
      const head = mean(segment.slice(0, 3).map((r) => r.idle));
      const tail = mean(segment.slice(-3).map((r) => r.idle));
      fresh.push(head);
      worn.push(tail);
      cycles += 1;
      if (head > tail) sinking += 1;
    }
  }
  // The boundary is the maintainer's criterion itself: hands are free on
  // fresh country and sink towards the next move — in most cycles, not in a
  // lucky few. Judged only once the cycle is lived often enough to be read.
  console.log(
    `Idle hands over the range cycle  fresh ${pct(mean(fresh))} -> before the move ${pct(mean(worn))}, ` +
      `sinking in ${sinking} of ${cycles} cycles (${pct(sinking / Math.max(1, cycles))}) — ` +
      `${judge("a move frees the hands, the wearing range binds them again", cycles >= 8 && mean(fresh) > mean(worn) && sinking / Math.max(1, cycles) >= 2 / 3)}`,
  );
}

// -------------------------------------------------------- 3: what progress buys
console.log("\n== What progress buys: building against moving ==");
{
  const a = restingOf(moving);
  const b = restingOf(growing);
  const settled = building.filter((t) => t.sedentismAt !== null);
  const beforePit = building.map(
    (t) => setbacksIn(t.rows).filter((s) => t.pitAt === null || s.at < t.pitAt).length,
  );
  console.log(`Projects per run                 ${round(mean(growing.map((t) => t.projectsDone)), 1)} of ${STAGE1.projects.length}`);
  console.log(`Resting level moving             ${round(a, 1)}`);
  console.log(`Resting level building           ${round(b, 1)}  — ${judge("progress shows up in heads", b > a)}`);
  console.log(
    `Settled                          ${settled.length} of ${SEEDS}` +
      (settled.length === 0
        ? ""
        : `, Tick ${Math.min(...settled.map((t) => t.sedentismAt ?? 0))}–${Math.max(...settled.map((t) => t.sedentismAt ?? 0))}`) +
      ` — ${judge("the epoch ends, no run gets stuck", settled.length === SEEDS)}`,
  );
  console.log(`  heads at settling              ${round(mean(settled.map((t) => t.headsAtSedentism)), 1)}`);
  console.log(`  crises on the way per run      ${round(mean(building.map((t) => setbacksIn(t.rows).length)), 1)}`);
  console.log(`  crises before the pit per run  ${round(mean(beforePit), 1)}`);
  console.log(`  of them got over before the next ${pct(gotOverInTime(building.flatMap((t) => setbacksIn(t.rows))))} (still: ${pct(gotOverInTime(still.flatMap((t) => setbacksIn(t.rows))))})`);
  console.log(`Given up before settling         ${building.filter((t) => t.abandoned && t.sedentismAt === null).length} of ${SEEDS}`);
}

// ------------------------------------------------ 3b: steht der Baum offen?
console.log("\n== The tree — a reading, no verdict ==");
{
  const everSeen = new Set<string>();
  for (const t of [...still, ...moving, ...growing, ...building]) for (const id of t.seen) everSeen.add(id);
  // What waits on the settling belongs to the next stage and cannot be seen in
  // this one, so it is not a gap in this tree.
  const afterSettling = (id: string): boolean =>
    (STAGE1.projects.find((p) => p.id === id)?.visibleWhen ?? []).some(
      (c) => c.kind === "rule" && c.id === "settled" && c.set,
    );
  const inEpoch = STAGE1.projects.map((p) => p.id).filter((id) => !afterSettling(id));
  const never = inEpoch.filter((id) => !everSeen.has(id));
  console.log(
    `Never visible, in any run        ${never.length} of ${inEpoch.length} of this epoch` +
      (never.length === 0 ? "" : `: ${never.join(", ")}`),
  );

  // Both clothing roads and the water's share — they only say something
  // once the tree is open, so no verdict here.
  const labourOf = (ids: readonly string[]): number =>
    growing.reduce((sum, t) => sum + ids.reduce((s, id) => s + (t.labour[id] ?? 0), 0), 0);
  const branchOf = (id: string): string => STAGE1.processes.find((p) => p.id === id)?.branch ?? "";
  const clothing = STAGE1.processes.filter((p) => branchOf(p.id) === "clothing").map((p) => p.id);
  const hides = clothing.filter((id) => (STAGE1.processes.find((p) => p.id === id)?.intermediatesPerOutput["hides"] ?? 0) > 0);
  const fibre = clothing.filter((id) => (STAGE1.processes.find((p) => p.id === id)?.intermediatesPerOutput["fibre"] ?? 0) > 0);
  const both = labourOf(hides) + labourOf(fibre);
  console.log(
    `Clothing from hides against fibre ${both <= 0 ? "—" : `${pct(labourOf(hides) / both)} to ${pct(labourOf(fibre) / both)}`}`,
  );
  const food = STAGE1.processes.filter((p) => branchOf(p.id) === "food").map((p) => p.id);
  const water = food.filter((id) => (STAGE1.processes.find((p) => p.id === id)?.capacityPerOutput["water"] ?? 0) > 0 ||
    ["fish", "shellfish"].some((s) => (STAGE1.processes.find((p) => p.id === id)?.intermediatesPerOutput[s] ?? 0) > 0));
  const allFood = labourOf(food);
  console.log(`Share of the water in the food   ${allFood <= 0 ? "—" : pct(labourOf(water) / allFood)}`);
}

// ------------------------------------------------------------ 4: the stocks
console.log("\n== The stocks ==");
{
  const inside = (t: Trace): readonly Row[] => t.rows.filter((r) => r.tick <= REST_TO);
  const perPlay: [string, readonly Trace[]][] = [
    ["still", still],
    ["moving", moving],
    ["building", growing],
  ];
  for (const [name, runs] of perPlay) {
    console.log(
      `Thinnest stand ${name.padEnd(18)} ${round(Math.min(...runs.flatMap((t) => inside(t).map((r) => r.thinnest))))}`,
    );
  }
  const thinnest = Math.min(
    ...[...still, ...moving, ...growing, ...building].flatMap((t) => inside(t).map((r) => r.thinnest)),
  );
  console.log(`Thinnest stand over all runs      ${round(thinnest)} — ${judge("no renewable stock is run into the ground", thinnest >= 0.2)}`);
}

// ------------------------------------------------ 5: the stores and the crisis
console.log("\n== The stores against the same crisis — a reading, no verdict ==");
{
  // Same seed, same draws, one thing varied (E30): just before a known setback
  // the community is handed a store it did not have. What the crisis then
  // costs, against having nothing, says what each kind of store is worth. The
  // lesson the epoch is built on has to show here: firewood softens a little,
  // food without a pit rots before it helps, a pit with food in it softens
  // most.
  const FOOD_IN_PIT = 100;
  const FIRE_TICKS = 20;
  type Given = "nothing" | "wood" | "food, no pit" | "pit with food";
  const handed = (state: GameState, what: Given, burn: number): GameState => {
    const sector = state.sectors["households"]!;
    if (what === "nothing") return state;
    const stocks = { ...sector.stocks };
    let capacityHeld = sector.capacityHeld;
    if (what === "wood") stocks["wood"] = (stocks["wood"] ?? 0) + burn * FIRE_TICKS;
    if (what === "food, no pit") stocks["food"] = (stocks["food"] ?? 0) + FOOD_IN_PIT;
    if (what === "pit with food") {
      stocks["food"] = (stocks["food"] ?? 0) + FOOD_IN_PIT;
      capacityHeld = { ...capacityHeld, storage: { amount: FOOD_IN_PIT, quality: 1 } };
    }
    return {
      ...state,
      sectors: { ...state.sectors, households: { ...sector, stocks, capacityHeld } },
    };
  };

  const depths: Record<Given, number[]> = {
    nothing: [],
    wood: [],
    "food, no pit": [],
    "pit with food": [],
  };
  for (const trace of still) {
    const setback = setbacksIn(trace.rows).find((s) => (trace.rows[s.at]?.tick ?? 0) >= 30);
    if (setback === undefined) continue;
    const strikesAt = trace.rows[setback.at]!.tick;
    for (const what of Object.keys(depths) as Given[]) {
      let state = createState(STAGE1, { seed: trace.seed });
      while (state.tick < strikesAt - 1) state = tick(state, index);
      const burn = derive(state, index).tiers.find((t) => t.tier === "warmth_fire")?.need ?? 0;
      state = handed(state, what, burn);
      const before = totalHeads(state.sectors["households"]!.cohorts);
      let trough = before;
      for (let i = 0; i < 40; i += 1) {
        state = tick(state, index);
        if (derive(state, index).communityGivenUp) break;
        trough = Math.min(trough, totalHeads(state.sectors["households"]!.cohorts));
      }
      depths[what].push(before > 0 ? 1 - trough / before : 0);
    }
  }
  for (const [what, cost] of Object.entries(depths)) {
    console.log(`Depth of the setback, given ${what.padEnd(14)} ${pct(mean(cost))} of the heads (${cost.length} crises)`);
  }
}

// --------------------------------- 6: the whole tree before settling (criteria)
console.log("\n== The whole tree before settling — the thorough play ==");
{
  const afterSettling = (id: string): boolean =>
    (STAGE1.projects.find((p) => p.id === id)?.visibleWhen ?? []).some(
      (c) => c.kind === "rule" && c.id === "settled" && c.set,
    );
  const inEpoch = STAGE1.projects.map((p) => p.id).filter((id) => !afterSettling(id));
  const buildable = inEpoch.filter((id) => id !== "sedentism");

  const settled = thorough.filter((t) => t.sedentismAt !== null);
  console.log(
    `Settled                          ${settled.length} of ${SEEDS}` +
      (settled.length === 0
        ? ""
        : `, tick ${Math.min(...settled.map((t) => t.sedentismAt ?? 0))}-${Math.max(...settled.map((t) => t.sedentismAt ?? 0))}, ` +
          `${round(mean(settled.map((t) => Object.keys(t.built).filter((id) => id !== "sedentism").length)), 1)} projects built`),
  );

  const seenSomewhere = new Set<string>();
  const builtSomewhere = new Set<string>();
  const ranSomewhere = new Set<string>();
  const drawnSomewhere = new Set<string>();
  for (const t of thorough) {
    for (const id of t.seen) seenSomewhere.add(id);
    for (const [id, n] of Object.entries(t.built)) if (n > 0) builtSomewhere.add(id);
    for (const [id, l] of Object.entries(t.labour)) if (l > 0) ranSomewhere.add(id);
    for (const id of t.drawn) drawnSomewhere.add(id);
  }
  const neverSeen = inEpoch.filter((id) => !seenSomewhere.has(id));
  const neverBuilt = buildable.filter((id) => !builtSomewhere.has(id));
  console.log(
    `Never seen                       ${neverSeen.length === 0 ? "none" : neverSeen.join(", ")} — ` +
      `${judge("every project of the epoch is seen before settling", neverSeen.length === 0)}`,
  );
  console.log(
    `Never built                      ${neverBuilt.length === 0 ? "none" : neverBuilt.join(", ")} — ` +
      `${judge("every project of the epoch is built in some run", neverBuilt.length === 0)}`,
  );

  // Every process of the epoch: on from the start, or opened by an epoch project.
  const openedBy = new Set<string>();
  for (const project of STAGE1.projects) {
    if (afterSettling(project.id)) continue;
    for (const effect of project.effects) if (effect.type === "process") openedBy.add(effect.id);
  }
  const epochProcesses = STAGE1.processes
    .map((proc) => proc.id)
    .filter((id) => id !== "labor")
    .filter((id) => (STAGE1.processes.find((proc) => proc.id === id)?.unlockedFromStart ?? false) || openedBy.has(id));
  const neverRan = epochProcesses.filter((id) => !ranSomewhere.has(id));
  console.log(
    `Never run                        ${neverRan.length === 0 ? "none" : neverRan.join(", ")} — ` +
      `${judge("every process of the epoch runs in some run", neverRan.length === 0)}`,
  );

  const stands = STAGE1.stocks.filter((s) => s.regrowth !== undefined).map((s) => s.id);
  const neverDrawn = stands.filter((id) => !drawnSomewhere.has(id));
  console.log(
    `Never drawn from                 ${neverDrawn.length === 0 ? "none" : neverDrawn.join(", ")} — ` +
      `${judge("every stand is drawn from in some run", neverDrawn.length === 0)}`,
  );

  // No shortcut out of the epoch: half the tree stands when the eager one settles.
  const eagerSettled = building.filter((t) => t.sedentismAt !== null);
  const builtAtSettle = eagerSettled.map(
    (t) => Object.keys(t.built).filter((id) => id !== "sedentism" && (t.built[id] ?? 0) > 0).length,
  );
  const fewest = builtAtSettle.length ? Math.min(...builtAtSettle) : 0;
  console.log(
    `Fewest projects at eager settling ${fewest} of ${buildable.length} — ` +
      `${judge("no shortcut out of the epoch: half the tree stands at settling", fewest >= Math.ceil(buildable.length / 2))}`,
  );

  // The pit is filled when the community settles, and read whether it was used.
  const settlers = [...eagerSettled, ...settled];
  const filled = settlers.every((t) => t.settleFoodStore >= 3 * t.settleHungerNeed);
  console.log(
    `Food in store at settling        ${settlers.length === 0 ? "—" : settlers.map((t) => `${round(t.settleFoodStore, 0)}/${round(3 * t.settleHungerNeed, 0)}`).join(" ")} — ` +
      `${judge("the community settles on a filled store", settlers.length > 0 && filled)}`,
  );
  const usedBefore = settlers.filter((t) =>
    setbacksIn(t.rows).some((s) => (t.rows[s.at]?.food ?? 0) > 0.5),
  ).length;
  console.log(`Store stood in a setback         in ${usedBefore} of ${settlers.length} settling runs (a reading — insurance unused is luck, not failure)`);

  // Every open supply road carries at least a twentieth of its good.
  const labourInto = (t: Trace, ids: readonly string[]): number =>
    ids.reduce((s, id) => s + (t.labour[id] ?? 0), 0);
  const byBranch = (branch: string): string[] =>
    STAGE1.processes.filter((proc) => proc.branch === branch).map((proc) => proc.id);
  const drawing = (ids: readonly string[], stand: string): string[] =>
    ids.filter((id) => ((STAGE1.processes.find((proc) => proc.id === id)?.intermediatesPerOutput ?? {})[stand] ?? 0) > 0);
  const roads: { good: string; road: string; processes: string[]; opener?: string }[] = [
    { good: "clothing", road: "hides", processes: drawing(byBranch("clothing"), "hides") },
    { good: "clothing", road: "fibre", processes: drawing(byBranch("clothing"), "fibre") },
    { good: "food", road: "plants", processes: drawing(byBranch("food"), "plants") },
    { good: "food", road: "game", processes: drawing(byBranch("food"), "game") },
    { good: "food", road: "fish", processes: drawing(byBranch("food"), "fish") },
    { good: "food", road: "shellfish", processes: drawing(byBranch("food"), "shellfish") },
    { good: "wood", road: "deadwood", processes: drawing(byBranch("wood"), "deadwood") },
    { good: "wood", road: "trees", processes: drawing(byBranch("wood"), "trees"), opener: "stone_axe" },
  ];
  let allCarry = true;
  const parts: string[] = [];
  for (const { good, road, processes, opener } of roads) {
    const open = thorough.filter((t) => opener === undefined || (t.built[opener] ?? 0) > 0);
    if (open.length === 0) {
      parts.push(`${road} —`);
      continue;
    }
    const goodIds = byBranch(good);
    const share =
      open.reduce((s, t) => s + labourInto(t, processes), 0) /
      Math.max(1e-9, open.reduce((s, t) => s + labourInto(t, goodIds), 0));
    if (share < 0.05) allCarry = false;
    parts.push(`${road} ${pct(share)}`);
  }
  console.log(`Road shares of their goods       ${parts.join(" · ")}`);
  console.log(`— ${judge("every open supply road carries at least a twentieth", allCarry)}`);
}

// ------------------------------------------------------------ 7: the tripwires
console.log("\n== The tripwires ==");
{
  const eagerSettled = building.filter((t) => t.sedentismAt !== null);
  const burned = burner.filter((t) => t.sedentismAt !== null);
  const eagerMean = mean(eagerSettled.map((t) => t.sedentismAt ?? 0));
  console.log(
    `Burner settles                   ${burned.length} of ${SEEDS}` +
      (burned.length === 0 ? "" : `, tick ${Math.min(...burned.map((t) => t.sedentismAt ?? 0))}-${Math.max(...burned.map((t) => t.sedentismAt ?? 0))} against eager mean ${round(eagerMean, 0)}`),
  );
  const laterOrNever =
    burned.length < eagerSettled.length ||
    (burned.length > 0 && mean(burned.map((t) => t.sedentismAt ?? 0)) > eagerMean);
  console.log(`— ${judge("burning before everything does not beat building", laterOrNever)}`);
}

// ------------------------------------- 8: what leaving a project out costs
if (args.get("paths") !== undefined) {
  console.log("\n== What leaving each project out costs (reading; --paths) ==");
  const PROBE_SEEDS = seeds.slice(0, 4);
  const afterSettling = (id: string): boolean =>
    (STAGE1.projects.find((p) => p.id === id)?.visibleWhen ?? []).some(
      (c) => c.kind === "rule" && c.id === "settled" && c.set,
    );
  const buildable = STAGE1.projects
    .map((p) => p.id)
    .filter((id) => !afterSettling(id) && id !== "sedentism");
  const baseline = PROBE_SEEDS.map((s) => play(s, new BuildingPolicy()));
  const baseSettle = mean(baseline.filter((t) => t.sedentismAt !== null).map((t) => t.sedentismAt ?? 0));
  for (const forbidden of buildable) {
    const runs = PROBE_SEEDS.map((s) => play(s, new BuildingPolicy(), true, forbidden));
    const settled = runs.filter((t) => t.sedentismAt !== null);
    const delta = settled.length === 0 ? null : mean(settled.map((t) => t.sedentismAt ?? 0)) - baseSettle;
    console.log(
      `${forbidden.padEnd(14)} settles ${settled.length}/${PROBE_SEEDS.length}` +
        (delta === null ? " — never" : `, ${delta >= 0 ? "+" : ""}${round(delta, 0)} ticks`),
    );
  }
}

// -------------------------------------------- 6: what holds without a run
/** Labour to make one unit of a good, its inputs chained in — the cheapest way. */
function labourPerUnit(stock: string, seen: ReadonlySet<string> = new Set()): number {
  if (stock === "labor") return 1;
  if (seen.has(stock)) return 0;
  const branch = STAGE1.branches.find((b) => b.produces === stock);
  if (branch === undefined) return 0;
  const runs = STAGE1.processes.filter((p) => p.branch === branch.id && p.unlockedFromStart);
  if (runs.length === 0) return 0;
  const next = new Set([...seen, stock]);
  return Math.min(
    ...runs.map((p) =>
      Object.entries(p.intermediatesPerOutput).reduce(
        (sum, [input, amount]) => sum + amount * labourPerUnit(input, next),
        0,
      ),
    ),
  );
}

/** What each need claims of the work, reckoned on untouched ground. */
function claimsOnWork(): Record<string, number> {
  const pop = STAGE1.population;
  const weighed = (w: Readonly<Record<string, number>>): number =>
    pop.cohorts.reduce((sum, c) => sum + (pop.shareAtStart[c.id] ?? 0) * (w[c.id] ?? 0), 0);
  const work = weighed(pop.labourWeight) * STAGE1.carried.baseProductivity;
  const out: Record<string, number> = {};
  for (const tier of STAGE1.needTiers) {
    const decay = STAGE1.stocks.find((s) => s.id === tier.stock)?.decayPerTick ?? 0;
    const per = tier.consumedOnUse > 0 ? tier.perHead * tier.consumedOnUse : tier.perHead * decay;
    out[tier.id] = (per * weighed(tier.perHeadWeight) * labourPerUnit(tier.stock)) / work;
  }
  return out;
}

/** What each need is meant to claim, and how far it may stray from it. */
const CLAIM_ON_WORK: Readonly<Record<string, readonly [number, readonly string[]]>> = {
  food: [0.34, ["food_survival", "food_satiety"]],
  warmth: [0.13, ["warmth_fire", "warmth_comfort"]],
  care: [0.14, ["childcare"]],
  clothing: [0.08, ["clothing_cover"]],
};
const CLAIM_BAND = 1 / 3;

/**
 * A rank that carries births, productivity or the ability to work has to be big
 * enough to be a regulator and not a switch. Fire is deliberately out: it is
 * small and high in the ranking so that it is met almost whatever happens.
 */
const REGULATOR_FLOOR = 0.05;

console.log("\n== Without a run: what the content says by itself ==");
{
  const claims = claimsOnWork();
  let ok = true;
  for (const [need, [target, tiers]] of Object.entries(CLAIM_ON_WORK)) {
    const share = tiers.reduce((sum, id) => sum + (claims[id] ?? 0), 0);
    const inBand = share >= target * (1 - CLAIM_BAND) && share <= target * (1 + CLAIM_BAND);
    if (!inBand) ok = false;
    console.log(`${need.padEnd(10)} ${pct(share)} of ${pct(target)}${inBand ? "" : "   <- off"}`);
  }
  console.log(`— ${judge("every need claims about the share of the work it is meant to", ok)}`);

  let switches = true;
  for (const tier of STAGE1.needTiers) {
    if (tier.id === "warmth_fire") continue;
    const moves = tier.birthRate ?? tier.survival ?? tier.workAbility ?? tier.productivity;
    if (moves === undefined) continue;
    const share = claims[tier.id] ?? 0;
    if (share < REGULATOR_FLOOR) {
      switches = false;
      console.log(`${tier.id.padEnd(16)} moves people but claims only ${pct(share)}`);
    }
  }
  console.log(`— ${judge("no rank that moves people is a mere switch", switches)}`);
}

// ------------------------------------------------------------------- das Urteil
const failed = verdicts.filter(([, pass]) => !pass);
console.log(`\n== Verdict: ${verdicts.length - failed.length} of ${verdicts.length} ==`);
for (const [what, pass] of verdicts) console.log(`${pass ? "  ok " : "FAIL "}${what}`);
