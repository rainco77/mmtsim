import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The surface's one rule about translating (T6): **whoever writes a message
 * takes the translating with it and never reaches for it.**
 *
 * A place in the markup is drawn again when something it names has changed.
 * What a plain helper reaches for inside itself is named nowhere, so a line
 * built that way went on standing in the old language after the switch, until
 * some other change moved its data. Handed in as an argument, the language is
 * part of what the place names, and the line follows at once.
 *
 * Read off the source, because that is where the rule lives: there is no way
 * to see it in a figure the model gives.
 */

const TILES = "src/ui/tiles";

/** The script of a component, without its markup and its styles. */
function scriptOf(source: string): string {
  const from = source.indexOf(">", source.indexOf("<script"));
  const to = source.indexOf("</script>");
  return from < 0 || to < 0 ? "" : source.slice(from + 1, to);
}

/** The bodies of the plain function declarations, braces counted. */
function functionBodies(script: string): readonly string[] {
  const out: string[] = [];
  for (const match of script.matchAll(/\bfunction\s+\w+\s*\(/g)) {
    const open = script.indexOf("{", match.index);
    if (open < 0) continue;
    let depth = 0;
    for (let at = open; at < script.length; at += 1) {
      if (script[at] === "{") depth += 1;
      else if (script[at] === "}") {
        depth -= 1;
        if (depth === 0) {
          out.push(script.slice(open, at + 1));
          break;
        }
      }
    }
  }
  return out;
}

describe("how the surface translates (T6)", () => {
  const files = readdirSync(TILES).filter((name) => name.endsWith(".svelte"));

  it("reads every tile of the surface, so the rule cannot be tested on nothing", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("has no helper that reaches for the language instead of being handed it", () => {
    for (const file of files) {
      const script = scriptOf(readFileSync(`${TILES}/${file}`, "utf8"));
      for (const body of functionBodies(script)) {
        expect(body, file).not.toContain("$t(");
      }
    }
  });
});
