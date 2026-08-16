import { get } from "svelte/store";
import { currentState, game, journal, SEED, type Doing } from "./game.ts";

/**
 * **The protocol grip** (T9): hang `#protokoll` on the game's address and the
 * page hands out a text file — the seed and every deed with its tick — and
 * takes the fragment off again. There is no visible surface to it, and it is
 * not for the player: it is for whoever writes down a finding, and the issue
 * schema asks for exactly this, a play log that another session can replay
 * step by step instead of playing something else by hand.
 *
 * The lines are the session tool's own: `reset`, `run`, `act`. Pasted into it
 * they walk the very same run, and a reader can stop at any tick on the way,
 * which is the whole point of a log — one that only runs to the end says
 * nothing about the way there.
 */
export const PROTOCOL_HASH = "#protokoll";

/** What the file is called when it lands. */
export const PROTOCOL_FILE = "mmtsim-protokoll.txt";

/**
 * The log as text.
 *
 * `now` is the tick the run stands at, and the last walk goes to it: without
 * it a reader arrives at the last deed and not at the position the finding was
 * written about.
 */
export function protocolText(
  seed: number,
  doings: readonly Doing[],
  now: number,
): string {
  const lines: string[] = [`s = reset(${seed})`];
  let at = 0;
  const walkTo = (tick: number): void => {
    if (tick <= at) return;
    lines.push(`// run to tick ${tick}`, `s = run(s, ${tick - at})`);
    at = tick;
  };
  for (const doing of doings) {
    walkTo(doing.tick);
    lines.push(`s = act(s, ${JSON.stringify(doing.action)})`);
  }
  walkTo(now);

  /**
   * Every line closes with a semicolon **but the last**: the session tool
   * takes a block whose last statement is a value and answers with it, and a
   * block that ends in a semicolon leaves it with nothing to return. Pasted
   * whole, the log therefore walks the run and hands back the state it
   * reached; pasted line by line, it does the same one step at a time.
   */
  const last = lines.reduce((at, line, i) => (isRemark(line) ? at : i), 0);
  const closed = lines.map((line, i) =>
    isRemark(line) || i === last ? line : `${line};`,
  );
  return `${closed.join("\n")}\n`;
}

function isRemark(line: string): boolean {
  return line.startsWith("//");
}

/**
 * Handed over as a data address rather than through a temporary object url:
 * the file is a few lines of text, and this way nothing has to be released
 * again afterwards.
 */
function handOut(text: string): void {
  const link = document.createElement("a");
  link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
  link.download = PROTOCOL_FILE;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Listens for the grip — at the start and at every change of the address, so
 * it answers in the middle of a run as well.
 */
export function watchProtocolGrip(): void {
  const answer = (): void => {
    if (window.location.hash !== PROTOCOL_HASH) return;
    handOut(protocolText(SEED, get(journal), currentState(get(game)).tick));
    // The fragment goes again: the same grip has to work a second time, and
    // what the player has in the address bar is a game and not a command.
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  };
  window.addEventListener("hashchange", answer);
  answer();
}
