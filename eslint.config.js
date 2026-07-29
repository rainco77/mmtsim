import js from "@eslint/js";
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
  { ignores: ["dist", "node_modules", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
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
