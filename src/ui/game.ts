import { derived as fromStore, get, writable } from "svelte/store";
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
  type ProjectView,
} from "../sim/index.ts";
import { DISTRESS_TIERS, PLAYED_AT_ONCE } from "./presentation.ts";

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

/** The draw the run is played on; the protocol names it so a run can be replayed. */
export const SEED = 42;

export const game = writable<Game>({
  history: [createState(STAGE1, { seed: SEED })],
  mode: "paused",
});

/** One deed of the player: what he did, and the tick he did it at. */
export interface Doing {
  readonly tick: number;
  readonly action: Action;
}

/**
 * **The action journal**: every deed of the player in the order he did them.
 *
 * One book, two readers. The protocol grip writes it out as lines to paste
 * into the session tool, so a finding can be replayed step by step; and the
 * explainer cards read their action window out of the same book. Kept in one
 * place because two books of the same thing drift apart, and the one that is
 * only read by a card would drift unnoticed.
 *
 * Book-keeping of the surface, deliberately not a field of the state: the
 * model does not care who moved a rank.
 */
export const journal = writable<readonly Doing[]>([]);

/**
 * When the player last laid a hand on a claim of his own, and what he did —
 * read out of the journal, never written beside it.
 *
 * The explainer card's cause sentence counts from the last own deed, so that
 * it never passes judgement on a setting that has since been changed — "short
 * in six of fourteen ticks since the move" is about the setting that stands,
 * and a count reaching back past the move would be about one that does not.
 *
 * Giving an undertaking up takes its entry with it: what comes after is a
 * fresh start and not a continuation.
 */
export type Deed = "start" | "rank" | "amount" | "pause";

export const ownDeeds = fromStore(
  journal,
  ($journal): Readonly<Record<string, { tick: number; what: Deed }>> => {
    const deeds: Record<string, { tick: number; what: Deed }> = {};
    for (const doing of $journal) {
      if (doing.action.type === "abandonProject") {
        delete deeds[`project:${doing.action.id}`];
        continue;
      }
      const deed = deedOf(doing.action);
      if (deed !== undefined) deeds[deed.key] = { tick: doing.tick, what: deed.what };
    }
    return deeds;
  },
);

/** Which claim an action belongs to, and what kind of deed it is. */
function deedOf(action: Action): { key: string; what: Deed } | undefined {
  switch (action.type) {
    case "startProject":
      return { key: `project:${action.id}`, what: "start" };
    case "setProjectRank":
    case "reorderProject":
      return { key: `project:${action.id}`, what: "rank" };
    case "pauseProject":
      return { key: `project:${action.id}`, what: "pause" };
    case "setStockTarget":
      return { key: `store:${action.stock}`, what: "amount" };
    case "setStockRank":
      return { key: `store:${action.stock}`, what: "rank" };
    case "abandonProject":
      return undefined;
  }
}

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
    // Into the book first, and every deed goes in: what the cards read and
    // what the protocol writes out are the same list.
    journal.update((doings) => [...doings, { tick: result.state.tick, action }]);
    return { ...value, history: [...value.history.slice(0, -1), result.state] };
  });
}

/**
 * Beginning an undertaking — and, for the ones this epoch carries out in the
 * stroke they are begun, the tick that carries it out.
 *
 * Walking is the one such thing: the people who carry the camp are the people
 * who walk, so the move is over on the tick after it is started whatever the
 * hands are doing. Leaving the player to press the step himself would show him
 * a claim standing in the band for exactly as long as it takes him to notice
 * it, and invite him to weigh a decision that has already been taken.
 */
export function begin(id: string): void {
  act({ type: "startProject", id });
  if (PLAYED_AT_ONCE.includes(id)) step();
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
export function stopsTheRun(
  previous: GameState,
  next: GameState,
  before: Derived,
  after: Derived,
): boolean {
  if (next.abandonedAt !== undefined) return true;
  if (distress(next)) return true;

  // A project merely coming into sight does **not** halt the run. Coming into
  // sight says "this is on its way", which is nothing to answer and nothing to
  // decide; halting on it stopped the run every few ticks for something the
  // player could do nothing about. Becoming buildable is the moment there is a
  // choice, and that one halts. The log reports the sighting either way, so
  // nothing is lost — it is read when the run next stops.

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

/** Built and never to be built again: the count has reached what it may be. */
export function spentProject(project: ProjectView): boolean {
  return (
    !project.running &&
    project.completed > 0 &&
    project.limit !== undefined &&
    project.completed >= project.limit
  );
}

/** The catalogue's four groups, in the order they stand on the screen. */
export interface Catalogue {
  readonly running: readonly ProjectView[];
  readonly buildable: readonly ProjectView[];
  readonly done: readonly ProjectView[];
  readonly inSight: readonly ProjectView[];
}

/**
 * How the catalogue is laid out (T9): **running · buildable · done · in
 * sight**, and every project stands in one group at most.
 *
 * Done holds what can never be begun again — a one-off that is built, a
 * repeatable whose count is spent. A repeatable with room left comes back to
 * buildable with its counter and never lands in done: it is not over. Without
 * the group such a project fell in among the ones in sight, as though it had
 * never been built at all.
 *
 * The buildable ones are ordered by the core's own worth figure, the rest keep
 * the order the content gives them.
 */
export function catalogueGroups(view: Derived): Catalogue {
  return {
    running: view.projects.filter((project) => project.running),
    buildable: view.projects
      .filter((project) => project.available && !project.running)
      .sort((a, b) => b.worth - a.worth),
    done: view.projects.filter((project) => spentProject(project)),
    inSight: view.projects.filter(
      (project) =>
        project.visible &&
        !project.available &&
        !project.running &&
        !spentProject(project),
    ),
  };
}
