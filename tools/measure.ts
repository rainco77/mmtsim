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
  readonly comfort: number;
  readonly hunger: number;
  readonly density: number;
  readonly thinnest: number;
}

interface Trace {
  readonly seed: number;
  readonly rows: readonly Row[];
  readonly moves: number;
  readonly projectsDone: number;
  readonly sedentismAt: number | null;
  readonly abandoned: boolean;
  readonly headsAtSedentism: number;
}

function play(seed: number, policy: Policy, settle = true): Trace {
  let state = createState(STAGE1, { seed });
  const rows: Row[] = [];
  let sedentismAt: number | null = null;
  let headsAtSedentism = 0;

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

    const after = derive(state, index);
    const shares: number[] = [];
    for (const stand of Object.values(after.renewable)) {
      if (stand !== undefined && stand.ceiling > 0) shares.push(stand.held / stand.ceiling);
    }
    rows.push({
      tick: state.tick,
      heads: totalHeads(state.sectors["households"]!.cohorts),
      idle: after.laborPerformance > 0 ? after.laborUnused / after.laborPerformance : 0,
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
    abandoned: last.communityGivenUp,
    headsAtSedentism,
  };
}

// ------------------------------------------------------------------- small help

const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
const round = (x: number, places = 2): number => Number(x.toFixed(places));
const late = (t: Trace): readonly Row[] =>
  t.rows.filter((r) => r.tick >= REST_FROM && r.tick <= REST_TO);
const pct = (x: number): string => `${(x * 100).toFixed(1)} %`;

/**
 * What a setback costs and whether it is got over: for every tick that hunger
 * first bites, how deep the community falls afterwards and whether it climbs
 * back to where it stood.
 */
function setbacks(rows: readonly Row[]): { depth: number; recovered: number; count: number } {
  const WITHIN = 60;
  let count = 0;
  let recovered = 0;
  const depths: number[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    if ((rows[i]?.hunger ?? 1) >= 0.999 || (rows[i - 1]?.hunger ?? 1) < 0.999) continue;
    count += 1;
    const before = rows[i - 1]?.heads ?? 0;
    const after = rows.slice(i, i + WITHIN);
    const trough = Math.min(...after.map((r) => r.heads));
    if (before > 0) depths.push(1 - trough / before);
    if (after.some((r) => r.heads >= before * 0.95)) recovered += 1;
  }
  return { depth: mean(depths), recovered: count === 0 ? 0 : recovered / count, count };
}

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
  const back = setbacks(still.flatMap((t) => [...t.rows]));
  const rows = still.flatMap((t) => late(t));
  console.log(`Kopfzahl am Start                 ${round(startHeads, 1)}`);
  console.log(
    `Ruhelage                          ${round(resting, 1)} ` +
      `(tiefster ${round(mean(still.map((t) => Math.min(...late(t).map((r) => r.heads)))), 1)}, ` +
      `höchster ${round(mean(still.map((t) => Math.max(...late(t).map((r) => r.heads)))), 1)})`,
  );
  console.log(`  schrumpft auf                   ${pct(resting / Math.max(1e-9, startHeads))} des Starts`);
  const first = mean(still.map((t) => t.rows[0]?.density ?? 0));
  const settledDensity = mean(rows.map((r) => r.density));
  console.log(`Dichte des Reviers                erster Tick ${round(first)} → Ruhelage ${round(settledDensity)}`);
  console.log(`  dünnt aus statt sich zu erholen  ${first > settledDensity ? "ja" : "NEIN"}`);
  console.log(`Freie Arbeit im Mittel            ${pct(mean(rows.map((r) => r.idle)))}`);
  console.log(`  Ticks mit mehr als 5 % frei     ${pct(rows.filter((r) => r.idle > 0.05).length / Math.max(1, rows.length))}`);
  console.log(`Hungerticks je hundert            ${round((rows.filter((r) => r.hunger < 0.999).length / Math.max(1, rows.length)) * 100, 1)}`);
  console.log(`Rückschläge je Lauf               ${round(back.count / SEEDS, 1)}, im Mittel ${pct(back.depth)} der Köpfe`);
  console.log(`  davon wieder aufgeholt          ${pct(back.recovered)}`);
  console.log(`Aufgegeben                        ${still.filter((t) => t.abandoned).length} von ${SEEDS} — ${judge("keine Gemeinschaft wird aufgegeben, wenn sie nichts tut", !still.some((t) => t.abandoned))}`);
}

// ------------------------------------------------------------- 2: der Umzug
console.log("\n== Was der Umzug bringt: ziehend gegen still ==");
{
  const a = restingOf(still);
  const b = restingOf(moving);
  console.log(`Umzüge je Lauf                    ${round(mean(moving.map((t) => t.moves)), 1)}`);
  console.log(`Ruhelage still                    ${round(a, 1)}`);
  console.log(`Ruhelage ziehend                  ${round(b, 1)}  (${b > a ? "+" : ""}${round(((b - a) / Math.max(1e-9, a)) * 100, 1)} %)`);
  console.log(`Dichte still                      ${round(mean(moving.map((t) => mean(late(t).map((r) => r.density)))))} gegen ${round(mean(still.map((t) => mean(late(t).map((r) => r.density)))))}`);
  console.log(`Aufgegeben bis Tick ${REST_TO}              ${moving.filter((t) => t.abandoned && (t.rows[t.rows.length - 1]?.tick ?? 0) <= REST_TO).length} von ${SEEDS}`);
}

// -------------------------------------------------------- 3: was Fortschritt bringt
console.log("\n== Was der Fortschritt bringt: bauend gegen ziehend ==");
{
  const a = restingOf(moving);
  const b = restingOf(growing);
  const settled = building.filter((t) => t.sedentismAt !== null);
  console.log(`Projekte je Lauf                  ${round(mean(growing.map((t) => t.projectsDone)), 1)} von ${STAGE1.projects.length}`);
  console.log(`Ruhelage ziehend                  ${round(a, 1)}`);
  console.log(`Ruhelage bauend                   ${round(b, 1)}  — ${judge("Fortschritt zeigt sich in Köpfen", b > a)}`);
  console.log(
    `Sesshaft                          ${settled.length} von ${SEEDS}` +
      (settled.length === 0
        ? ""
        : `, Tick ${Math.min(...settled.map((t) => t.sedentismAt ?? 0))}–${Math.max(...settled.map((t) => t.sedentismAt ?? 0))}`),
  );
  console.log(`  Köpfe dabei                     ${round(mean(settled.map((t) => t.headsAtSedentism)), 1)}`);
  console.log(`Hungerticks bis dahin je Lauf     ${round(mean(building.map((t) => t.rows.filter((r) => r.hunger < 0.999 && (t.sedentismAt === null || r.tick <= t.sedentismAt)).length)), 1)}`);
  console.log(`Aufgegeben vor der Sesshaftigkeit ${building.filter((t) => t.abandoned && t.sedentismAt === null).length} von ${SEEDS} — ${judge("die Epoche endet, kein Lauf bleibt stecken", settled.length === SEEDS)}`);
}

// ------------------------------------------------------------ 4: die Bestände
console.log("\n== Die Bestände ==");
{
  const inside = (t: Trace): readonly Row[] => t.rows.filter((r) => r.tick <= REST_TO);
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
