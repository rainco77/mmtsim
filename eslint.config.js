import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import tseslint from "typescript-eslint";

/**
 * The import boundary from T8: static rules are enforced by the linter,
 * behavioural rules by tests.
 *
 * `src/sim` and `src/content` are the pure core. They must not reach into
 * the shell, the user interface or the development tools.
 */
const CORE_FORBIDDEN = [
  { group: ["**/ui/**"], message: "sim/content must not import from ui (T1)." },
  { group: ["**/tools/**"], message: "sim/content must not import from tools (T1)." },
  {
    group: ["**/persistence/**"],
    message: "sim/content must not import from persistence (T1).",
  },
];

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", "archive"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Svelte templates are linted too (T8); their script blocks are TypeScript.
  ...svelte.configs.recommended,
  {
    files: ["**/*.svelte"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  /**
   * The little scripts beside the design templates run in Node and say so.
   * They are linted like everything else — a template generator that throws is
   * as broken as anything — but they are allowed the globals Node gives them.
   */
  {
    files: ["design/**/*.mjs", "tools/**/*.ts"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", Buffer: "readonly" },
    },
  },
  /**
   * The shell lives in a browser and may say so. The core may not: it has no
   * DOM, no clock and no globals (T1), which is what the block below enforces.
   */
  {
    files: ["src/ui/**", "src/persistence/**"],
    languageOptions: {
      globals: {
        CanvasRenderingContext2D: "readonly",
        Element: "readonly",
        HTMLElement: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        PointerEvent: "readonly",
        document: "readonly",
        localStorage: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        window: "readonly",
      },
    },
  },
  {
    files: ["src/sim/**/*.ts", "src/content/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: CORE_FORBIDDEN }],
      // The simulation must not reach for a clock or a global random source (T1).
      "no-restricted-globals": [
        "error",
        { name: "Date", message: "The simulation has no clock (T1)." },
        { name: "performance", message: "The simulation has no clock (T1)." },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message: "Use the seeded generator in the state instead (T1).",
        },
      ],
    },
  },
);
