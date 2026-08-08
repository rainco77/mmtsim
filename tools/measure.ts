import { STAGE1 } from "../src/content/stage1.ts";
import { StillPolicy, MovingPolicy, BuildingPolicy } from "../src/policy/plays/index.ts";
import type { Policy } from "../src/policy/policy.ts";
import { apply, createState, derive, indexConfig, tick, totalHeads } from "../src/sim/index.ts";

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
}

function play(seed: number, policy: Policy, settle = true): Trace {
  let state = createState(STAGE1, { seed });
  const rows: Row[] = [];
  let sedentismAt: number | null = null;
  let pitAt: number | null = null;
  let headsAtSedentism = 0;
  const seen = new Set<string>();
  const labour: Record<string, number> = {};

  for (let i = 0; i < CAP; i += 1) {
    const d = derive(state, index);
    if (d.communityGivenUp) break;
    // **A run ends with the settling.** What comes after belongs to a stage
    // whose content does not exist yet, and averaging it in only falsifies.
    if ((state.completedProjects["sedentism"] ?? 0) > 0) {
      sedentismAt = state.tick;
      headsAtSedentism = totalHeads(state.sectors["households"]!.cohorts);
      break;
    }

    for (const action of policy.decide(state, d, index)) {
      // Held back rather than filtered inside the strategy, so the same written
      // rule is measured either way and only the horizon differs.
      if (!settle && action.type === "startProject" && action.id === "sedentism") continue;
      const result = apply(state, action, index);
      if (result.rejected === undefined) state = result.state;
    }

    if (pitAt === null && (state.completedProjects["storage_pit"] ?? 0) > 0) pitAt = state.tick;

    const after = derive(state, index);
    for (const project of after.projects) if (project.visible) seen.add(project.id);
    for (const run of after.runs) labour[run.process] = (labour[run.process] ?? 0) + run.labor;
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

const seeds = Array.from({ length: SEEDS }, (_, i) => i + 1);
const still = seeds.map((s) => play(s, new StillPolicy()));
const moving = seeds.map((s) => play(s, new MovingPolicy()));
/** For the resting level: the same rule, but it does not end the epoch. */
const growing = seeds.map((s) => play(s, new BuildingPolicy(), false));
/** For the end of the epoch: the same rule, settling as soon as it can. */
const building = seeds.map((s) => play(s, new BuildingPolicy()));

const restingOf = (runs: readonly Trace[]): number => mean(runs.map((t) => mean(late(t).map((r) => r.heads))));
const startHeads = mean(still.map((t) => t.rows[0]?.heads ?? 0));

const verdicts: [string, boolean][] = [];
const judge = (what: string, pass: boolean): string => {
  verdicts.push([what, pass]);
  return pass ? "ja" : "NEIN";
};

console.log(`Seeds 1..${SEEDS}, bis Tick ${CAP}, Ruhelage abgelesen zwischen Tick ${REST_FROM} und ${REST_TO}.\n`);

// ---------------------------------------------------------- 1: wie es anfängt
console.log("== Wie es anfängt: die stille Spielweise ==");
{
  const resting = restingOf(still);
  const rows = still.flatMap((t) => late(t));
  const back = still.flatMap((t) => setbacksIn(t.rows));
  const first = mean(still.map((t) => t.rows[0]?.density ?? 0));
  const settledDensity = mean(rows.map((r) => r.density));
  const idle = mean(rows.map((r) => r.idle));

  console.log(`Kopfzahl am Start                 ${round(startHeads, 1)}`);
  console.log(
    `Ruhelage                          ${round(resting, 1)} ` +
      `(tiefster ${round(mean(still.map((t) => Math.min(...late(t).map((r) => r.heads)))), 1)}, ` +
      `höchster ${round(mean(still.map((t) => Math.max(...late(t).map((r) => r.heads)))), 1)})`,
  );
  console.log(
    `  gegen den Start                 ${pct(resting / Math.max(1e-9, startHeads))} — ` +
      `${judge("ohne Projekte ruht sie bei dem, womit sie startet", resting >= startHeads * 0.8 && resting <= startHeads * 1.2)}`,
  );
  console.log(
    `Dichte des Reviers                erster Tick ${round(first)} → Ruhelage ${round(settledDensity)} — ` +
      `${judge("das Revier dünnt aus, statt sich zu erholen", first >= settledDensity)}`,
  );
  console.log(`Freie Arbeit im Mittel            ${pct(idle)}`);
  console.log(`  Ticks mit mehr als 5 % frei     ${pct(rows.filter((r) => r.idle > 0.05).length / Math.max(1, rows.length))}`);
  console.log(`Hungerticks je hundert            ${round((rows.filter((r) => r.hunger < 0.999).length / Math.max(1, rows.length)) * 100, 1)}`);
  console.log(
    `Rückschläge je Lauf               ${round(back.length / SEEDS, 1)}, im Mittel ${pct(mean(back.map((b) => b.depth)))} der Köpfe`,
  );
  console.log(
    `  Abstand / Erholung, Median      ${median(back.filter((b) => b.nextAfter !== null).map((b) => b.nextAfter ?? 0))} gegen ${median(back.filter((b) => b.recoveredAfter !== null).map((b) => b.recoveredAfter ?? 0))} Ticks`,
  );
  console.log(
    `  aufgeholt vor der nächsten      ${pct(gotOverInTime(back))} — ` +
      `${judge("eine Krise ist zu überstehen, bevor die nächste kommt", gotOverInTime(back) >= 0.75)}`,
  );
  console.log(
    `Aufgegeben                        ${still.filter((t) => t.abandoned).length} von ${SEEDS} — ${judge("keine Gemeinschaft wird aufgegeben, wenn sie nichts tut", !still.some((t) => t.abandoned))}`,
  );
}

// ------------------------------------------------------------- 2: der Umzug
console.log("\n== Was der Umzug bringt: ziehend gegen still — Ablesung, kein Urteil ==");
{
  const a = restingOf(still);
  const b = restingOf(moving);
  console.log(`Umzüge je Lauf                    ${round(mean(moving.map((t) => t.moves)), 1)}`);
  console.log(`Ruhelage still                    ${round(a, 1)}`);
  console.log(`Ruhelage ziehend                  ${round(b, 1)}  (${b > a ? "+" : ""}${round(((b - a) / Math.max(1e-9, a)) * 100, 1)} %)`);
  console.log(`Dichte ziehend gegen still        ${round(mean(moving.map((t) => mean(late(t).map((r) => r.density)))))} gegen ${round(mean(still.map((t) => mean(late(t).map((r) => r.density)))))}`);
  console.log(`Aufgegeben                        ${moving.filter((t) => t.abandoned).length} von ${SEEDS}`);

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
  console.log(
    `Freie Arbeit im Revierzyklus      frisch ${pct(mean(fresh))} → vor dem Wechsel ${pct(mean(worn))}, ` +
      `sinkend in ${sinking} von ${cycles} Zyklen`,
  );
}

// -------------------------------------------------------- 3: was Fortschritt bringt
console.log("\n== Was der Fortschritt bringt: bauend gegen ziehend ==");
{
  const a = restingOf(moving);
  const b = restingOf(growing);
  const settled = building.filter((t) => t.sedentismAt !== null);
  const beforePit = building.map(
    (t) => setbacksIn(t.rows).filter((s) => t.pitAt === null || s.at < t.pitAt).length,
  );
  console.log(`Projekte je Lauf                  ${round(mean(growing.map((t) => t.projectsDone)), 1)} von ${STAGE1.projects.length}`);
  console.log(`Ruhelage ziehend                  ${round(a, 1)}`);
  console.log(`Ruhelage bauend                   ${round(b, 1)}  — ${judge("Fortschritt zeigt sich in Köpfen", b > a)}`);
  console.log(
    `Sesshaft                          ${settled.length} von ${SEEDS}` +
      (settled.length === 0
        ? ""
        : `, Tick ${Math.min(...settled.map((t) => t.sedentismAt ?? 0))}–${Math.max(...settled.map((t) => t.sedentismAt ?? 0))}`) +
      ` — ${judge("die Epoche endet, kein Lauf bleibt stecken", settled.length === SEEDS)}`,
  );
  console.log(`  Köpfe dabei                     ${round(mean(settled.map((t) => t.headsAtSedentism)), 1)}`);
  console.log(`  Krisen bis dahin je Lauf        ${round(mean(building.map((t) => setbacksIn(t.rows).length)), 1)}`);
  console.log(`  Krisen bis zur Grube je Lauf    ${round(mean(beforePit), 1)}`);
  console.log(`  davon aufgeholt vor der nächsten ${pct(gotOverInTime(building.flatMap((t) => setbacksIn(t.rows))))} (still: ${pct(gotOverInTime(still.flatMap((t) => setbacksIn(t.rows))))})`);
  console.log(`Aufgegeben vor der Sesshaftigkeit ${building.filter((t) => t.abandoned && t.sedentismAt === null).length} von ${SEEDS}`);
}

// ------------------------------------------------ 3b: steht der Baum offen?
console.log("\n== Der Baum — Ablesung, kein Urteil ==");
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
    `Nie sichtbar, in keinem Lauf      ${never.length} von ${inEpoch.length} dieser Epoche` +
      (never.length === 0 ? "" : `: ${never.join(", ")}`),
  );

  // Beide Kleidungswege und der Anteil des Wassers — sie sagen erst etwas,
  // wenn der Baum offen ist, deshalb ohne Urteil.
  const labourOf = (ids: readonly string[]): number =>
    growing.reduce((sum, t) => sum + ids.reduce((s, id) => s + (t.labour[id] ?? 0), 0), 0);
  const branchOf = (id: string): string => STAGE1.processes.find((p) => p.id === id)?.branch ?? "";
  const clothing = STAGE1.processes.filter((p) => branchOf(p.id) === "clothing").map((p) => p.id);
  const hides = clothing.filter((id) => (STAGE1.processes.find((p) => p.id === id)?.intermediatesPerOutput["hides"] ?? 0) > 0);
  const fibre = clothing.filter((id) => (STAGE1.processes.find((p) => p.id === id)?.intermediatesPerOutput["fibre"] ?? 0) > 0);
  const both = labourOf(hides) + labourOf(fibre);
  console.log(
    `Kleidung aus Fell gegen Faser     ${both <= 0 ? "—" : `${pct(labourOf(hides) / both)} zu ${pct(labourOf(fibre) / both)}`}`,
  );
  const food = STAGE1.processes.filter((p) => branchOf(p.id) === "food").map((p) => p.id);
  const water = food.filter((id) => (STAGE1.processes.find((p) => p.id === id)?.capacityPerOutput["water"] ?? 0) > 0 ||
    ["fish", "shellfish"].some((s) => (STAGE1.processes.find((p) => p.id === id)?.intermediatesPerOutput[s] ?? 0) > 0));
  const allFood = labourOf(food);
  console.log(`Anteil des Wassers an der Nahrung ${allFood <= 0 ? "—" : pct(labourOf(water) / allFood)}`);
}

// ------------------------------------------------------------ 4: die Bestände
console.log("\n== Die Bestände ==");
{
  const inside = (t: Trace): readonly Row[] => t.rows.filter((r) => r.tick <= REST_TO);
  const perPlay: [string, readonly Trace[]][] = [
    ["still", still],
    ["ziehend", moving],
    ["bauend", growing],
  ];
  for (const [name, runs] of perPlay) {
    console.log(
      `Dünnster Stand ${name.padEnd(18)} ${round(Math.min(...runs.flatMap((t) => inside(t).map((r) => r.thinnest))))}`,
    );
  }
  const thinnest = Math.min(
    ...[...still, ...moving, ...growing, ...building].flatMap((t) => inside(t).map((r) => r.thinnest)),
  );
  console.log(`Dünnster Stand über alle Läufe    ${round(thinnest)} — ${judge("kein nachwachsender Bestand wird heruntergewirtschaftet", thinnest >= 0.2)}`);
}

// -------------------------------------------- 5: was ohne einen Lauf gilt
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

console.log("\n== Ohne Lauf: was der Inhalt für sich schon sagt ==");
{
  const claims = claimsOnWork();
  let ok = true;
  for (const [need, [target, tiers]] of Object.entries(CLAIM_ON_WORK)) {
    const share = tiers.reduce((sum, id) => sum + (claims[id] ?? 0), 0);
    const inBand = share >= target * (1 - CLAIM_BAND) && share <= target * (1 + CLAIM_BAND);
    if (!inBand) ok = false;
    console.log(`${need.padEnd(10)} ${pct(share)} von ${pct(target)}${inBand ? "" : "   <- daneben"}`);
  }
  console.log(`— ${judge("jeder Bedarf beansprucht ungefähr den Anteil der Arbeit, den er soll", ok)}`);

  let switches = true;
  for (const tier of STAGE1.needTiers) {
    if (tier.id === "warmth_fire") continue;
    const moves = tier.birthRate ?? tier.survival ?? tier.workAbility ?? tier.productivity;
    if (moves === undefined) continue;
    const share = claims[tier.id] ?? 0;
    if (share < REGULATOR_FLOOR) {
      switches = false;
      console.log(`${tier.id.padEnd(16)} bewegt Menschen, beansprucht aber nur ${pct(share)}`);
    }
  }
  console.log(`— ${judge("kein Rang, der Menschen bewegt, ist ein bloßer Schalter", switches)}`);
}

// ------------------------------------------------------------------- das Urteil
const failed = verdicts.filter(([, pass]) => !pass);
console.log(`\n== Urteil: ${verdicts.length - failed.length} von ${verdicts.length} ==`);
for (const [what, pass] of verdicts) console.log(`${pass ? "  ok " : "RISS "}${what}`);
