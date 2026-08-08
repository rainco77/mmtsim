import { createServer } from "node:http";
import { STAGE1 } from "../src/content/stage1.ts";
import {
  apply,
  createState,
  derive,
  indexConfig,
  tick,
  type Action,
  type GameState,
} from "../src/sim/index.ts";

/**
 * The running session for balancing (T4).
 *
 * A Node process holds the state in memory and takes JavaScript over a small
 * HTTP interface on localhost — synchronous, interactive, without a state file
 * and without starting over at every step.
 *
 * One endpoint suffices: ticking, acting, looking into the state, running a
 * loop, doing an intermediate calculation are all the same way. A fixed list of
 * commands could only ever do what was thought of at design time.
 *
 * Output is JSON, not formatted text: unambiguous, complete, and every view can
 * be assembled in the call itself.
 *
 * Development tool only. Bound to localhost, never part of the shipped game.
 */

const index = indexConfig(STAGE1);

interface Session {
  s: GameState;
  cfg: typeof STAGE1;
  readonly idx: typeof index;
}

const session: Session = {
  s: createState(STAGE1, { seed: 42 }),
  cfg: STAGE1,
  idx: index,
};

/**
 * **The play log.** What was done, and at which tick — enough to play the very
 * same game again, step by step, and stop wherever one likes.
 *
 * A finding without one is not a finding: "played by hand" cannot be checked,
 * because another session playing by hand would do something else. So every
 * action goes down here as it is taken, rather than being written out
 * afterwards from memory — a log that is remembered is a log that is wrong.
 *
 * What it does **not** hold is the content: change a coefficient and the same
 * log gives other numbers. That is why a finding names its commit as well.
 */
interface PlayLog {
  seed: number;
  readonly actions: [number, Action][];
  /**
   * Set once the state was changed by something other than an action or a tick
   * — an experiment writing into `s` by hand. From that moment the log no
   * longer reproduces what was seen, and it says so instead of pretending.
   */
  handEdited: boolean;
}

const play: PlayLog = { seed: 42, actions: [], handEdited: false };

/** What the state should look like if only actions and ticks have touched it. */
let expected: GameState = session.s;

/** Helpers put into scope of every expression. */
const scope = {
  tick: (state: GameState) => tick(state, session.idx),
  derive: (state: GameState) => derive(state, session.idx),
  act: (state: GameState, action: Action) => {
    const result = apply(state, action, session.idx);
    if (result.rejected !== undefined) throw new Error(result.rejected);
    play.actions.push([state.tick, action]);
    expected = result.state;
    return result.state;
  },
  // Returns the fresh state; the caller assigns it (`s = reset(42)`). Setting
  // it here would be overwritten by the write-back at the end of the call.
  reset: (seed: number) => {
    const fresh = createState(session.cfg, { seed });
    play.seed = seed;
    play.actions.length = 0;
    play.handEdited = false;
    expected = fresh;
    return fresh;
  },
  run: (state: GameState, ticks: number) => {
    let next = state;
    for (let i = 0; i < ticks; i += 1) next = tick(next, session.idx);
    expected = next;
    return next;
  },

  /** The log as it belongs in a finding: readable, and a line to paste. */
  log: () => ({
    text: [
      `Play log — seed ${play.seed}`,
      ...play.actions.map(([t, a]) => `${String(t).padStart(3)}  ${a.type} ${"id" in a ? a.id : JSON.stringify(a)}`),
      play.actions.length === 0 ? "(no actions)" : "(nothing else)",
      ...(play.handEdited
        ? ["WARNING: the state was edited by hand — this log does NOT replay the run"]
        : []),
    ].join("\n"),
    json: { seed: play.seed, actions: play.actions },
    handEdited: play.handEdited,
  }),

  /**
   * One step of a recorded game: whatever the log holds for *this* tick, then a
   * tick. After it the whole state is there to be looked at, which is the point
   * — a replay one can only run to the end tells nothing about the way there.
   */
  step: (log: { seed: number; actions: [number, Action][] }, state: GameState) => {
    let next = state;
    for (const [t, action] of log.actions) {
      if (t !== state.tick) continue;
      const result = apply(next, action, session.idx);
      if (result.rejected !== undefined) throw new Error(`Tick ${t}: ${result.rejected}`);
      next = result.state;
    }
    return tick(next, session.idx);
  },
  config: () => session.cfg,

  /**
   * The short view — what a player would have on the overview, as JSON.
   *
   * It saves repeating the same projection on every step; it replaces nothing.
   * Anything else is fetched from `derive(s)` or the state itself.
   *
   * Every key comes from the configuration, nothing is spelled out: no stock,
   * no capacity, no need is named here. Naming one would be the same mistake
   * the model spent so long undoing — labour is a stock like any other and a
   * storage pit is a capacity like any other, and in a later epoch both are
   * gone while the view stays the same.
   */
  overview: (state: GameState) => {
    const d = derive(state, session.idx);
    const round = (x: number) => Math.round(x * 1000) / 1000;
    const from = <T>(ids: readonly string[], of: (id: string) => T) =>
      Object.fromEntries(ids.map((id) => [id, of(id)]));

    return {
      tick: d.tick,
      people: round(d.heads),
      cohorts: from(Object.keys(d.cohorts), (id) => round(d.cohorts[id] ?? 0)),
      born: round(d.born),
      survival: from(Object.keys(d.survival), (id) => round(d.survival[id] ?? 0)),
      abandoned: d.communityGivenUp,
      needs: from(
        d.tiers.map((t) => t.tier),
        (id) => round(d.coverage[id] ?? 0),
      ),
      capacities: from(
        session.cfg.capacities.map((c) => c.id),
        (id) => ({ held: round(d.capacityTotal[id] ?? 0), used: round(d.utilization[id] ?? 0) }),
      ),
      stocks: from(
        session.cfg.stocks.map((st) => st.id),
        (id) => round(d.stocks[id] ?? 0),
      ),
      running: Object.fromEntries(
        d.runs.filter((r) => r.output > 0).map((r) => [r.process, round(r.output)]),
      ),
      // Where a renewable stock stands, and whether what is being taken can
      // last (E29). Config-driven like the rest: nothing is named here.
      nature: Object.fromEntries(
        Object.entries(d.renewable).map(([id, r]) => {
          let taken = 0;
          for (const run of d.runs) {
            taken += run.output * (session.idx.process.get(run.process)?.intermediatesPerOutput[id] ?? 0);
          }
          return [id, { held: round(r.held), of: round(r.ceiling), grows: round(r.growth), taken: round(taken) }];
        }),
      ),
      shocks: from(Object.keys(session.cfg.shocks), (id) => round(d.shocks[id] ?? 1)),
      short: d.binding.kind === "none" ? null : `${d.binding.kind}:${d.binding.what ?? ""}`,
      projects: {
        building: Object.fromEntries(
          d.projects.filter((p) => p.running).map((p) => [p.id, round(p.progress)]),
        ),
        available: d.projects.filter((p) => p.available && !p.running).map((p) => p.id),
        locked: Object.fromEntries(
          d.projects
            .filter((p) => p.visible && !p.available && !p.running)
            .map((p) => [p.id, p.missing]),
        ),
      },
    };
  },
};

/**
 * Splits off the last top-level statement, so a block can end in a value the
 * way an expression does.
 *
 * A statement ends at a semicolon **or at a closing brace** — `for (…) { … } n`
 * has no semicolon before the value. Only at the top level: the ones inside
 * brackets, strings and template literals belong to something else.
 */
function lastStatement(source: string): { head: string; tail: string } {
  let depth = 0;
  let quote: string | undefined;
  let cut = -1;
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (quote !== undefined) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = undefined;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "(" || c === "[" || c === "{") depth += 1;
    else if (c === ")" || c === "]" || c === "}") {
      depth -= 1;
      if (c === "}" && depth === 0) cut = i;
    } else if (c === ";" && depth === 0) cut = i;
  }
  return cut < 0
    ? { head: "", tail: source }
    : { head: source.slice(0, cut + 1), tail: source.slice(cut + 1) };
}

/** Statements that are not values, so prefixing them with `return` is wrong. */
const NOT_A_VALUE =
  /^\s*(return|if|for|while|do|switch|try|throw|const|let|var|function|class|\{)\b/;

/**
 * Evaluates an expression, or a block of statements whose last statement is the
 * result — with or without `return`.
 *
 * Requiring `return` was a trap: a block without it answered with an empty body
 * and no error at all, which is the worst thing a tool can say. Loops and
 * declarations still work, or the session is a calculator and not a session.
 */
function evaluate(source: string): unknown {
  const names = ["s", "cfg", "idx", ...Object.keys(scope)];
  const values = [session.s, session.cfg, session.idx, ...Object.values(scope)];

  const { head, tail } = lastStatement(source);
  const body = NOT_A_VALUE.test(tail) ? source : `${head}\nreturn (${tail});`;

  const asExpression = `let __result = (${source});\nreturn { __result, __state: s };`;
  const asStatements = `let __result = (function () {\n${body}\n})();\nreturn { __result, __state: s };`;

  let fn: ((...args: unknown[]) => { __result: unknown; __state: GameState }) | undefined;
  try {
    fn = new Function(...names, asExpression) as typeof fn;
  } catch {
    fn = new Function(...names, asStatements) as typeof fn;
  }
  if (fn === undefined) throw new Error("could not compile");

  const out = fn(...values);
  // Anything that reached the state other than through `act`, `reset`, `run` or
  // a plain `tick` — an experiment writing into `s` — is noted, because from
  // then on the log no longer reproduces what is on the screen.
  if (out.__state !== expected && out.__state !== tick(expected, session.idx)) {
    play.handEdited = true;
  }
  expected = out.__state;
  session.s = out.__state;
  return out.__result;
}

const PORT = Number(process.env["MMTSIM_SESSION_PORT"] ?? 7777);

const server = createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/eval") {
    response.writeHead(404).end("POST /eval\n");
    return;
  }
  let body = "";
  request.on("data", (chunk: Buffer) => (body += chunk.toString()));
  request.on("end", () => {
    let payload: unknown;
    try {
      payload = evaluate(body);
    } catch (error) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: String(error) }, null, 2));
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(payload, replacer, 2));
  });
});

/** Sets and Maps would otherwise serialise as `{}`. */
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Set) return [...value];
  if (value instanceof Map) return Object.fromEntries(value);
  return value;
}

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`session on http://127.0.0.1:${PORT}/eval  (seed 42, tick 0)\n`);
});
