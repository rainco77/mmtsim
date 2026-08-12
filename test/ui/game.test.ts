import { describe, expect, it } from "vitest";
import { STAGE1 } from "../../src/content/stage1.ts";
import {
  createState,
  derive,
  indexConfig,
  type Derived,
  type GameState,
  type ProjectView,
} from "../../src/sim/index.ts";
import { stopsTheRun } from "../../src/ui/game.ts";
import { protocolText } from "../../src/ui/protocol.ts";

/**
 * Tests of the interface, kept apart from the tests of the core: the core
 * knows nothing of screens, and a test of a screen must never be mistaken for
 * a statement about the model.
 *
 * Mechanics, never balance (E26): what halts a run and what a play log says,
 * never a figure a change of content would move.
 */

const index = indexConfig(STAGE1);

/** A state nobody died in and nothing went short in, so only the tested thing halts. */
function calm(): GameState {
  const state = createState(STAGE1, { seed: 42 });
  return { ...state, lastCoverage: {}, lastSurvival: {} };
}

/** The same view with one project put where the test wants it. */
function withProject(view: Derived, project: ProjectView): Derived {
  return {
    ...view,
    projects: [...view.projects.filter((one) => one.id !== project.id), project],
  };
}

const project = (id: string, visible: boolean, available: boolean): ProjectView => ({
  id,
  visible,
  available,
  running: false,
  paused: false,
  progress: 0,
  completed: 0,
  missing: [],
  consequences: [],
  worth: 0,
});

describe("what halts the run to the stop point (V2, T9)", () => {
  const state = calm();
  const view = derive(state, index);

  it("does not halt for a project merely coming into sight", () => {
    // Coming into sight says "this is on its way": nothing to answer and
    // nothing to decide. Halting on it stopped the run every few ticks for
    // something the player could do nothing about; the log reports the
    // sighting either way, and it is read when the run next stops.
    const before = withProject(view, project("mortar", false, false));
    const after = withProject(view, project("mortar", true, false));
    expect(stopsTheRun(state, state, before, after)).toBe(false);
  });

  it("halts where a project truly becomes buildable", () => {
    const before = withProject(view, project("mortar", true, false));
    const after = withProject(view, project("mortar", true, true));
    expect(stopsTheRun(state, state, before, after)).toBe(true);
  });

  it("halts where something was finished", () => {
    const done: GameState = { ...state, completedProjects: { mortar: 1 } };
    expect(stopsTheRun(state, done, view, view)).toBe(true);
  });

  it("stands still where nothing at all changed", () => {
    expect(stopsTheRun(state, state, view, view)).toBe(false);
  });
});

describe("the play log the protocol grip hands out (T9)", () => {
  it("names the seed, and walks to each deed's tick before doing it", () => {
    const text = protocolText(
      42,
      [
        { tick: 5, action: { type: "startProject", id: "mortar" } },
        { tick: 5, action: { type: "setProjectRank", id: "mortar", rank: 250 } },
        { tick: 9, action: { type: "setStockTarget", stock: "wood", amount: 12 } },
      ],
      14,
    );
    expect(text.split("\n")).toEqual([
      "s = reset(42)",
      "// bis Tick 5 laufen",
      "s = run(s, 5)",
      `s = act(s, {"type":"startProject","id":"mortar"})`,
      `s = act(s, {"type":"setProjectRank","id":"mortar","rank":250})`,
      "// bis Tick 9 laufen",
      "s = run(s, 4)",
      `s = act(s, {"type":"setStockTarget","stock":"wood","amount":12})`,
      "// bis Tick 14 laufen",
      "s = run(s, 5)",
      "",
    ]);
  });

  it("walks to the tick on the screen even where nothing was ever done", () => {
    // A finding is written about a position, and the log has to reach it.
    expect(protocolText(7, [], 3)).toBe(
      ["s = reset(7)", "// bis Tick 3 laufen", "s = run(s, 3)", ""].join("\n"),
    );
  });

  it("says nothing but the seed for a run that has not begun", () => {
    expect(protocolText(7, [], 0)).toBe("s = reset(7)\n");
  });
});
