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
import { de } from "../../src/i18n/de.ts";
import { en } from "../../src/i18n/en.ts";
import { catalogueGroups, stopsTheRun } from "../../src/ui/game.ts";
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
      "s = reset(42);",
      "// run to tick 5",
      "s = run(s, 5);",
      `s = act(s, {"type":"startProject","id":"mortar"});`,
      `s = act(s, {"type":"setProjectRank","id":"mortar","rank":250});`,
      "// run to tick 9",
      "s = run(s, 4);",
      `s = act(s, {"type":"setStockTarget","stock":"wood","amount":12});`,
      "// run to tick 14",
      // The last statement carries no semicolon: it is the value the session
      // tool answers with, and a block ending in one has none.
      "s = run(s, 5)",
      "",
    ]);
  });

  it("walks to the tick on the screen even where nothing was ever done", () => {
    // A finding is written about a position, and the log has to reach it.
    expect(protocolText(7, [], 3)).toBe(
      ["s = reset(7);", "// run to tick 3", "s = run(s, 3)", ""].join("\n"),
    );
  });

  it("says nothing but the seed for a run that has not begun", () => {
    expect(protocolText(7, [], 0)).toBe("s = reset(7)\n");
  });

  it("writes its remarks in the language the code is written in", () => {
    // The file is read by whoever replays a finding, and the code — comments
    // and all — is English.
    const remarks = protocolText(7, [], 3)
      .split("\n")
      .filter((line) => line.startsWith("//"));
    expect(remarks).toEqual(["// run to tick 3"]);
  });
});

describe("the catalogue's four groups (T9)", () => {
  const view = derive(calm(), index);

  /** One project standing exactly where a case wants it. */
  const standing = (fields: Partial<ProjectView> & { id: string }): ProjectView => ({
    visible: true,
    available: false,
    running: false,
    paused: false,
    progress: 0,
    completed: 0,
    missing: [],
    consequences: [],
    worth: 0,
    ...fields,
  });

  const groupsOf = (project: ProjectView): ReturnType<typeof catalogueGroups> =>
    catalogueGroups(withProject(view, project));

  const idsOf = (projects: readonly ProjectView[]): readonly string[] =>
    projects.map((one) => one.id);

  it("puts a built one-off into done and never among the ones in sight", () => {
    // Without the group it fell back among the ones in sight, as though it had
    // never been built at all.
    const groups = groupsOf(standing({ id: "mortar", limit: 1, completed: 1 }));
    expect(idsOf(groups.done)).toContain("mortar");
    expect(idsOf(groups.inSight)).not.toContain("mortar");
  });

  it("sends a repeatable back to buildable with its counter, never to done", () => {
    const groups = groupsOf(
      standing({ id: "storage_pit", available: true, completed: 3 }),
    );
    expect(idsOf(groups.buildable)).toContain("storage_pit");
    expect(idsOf(groups.done)).not.toContain("storage_pit");
  });

  it("puts a repeatable whose count is spent into done: it can never come again", () => {
    const groups = groupsOf(standing({ id: "land_taking", limit: 6, completed: 6 }));
    expect(idsOf(groups.done)).toContain("land_taking");
    expect(idsOf(groups.inSight)).not.toContain("land_taking");
  });

  it("leaves a one-off being built again nowhere but among the running", () => {
    const groups = groupsOf(
      standing({ id: "storage_pit", running: true, completed: 2, progress: 0.5 }),
    );
    expect(idsOf(groups.running)).toContain("storage_pit");
    expect(idsOf(groups.done)).not.toContain("storage_pit");
    expect(idsOf(groups.inSight)).not.toContain("storage_pit");
  });
});

describe("what a condition line says (T9)", () => {
  /** Every kind of condition the content really uses, wherever it stands. */
  const kinds = new Set(
    index.config.projects.flatMap((def) =>
      [...def.visibleWhen, ...def.availableWhen].map((one) => one.kind),
    ),
  );

  it("names the event of every condition kind the content uses, in both languages", () => {
    for (const kind of kinds) {
      const key = `projects.condition.${kind}`;
      expect(de[key], key).toBeDefined();
      expect(en[key], key).toBeDefined();
    }
  });

  it("carries no figure of its own: the bar and its percent say how far it is", () => {
    // "13 / 25" made the player read a rule where he only wanted to know
    // whether he was getting closer.
    for (const table of [de, en]) {
      for (const [key, text] of Object.entries(table)) {
        if (!key.startsWith("projects.condition.")) continue;
        expect(text, key).not.toMatch(/\d/);
      }
    }
  });

  it("names every activity practice is counted in, in both languages", () => {
    for (const process of index.config.processes) {
      const key = `name.activity.${process.activity}`;
      expect(de[key], key).toBeDefined();
      expect(en[key], key).toBeDefined();
    }
  });
});
