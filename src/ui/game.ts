import { get, writable } from "svelte/store";
import { STAGE1 } from "../content/stage1.ts";
import {
  apply,
  createState,
  derive,
  indexConfig,
  tick,
  type Action,
  type Derived,
  type GameState,
} from "../sim/index.ts";

/**
 * The running game: the whole history of the run, not only the last tick
 * (T9). Rolling back for testing is slicing this list; every tile reads the
 * newest state and whatever course it wants to draw.
 */

export const index = indexConfig(STAGE1);

/** How the clock is being driven. The default is the player's hand (V2). */
export type Mode = "paused" | "toStop" | "free";

export interface Game {
  readonly history: readonly GameState[];
  readonly mode: Mode;
}

/** A run never walks further than this in one command — a brake, not a rule. */
const LONGEST_RUN = 1000;

/** Real time between ticks of the free run; provisional until played with. */
const FREE_RUN_MILLIS = 150;

export const game = writable<Game>({
  history: [createState(STAGE1, { seed: 42 })],
  mode: "paused",
});

let timer: ReturnType<typeof setInterval> | undefined;

export function currentState(value: Game): GameState {
  const last = value.history[value.history.length - 1];
  if (last === undefined) throw new Error("a run always has a state");
  return last;
}

function over(value: Game): boolean {
  return currentState(value).abandonedAt !== undefined;
}

/** One player action on the newest state; a refusal is thrown, not swallowed. */
export function act(action: Action): void {
  game.update((value) => {
    const result = apply(currentState(value), action, index);
    if (result.rejected !== undefined) throw new Error(result.rejected);
    return { ...value, history: [...value.history.slice(0, -1), result.state] };
  });
}

export function step(): void {
  game.update((value) =>
    over(value)
      ? value
      : { ...value, history: [...value.history, tick(currentState(value), index)] },
  );
}

/** Walk until a stop point (V2): distress, something new, something done. */
export function runToStop(): void {
  const value = get(game);
  if (over(value) || value.mode !== "paused") return;
  const grown: GameState[] = [];
  let previous = currentState(value);
  let before = derive(previous, index);
  for (let i = 0; i < LONGEST_RUN; i += 1) {
    const next = tick(previous, index);
    const after = derive(next, index);
    grown.push(next);
    if (stopsTheRun(previous, next, before, after)) break;
    previous = next;
    before = after;
  }
  game.update((current) => ({ ...current, history: [...current.history, ...grown] }));
}

/** Let it run in real time; only distress and the end halt it (V2). */
export function runFree(): void {
  const value = get(game);
  if (over(value) || timer !== undefined) return;
  game.update((current) => ({ ...current, mode: "free" }));
  timer = setInterval(() => {
    step();
    const now = currentState(get(game));
    if (distress(now) || now.abandonedAt !== undefined) pause();
  }, FREE_RUN_MILLIS);
}

export function pause(): void {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
  game.update((current) => ({ ...current, mode: "paused" }));
}

/**
 * Distress, not dying as such: people die every tick, and a community
 * shrinking under the carrying brake is no emergency. The signal is a
 * cohort's recorded survival factor below its base rate — which happens
 * exactly when a survival rank went short (V2).
 */
export function distress(state: GameState): boolean {
  for (const cohort of index.config.population.cohorts) {
    const base = index.config.population.baseSurvival[cohort.id] ?? 1;
    if ((state.lastSurvival[cohort.id] ?? 1) < base - 1e-9) return true;
  }
  return false;
}

/** What halts the run-to-stop: the concept's stop points (V2). */
function stopsTheRun(
  previous: GameState,
  next: GameState,
  before: Derived,
  after: Derived,
): boolean {
  if (next.abandonedAt !== undefined) return true;
  if (distress(next)) return true;

  // A project shown for the first time.
  for (const id of Object.keys(next.seenProjects)) {
    if (!(id in previous.seenProjects)) return true;
  }

  // A project finished — the move and the epoch's end are projects too.
  for (const [id, count] of Object.entries(next.completedProjects)) {
    if (count > (previous.completedProjects[id] ?? 0)) return true;
  }

  // A project truly becoming buildable — not a repeatable merely returning
  // to the list after its own completion.
  const buildableBefore = new Set(
    before.projects.filter((p) => p.available).map((p) => p.id),
  );
  for (const project of after.projects) {
    if (!project.available || buildableBefore.has(project.id)) continue;
    const completions = next.completedProjects[project.id] ?? 0;
    if (completions > (previous.completedProjects[project.id] ?? 0)) continue;
    return true;
  }
  return false;
}
