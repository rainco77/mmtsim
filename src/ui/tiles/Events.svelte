<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { translate } from "../../i18n/t.ts";
  import { derive, type GameState } from "../../sim/index.ts";
  import { currentState, distress, game, index } from "../game.ts";
  import { DISTRESS_KEY, newestTickFirst, type Entry } from "../log.ts";
  import { DISTRESS_TIERS } from "../presentation.ts";

  /**
   * The rolling event log (T9): what the player must not miss, newest first,
   * each line pinned to its tick. Six kinds, all derived from the history the
   * interface keeps; the wording is a key plus numbers (T6). The list is the
   * same material the automatic run's stops are made of.
   */
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  const one = (value: number): string => (Math.round(value * 10) / 10).toFixed(1);

  /** The marked ranks that went short in a tick — the distress's cause. */
  function causesOf(state: GameState): string[] {
    return DISTRESS_TIERS.filter(
      (tier) => (state.lastCoverage[tier] ?? 1) < 1 - 1e-9,
    ) as string[];
  }

  /** Distress deaths of a tick: losses beyond every cohort's base rate. */
  function distressDeaths(previous: GameState, state: GameState): number {
    let dead = 0;
    const cohorts = previous.sectors["households"]?.cohorts ?? {};
    for (const cohort of index.config.population.cohorts) {
      const base = index.config.population.baseSurvival[cohort.id] ?? 1;
      const factor = state.lastSurvival[cohort.id] ?? 1;
      if (factor < base) dead += (cohorts[cohort.id] ?? 0) * (base - factor);
    }
    return dead;
  }

  function eventsBetween(previous: GameState, state: GameState): Entry[] {
    const entries: Entry[] = [];
    const tick = state.tick;

    if (distress(state)) {
      // Cause ids, translated only at render time — a log written in one
      // language would not turn with the switch.
      entries.push({
        tick,
        key: DISTRESS_KEY,
        params: {
          dead: one(distressDeaths(previous, state)),
          cause: causesOf(state).join("|"),
        },
      });
    }

    for (const id of Object.keys(state.seenProjects)) {
      if (!(id in previous.seenProjects))
        entries.push({ tick, key: "events.seen", params: { project: id } });
    }

    for (const [id, count] of Object.entries(state.completedProjects)) {
      if (count <= (previous.completedProjects[id] ?? 0)) continue;
      if (id === "range_change") entries.push({ tick, key: "events.moved", params: {} });
      else if (id === "sedentism")
        entries.push({ tick, key: "events.epochDone", params: {} });
      else entries.push({ tick, key: "events.done", params: { project: id } });
    }

    const before = new Set(
      derive(previous, index)
        .projects.filter((project) => project.available)
        .map((project) => project.id),
    );
    for (const project of derive(state, index).projects) {
      if (!project.available || before.has(project.id)) continue;
      const completions = state.completedProjects[project.id] ?? 0;
      if (completions > (previous.completedProjects[project.id] ?? 0)) continue;
      entries.push({ tick, key: "events.buildable", params: { project: project.id } });
    }

    if (state.abandonedAt !== undefined && previous.abandonedAt === undefined) {
      entries.push({ tick, key: "events.abandoned", params: {} });
    }
    return entries;
  }

  /**
   * The log grows with the history and is never recomputed from the start:
   * deriving twice per tick over the whole run would freeze the tab. Rebuilt
   * only if the history got shorter (a rollback).
   */
  let walked = 1;
  let log: Entry[] = [];

  function grow(history: readonly GameState[]): Entry[] {
    if (history.length < walked) {
      walked = 1;
      log = [];
    }
    for (; walked < history.length; walked += 1) {
      const previous = history[walked - 1];
      const state = history[walked];
      if (previous === undefined || state === undefined) continue;
      log.push(...eventsBetween(previous, state));
    }
    return log;
  }

  $: entries = newestTickFirst(grow($game.history).slice(-40));
  $: state = currentState($game);

  function line(entry: Entry): string {
    const params = { ...entry.params };
    if (typeof params["project"] === "string")
      params["project"] = $t(`name.project.${params["project"]}`);
    if (typeof params["cause"] === "string")
      params["cause"] = params["cause"]
        .split("|")
        .filter((id) => id !== "")
        .map((id) => $t(`name.tier.${id}`))
        .join(", ");
    return $t(entry.key, params);
  }
</script>

<!--
  The weather of the tick that has just run, out of its own record. Peeking the
  stream instead would show the draw of the tick to come — a figure nothing on
  the screen beside it has been reckoned with. A tick that has not run yet has
  no weather to report, and then the line stays away rather than showing one.
-->
<div class="weather">
  {#each Object.keys(index.config.shocks) as shock (shock)}
    {#if state.lastShocks[shock] !== undefined}
      <span
        >{$t(`events.shock.${shock}`, {
          value: (state.lastShocks[shock] ?? 1).toFixed(2),
        })}</span
      >
    {/if}
  {/each}
</div>

<ul class="log">
  {#each entries as entry, i (entry.tick + entry.key + i)}
    <li>
      <span class="tick">{entry.tick}</span>
      <span class:crisis={entry.key === DISTRESS_KEY}>{line(entry)}</span>
    </li>
  {:else}
    <li class="empty">{$t("events.nothing")}</li>
  {/each}
</ul>

<style>
  .weather {
    font-size: 0.8rem;
    color: #8a8578;
    margin-bottom: 0.25rem;
  }
  .log {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 12rem;
    overflow-y: auto;
    font-size: 0.85rem;
  }
  .log li {
    display: flex;
    gap: 0.6rem;
    padding: 0.1rem 0;
    border-bottom: 1px solid #f2ede1;
  }
  .tick {
    min-width: 2.5rem;
    text-align: right;
    color: #8a8578;
    font-variant-numeric: tabular-nums;
  }
  .empty {
    color: #8a8578;
    font-style: italic;
  }
  /* The one line the player must not miss reads as what it is. */
  .crisis {
    color: var(--crit);
    font-weight: 600;
  }
</style>
