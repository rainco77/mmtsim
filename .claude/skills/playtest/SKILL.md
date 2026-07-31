---
name: playtest
description: Play mmtsim tick by tick as a thinking player and report what is implausible, academically wrong, or dull. Use when asked to playtest, to try a seed, or to check how a change feels in play.
---

# Playtesting mmtsim

You play the simulation like a person would, one tick at a time, and report what
you find. You are not measuring averages — averages have repeatedly produced
false conclusions in this project, and every one of them was only caught by
looking at single ticks. **Never draw a conclusion from a total or a mean.**

## How to play

A run lives in a file and is **continued**, never replayed. Open it once:

```
node tools/play.ts --new --seed <N> --into run.json
```

Then play, one call at a time. Each call prints only the ticks it just played:

```
node tools/play.ts --in run.json --step 20
node tools/play.ts --in run.json --do '{"start":"sickle_blades","rank":110}' --step 20
```

Actions:

```
{"start":"id"}                start a project at its declared urgency
{"start":"id","rank":110}     start it at a chosen urgency (lower = earlier)
{"pause":"id"}  {"resume":"id"}  {"abandon":"id"}
{"rank":"id","to":110}        move a running project's urgency
```

Stepping prints **one line per tick** and then the full view of where you now
stand — the only tick you can act at, so the only one whose offers matter. That
line carries what a decision hangs on: population, the weather that just fell,
coverage of every need, birth and death rates in per mille, idle labour, the
store, what is short, and what is being built.

`--full` prints every tick in full — expensive, use it only for a short stretch
you are examining closely. `--quiet` prints the final tick only, for bridging a
stretch you do not need to read. `--log` lists what you have done so far.

Read every tick you print before deciding the next move.

**How far to play, in what steps, and when to stop comes from the instruction
that started you.** It is not fixed here, because it changes with whatever is
being tested. If you were given no bound, ask for one rather than playing on
indefinitely.

**Keep it cheap.** Never re-open a run to get back to a point you have already
played — the file has it. Never print a stretch twice. If you only need to know
where a long stretch ended, use `--quiet`.

## What to look at, every tick

1. **Is it plausible?** Do the numbers fit together, does the labour line add
   up (processes + projects + idle = total), does the display say what is
   actually happening?
2. **Is it academically defensible?** Not only "no error in the model", but:
   does this develop the way the development of human societies is described in
   the literature? A foraging band sits *at* the carrying capacity of its range.
   Storage comes before settling. Intensification is forced by scarcity, not
   chosen. Population presses on a fixed factor.
3. **Does it hold up as a game?** At *this* tick, does the player have anything
   to decide, and does an earlier decision show a visible consequence? Over the
   arc: too many levers overwhelm, too few bore; a reward that comes too early
   deflates, one that comes too late frustrates. Long stretches with nothing on
   offer and nothing changing are a defect, not a lull.

## Write findings down as you go

Keep a `findings.md` next to the run file and append to it the moment you find
something, rather than collecting everything until the end. It costs nothing and
it means the work survives if you are stopped, run out of time, or fail — and
whoever started you can look in while you are still playing.

## What to report

A short written report, in English, repeating what is in `findings.md`:

- **The course of the run** in a handful of lines: what you did and when, what
  happened, where it turned.
- **Findings**, each one anchored to the tick that produced it. "At tick 124 the
  worst weather of the run leaves hunger fully covered" is checkable; "the
  variance feels weak" is not. Say which of the three questions it fails.
- **What you could not decide** — anything where you had no basis for choosing,
  or where the interface did not tell you what you needed.

Do not change any file. Do not run the criteria tool. Report only.
