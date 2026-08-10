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
import { DISTRESS_TIERS } from "./presentation.ts";

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

/**
 * The one beat of the clock, for both kinds of run. The run to the stop point
 * is computed at once but shown tick by tick, because a jump to the end tears
 * the chain of cause and effect (V2); the free run walks in the same rhythm,
 * so the same picture always takes the same time to read.
 *
 * The first tick of a run is shown at once and the beat starts after it — a
 * grip that waits before it answers reads as a grip that did not take.
 */
const BEAT_MILLIS = 500;

export const game = writable<Game>({
  history: [createState(STAGE1, { seed: 42 })],
  mode: "paused",
});

let timer: ReturnType<typeof setInterval> | undefined;

/**
 * Ticks already computed but not yet shown. They are not part of the history
 * until the beat reveals them, so a pause simply drops what is left here and
 * the run ends on the tick the player is looking at.
 */
let unshown: GameState[] = [];

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
  // A hand on the game ends a replay: the ticks still waiting were computed
  // from a course the player has just left.
  if (unshown.length > 0) pause();
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

/**
 * Walk until a stop point (V2): distress, something new, something done. The
 * whole stretch is computed at once and then played out at the fast beat, so
 * the curves grow and the head bar counts on the way there.
 */
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
  if (grown.length === 0) return;
  unshown = grown;
  game.update((current) => ({ ...current, mode: "toStop" }));
  showNext();
  if (unshown.length > 0) timer = setInterval(showNext, BEAT_MILLIS);
}

/** One beat of the replay: hand the next computed tick to the history. */
function showNext(): void {
  const next = unshown.shift();
  if (next === undefined) {
    pause();
    return;
  }
  game.update((current) => ({ ...current, history: [...current.history, next] }));
  if (unshown.length === 0) pause();
}

/** Let it run in real time; only distress and the end halt it (V2). */
export function runFree(): void {
  const value = get(game);
  if (over(value) || timer !== undefined) return;
  game.update((current) => ({ ...current, mode: "free" }));
  walkOn();
  if (get(game).mode !== "free") return;
  timer = setInterval(walkOn, BEAT_MILLIS);
}

/** One beat of the free run: a tick, then the two hard halts. */
function walkOn(): void {
  step();
  const now = currentState(get(game));
  if (distress(now) || now.abandonedAt !== undefined) pause();
}

/** Halt on the tick now on screen; computed ticks not yet shown are dropped. */
export function pause(): void {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
  unshown = [];
  game.update((current) => ({ ...current, mode: "paused" }));
}

/**
 * Distress, not dying as such: people die every tick, and a community
 * shrinking under the carrying brake is no emergency. Two things must meet in
 * the same tick (T9): a rank the presentation marks as an emergency lay under
 * full coverage, and people died beyond their base rate because of it.
 */
export function distress(state: GameState): boolean {
  if (!diedBeyondBase(state)) return false;
  return DISTRESS_TIERS.some((tier) => (state.lastCoverage[tier] ?? 1) < 1 - 1e-9);
}

/** Did anyone die beyond what dies anyway? */
function diedBeyondBase(state: GameState): boolean {
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
