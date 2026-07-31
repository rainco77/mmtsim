---
name: playtest
description: Play mmtsim tick by tick in a live session and report what is implausible, academically wrong, or dull. Use when asked to playtest, to try a seed, or to check how a change feels in play.
---

# Playtesting mmtsim

You play the simulation like a person would, one tick at a time, and report what
you find.

**Do not read the source.** Not the model, not the content, not the tools —
`tools/session.ts` included. You are a player, not a reviewer. Everything about
the game you need comes from the instruction that started you: what the epoch
holds, what the needs and processes and projects are, what to expect. If
something is missing from it, ask for it rather than going to look.

Two reasons, and both matter. What is worth having from you is the view of
someone who does *not* know how it is built — you notice what the numbers say,
not what they were meant to say. And reading the source is what eats the budget:
a run has been spent entirely on orientation before, without a single tick being
played. You are not measuring averages — averages have repeatedly produced
false conclusions in this project, and every one of them was only caught by
looking at single ticks. **Never draw a conclusion from a total or a mean.**

## The session

A Node process holds the state in memory and evaluates JavaScript you send it.
Start it on a port of your own, so several runs can go on at once:

```
MMTSIM_SESSION_PORT=7900 node tools/session.ts &
```

Then send expressions to `http://127.0.0.1:7900/eval` by POST. The body is
JavaScript. `s` is the state and is written back after every call, so the run
carries on where you left it.

```
s = reset(42)                                    start over on a seed
s = tick(s)                                      one tick
s = run(s, 20)                                   twenty ticks, nothing printed
s = act(s, {type:"startProject", id:"x"})        an action; throws if refused
overview(s)                                      the short view, see below
derive(s)                                        everything — see the warning
config()                                         the content as data
```

A block of statements works and answers with its last value, with or without
`return`. Loops and declarations work.

## Look narrowly

`derive(s)` is large. Asking for it whole on every step is the one way to make
this expensive, and the cost of a run is dominated by how much comes back.

- `overview(s)` is the standard look: population, birth and death rates, coverage
  of every need, every capacity with how much of it is in use, every stock,
  what is running, the weather, what is short, and the projects — offered,
  building, locked. It is derived entirely from the configuration, so it says
  the same kind of thing in every epoch.
- Beyond that, **project down to what you need**: `derive(s).tiers.map(t => [t.tier, t.coverage])`,
  not `derive(s)`.
- Advance with `run(s, n)` and look at the end of the stretch. Look at every
  tick — `for (…) { s = tick(s); rows.push(overview(s).people) }` — only where
  you are watching something closely.

## What to look at

1. **Is it plausible?** Do the numbers fit together, does the labour add up,
   does what you are shown match what is happening?
2. **Is it academically defensible?** Not only "no error in the model", but:
   does this develop the way the development of human societies is described in
   the literature? A foraging band sits *at* the carrying capacity of its range.
   Storage comes before settling. Intensification is forced by scarcity, not
   chosen. Population presses on a fixed factor.
3. **Does it hold up as a game?** At *this* point, does the player have anything
   to decide, and does an earlier decision show a visible consequence? Over the
   arc: too many levers overwhelm, too few bore; a reward that comes too early
   deflates, one that comes too late frustrates. Long stretches with nothing on
   offer and nothing changing are a defect, not a lull.

## How far to play

**From the instruction that started you** — not from this file, because it
changes with whatever is being tested. Stop as soon as you have something worth
reporting; a finding after ten ticks is worth more than three hundred ticks of
confirmation. If you were given no bound and no goal, ask for one.

## Findings

Keep a `findings.md` and append to it the moment you find something, rather than
collecting until the end. It costs nothing, it survives being stopped, and
whoever started you can read it while you are still playing.

Anchor every finding to the tick that produced it and say which of the three
questions it fails. "At tick 124 the worst weather of the run leaves hunger
fully covered" is checkable; "the variance feels weak" is not.

Report in English. Change no file except your own notes. Do not run the criteria
tool and do not run the tests — both are the opposite of this exercise.
