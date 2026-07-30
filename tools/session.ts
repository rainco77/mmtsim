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
import * as bots from "../src/policy/bots/index.ts";

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

/** Helpers put into scope of every expression. */
const scope = {
  tick: (state: GameState) => tick(state, session.idx),
  derive: (state: GameState) => derive(state, session.idx),
  act: (state: GameState, action: Action) => {
    const result = apply(state, action, session.idx);
    if (result.rejected !== undefined) throw new Error(result.rejected);
    return result.state;
  },
  // Returns the fresh state; the caller assigns it (`s = reset(42)`). Setting
  // it here would be overwritten by the write-back at the end of the call.
  reset: (seed: number) => createState(session.cfg, { seed }),
  run: (state: GameState, ticks: number) => {
    let next = state;
    for (let i = 0; i < ticks; i += 1) next = tick(next, session.idx);
    return next;
  },
  bots,
  config: () => session.cfg,
};

/**
 * Evaluates an expression — or, if that does not parse, a block of statements
 * whose last expression is the result. Loops and declarations must work, or the
 * session is not a session but a calculator.
 */
function evaluate(source: string): unknown {
  const names = ["s", "cfg", "idx", ...Object.keys(scope)];
  const values = [session.s, session.cfg, session.idx, ...Object.values(scope)];

  const asExpression = `let __result = (${source});\nreturn { __result, __state: s };`;
  const asStatements = `let __result = (function () {\n${source}\n})();\nreturn { __result, __state: s };`;

  let fn: ((...args: unknown[]) => { __result: unknown; __state: GameState }) | undefined;
  try {
    fn = new Function(...names, asExpression) as typeof fn;
  } catch {
    fn = new Function(...names, asStatements) as typeof fn;
  }
  if (fn === undefined) throw new Error("could not compile");

  const out = fn(...values);
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
