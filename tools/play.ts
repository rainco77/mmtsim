import { STAGE1 } from "../src/content/stage1.ts";
import { indexConfig } from "../src/sim/config.ts";
import { createState } from "../src/sim/setup.ts";
import { tick } from "../src/sim/tick.ts";
import { derive, type Derived } from "../src/sim/derive.ts";
import { apply, type Action } from "../src/sim/actions.ts";
import { readFileSync, writeFileSync } from "node:fs";

import type { GameState } from "../src/sim/state.ts";

/**
 * Plays the game one tick at a time and prints what a player would see.
 *
 * A **session** keeps the run in a file between calls, so playing on means
 * playing on rather than replaying from the start:
 *
 *   node tools/play.ts --new --seed 42 --into run.json
 *   node tools/play.ts --in run.json --step 10
 *   node tools/play.ts --in run.json --do '{"start":"sickle_blades","rank":110}'
 *
 * The file also keeps the log of everything done, so a finished run can be told
 * as a story and repeated exactly.
 *
 * There is deliberately no way to replay a run from the start in one call.
 * Printing every tick since the beginning on every step costs the reader the
 * same opening twenty times over, and that is the whole run again for nothing.
 *
 * Actions:
 *   {"start":"id"}              start a project at its declared urgency
 *   {"start":"id","rank":110}   start it at a chosen urgency (lower = earlier)
 *   {"pause":"id"} {"resume":"id"} {"abandon":"id"}
 *   {"rank":"id","to":110}      move a running project's urgency
 *
 * `--until` runs on until there is something to decide — a project offered or
 * finished, a need failing, the settlement given up — with `--step` as the cap.
 *
 * Stepping prints one line per tick and the full view of where you now stand.
 * `--full` prints every tick in full, `--quiet` only the final one, and `--log`
 * adds what has been done so far.
 */

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg?.startsWith("--") !== true) continue;
  // A switch without a value is "true" — the next argument belongs to the next
  // switch, not to this one.
  const value = process.argv[i + 1];
  args.set(arg.slice(2), value === undefined || value.startsWith("--") ? "true" : value);
}

const index = indexConfig(STAGE1);
const pct = (x: number): string => `${(100 * x).toFixed(0)}%`;
const num = (x: number): string => (Math.abs(x) < 0.05 ? "0" : x.toFixed(1));

/**
 * One line per tick, for reading a stretch.
 *
 * The full view is thirteen lines, so a run of three hundred ticks is four
 * thousand lines of which almost every one repeats the one above it. This keeps
 * what changes and what a decision would hang on; the full view is printed for
 * the tick you are standing on, which is the only one you can act at.
 */
function line(d: Derived): string {
  const covers = d.tiers.map((t) => `${t.tier.slice(0, 4)} ${pct(t.coverage).padStart(4)}`).join(" ");
  const building = d.projects
    .filter((p) => p.running)
    .map((p) => `${p.id.slice(0, 6)} ${pct(p.progress)}`)
    .join(" ");
  return (
    `t${String(d.tick).padStart(4)} ${d.heads.toFixed(1).padStart(7)}` +
    ` w${(d.shocks["weather"] ?? 1).toFixed(2)}` +
    ` | ${covers}` +
    ` | b ${pct(d.birthRate * 10)} d ${pct(d.deathRate * 10)}`.replace(/(\d+)%/g, "$1‰") +
    ` | idle ${num(d.laborUnused)}` +
    ` | store ${num(d.stocks["food"] ?? 0)}` +
    ` | ${d.binding.kind === "none" ? "-" : `${d.binding.kind}:${d.binding.what ?? ""}`}` +
    (building === "" ? "" : ` | ${building}`) +
    (d.settlementAbandoned ? "  *** GIVEN UP ***" : "")
  );
}

/** What a decision could hang on, so a change in it is worth waking up for. */
interface Standing {
  readonly offered: string;
  readonly building: string;
  readonly alive: boolean;
  readonly fed: boolean;
}

function describe(d: Derived): Standing {
  return {
    offered: d.projects.filter((p) => p.available).map((p) => p.id).sort().join(","),
    building: d.projects.filter((p) => p.running).map((p) => p.id).sort().join(","),
    alive: !d.settlementAbandoned,
    // Only the lowest rank counts as an alarm. Comfort dips with every other
    // bad draw; going hungry does not.
    fed: d.tiers
      .filter((t) => t.rank === Math.min(...d.tiers.map((o) => o.rank)))
      .every((t) => t.coverage > 0.95),
  };
}

/**
 * Something has happened that a player would answer: a new project is on offer,
 * one has finished, the settlement is starving, or it is gone. Running on past
 * these wastes the very moments the run is being played for.
 */
function worthDeciding(before: Standing, d: Derived): boolean {
  const now = describe(d);
  return (
    now.offered !== before.offered ||
    now.building !== before.building ||
    now.alive !== before.alive ||
    (before.fed && !now.fed)
  );
}

function view(state: GameState, d: Derived): string {
  const out: string[] = [];
  out.push(
    `== tick ${d.tick} == ${d.heads.toFixed(1)} people` +
      `  (births ${pct(d.birthRate)} / deaths ${pct(d.deathRate)})` +
      (d.settlementAbandoned ? "   *** SETTLEMENT GIVEN UP ***" : ""),
  );
  out.push(
    `  needs    ${d.tiers.map((t) => `${t.tier} ${pct(t.coverage)}`).join("  ") || "-"}`,
  );
  const bind = d.binding.kind === "none" ? "nothing" : `${d.binding.kind}:${d.binding.what ?? ""}`;
  out.push(
    `  labour   ${num(d.laborPerformance)} = ${num(d.laborToProduction)} processes` +
      ` + ${num(d.laborToProjects)} projects + ${num(d.laborUnused)} idle` +
      `   short of: ${bind}`,
  );
  const land = index.config.capacities
    .filter((c) => c.id !== "people" && c.id !== "storage")
    .map((c) => {
      const held = (d.ownedCapacity[c.id]?.amount ?? 0) + (d.unownedCapacity[c.id]?.amount ?? 0);
      return `${c.id} ${num(held)} at ${pct(d.utilization[c.id] ?? 0)}`;
    });
  out.push(`  land     ${land.join(" | ")}`);
  const store = d.ownedCapacity["storage"]?.amount ?? 0;
  const stocks = Object.entries(d.stocks)
    .filter(([id]) => id !== "labor")
    .map(([id, v]) => `${id} ${num(v)}`);
  out.push(`  stocks   ${stocks.join(" | ") || "empty"}   (pits hold ${num(store)})`);
  out.push(
    `  running  ${d.runs.filter((r) => r.process !== "labor").map((r) => `${r.process} ${num(r.output)}`).join(" | ") || "-"}`,
  );
  out.push(`  weather  ${(d.shocks["weather"] ?? 1).toFixed(2)} next tick (1.0 is normal)`);

  const building = d.projects.filter((p) => p.running);
  if (building.length > 0) {
    out.push(
      `  building ${building.map((p) => `${p.id} ${pct(p.progress)}${p.paused ? " (paused)" : ""}`).join(" | ")}`,
    );
  }
  const offered = d.projects.filter((p) => p.visible && !p.running);
  if (offered.length > 0) {
    out.push("  on offer");
    for (const p of offered) {
      const def = index.project.get(p.id);
      const cost = `${def?.laborCost ?? 0} labour over >=${def?.minTicks ?? 0} ticks`;
      const why = p.available ? "" : `   locked: ${p.missing.map((m) => JSON.stringify(m)).join(", ")}`;
      const done = p.completed > 0 ? ` (done ${p.completed}x)` : "";
      out.push(`    ${p.available ? ">" : " "} ${p.id.padEnd(18)}${cost.padEnd(30)}${done}${why}`);
    }
  }
  return out.join("\n");
}

function toAction(step: Record<string, string | number>): Action | undefined {
  if (typeof step["start"] === "string") {
    const rank = step["rank"];
    return typeof rank === "number"
      ? { type: "startProject", id: step["start"], rank }
      : { type: "startProject", id: step["start"] };
  }
  if (typeof step["pause"] === "string") {
    return { type: "pauseProject", id: step["pause"], paused: true };
  }
  if (typeof step["resume"] === "string") {
    return { type: "pauseProject", id: step["resume"], paused: false };
  }
  if (typeof step["abandon"] === "string") {
    return { type: "abandonProject", id: step["abandon"] };
  }
  if (typeof step["rank"] === "string" && typeof step["to"] === "number") {
    return { type: "setProjectRank", id: step["rank"], rank: step["to"] };
  }
  return undefined;
}

interface Session {
  readonly seed: number;
  readonly log: readonly string[];
  readonly state: GameState;
}

const quiet = args.get("quiet") === "true";
const file = args.get("in") ?? args.get("into");
const lines: string[] = [];

// ---- session mode: the run lives in a file and is continued, not replayed ---
if (file !== undefined) {
  const seed = Number(args.get("seed") ?? 42);
  let session: Session =
    args.get("new") === "true"
      ? { seed, log: [], state: createState(STAGE1, { seed }) }
      : (JSON.parse(readFileSync(file, "utf8")) as Session);

  let state = session.state;
  const log = [...session.log];

  const doing = args.get("do");
  if (doing !== undefined) {
    const action = toAction(JSON.parse(doing) as Record<string, string | number>);
    if (action === undefined) {
      lines.push(`  !! not an action: ${doing}`);
    } else {
      const result = apply(state, action, index);
      if (result.rejected !== undefined) lines.push(`  !! ${result.rejected}`);
      else log.push(`tick ${state.tick}: ${doing}`);
      state = result.state;
    }
  }

  const steps = Number(args.get("step") ?? 0);
  const full = args.get("full") === "true";
  // `--until` runs on until there is something to decide, so a caller wakes up
  // for decisions rather than on a count of ticks. A fixed step is arbitrary:
  // too coarse when a choice is due, too fine when nothing happens for twenty
  // ticks. `--step` stays the cap, so this always comes back.
  const untilSomething = args.get("until") === "true";
  const before = describe(derive(state, index));

  for (let i = 0; i < steps; i += 1) {
    const d = derive(state, index);
    lines.push(full ? view(state, d) : line(d));
    state = tick(state, index);
    if (untilSomething && i > 0 && worthDeciding(before, derive(state, index))) break;
  }
  // The tick you are standing on always in full: it is the only one you can act
  // at, so it is the only one where the offers and the detail matter.
  lines.push((steps > 0 && !full ? "\n" : "") + view(state, derive(state, index)));

  session = { seed: session.seed, log, state };
  writeFileSync(file, JSON.stringify(session));
  const joiner = full ? "\n\n" : "\n";
  console.log(quiet ? (lines[lines.length - 1] ?? "") : lines.join(joiner));
  if (args.get("log") === "true") console.log(`\nwhat was done:\n  ${log.join("\n  ")}`);
}
