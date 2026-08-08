# Archive

Set aside, kept, not used. Nothing under `src/`, `test/` or `tools/` imports
anything from here, and the type check does not cover this folder.

- `bots/` — strategies behind the `Policy` interface (T4). The interface itself
  stays in `src/policy/policy.ts`; only these implementations are archived.
- `criteria.ts` — the balancing measurements (E27). Ten of its twelve criteria
  are read off a run these strategies play, so what they report is a statement
  about the strategy as much as about the model.
- `simulate.ts` — a headless run driven by one of the strategies.

They can still be run by path, e.g. `node archive/criteria.ts --seeds 20`.
