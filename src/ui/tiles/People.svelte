<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { translate } from "../../i18n/t.ts";
  import type { GameState } from "../../sim/index.ts";
  import { currentState, game, index } from "../game.ts";
  import Spark from "./Spark.svelte";

  /**
   * The people tile (T9): the head count with its course, the cohorts stacked
   * under it, the tick's births and deaths from the record — and the carrying
   * brake as its own curve, because outside the crises the brake is what sets
   * the level. Expanded: the survival factor per cohort over the run.
   */
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  /** Fixed categorical order, validated against the light surface. */
  const COHORT_COLORS = ["#2f6fa3", "#b0793a"];

  const cohortIds = index.config.population.cohorts.map((cohort) => cohort.id);

  function headsOf(state: GameState): number {
    const cohorts = state.sectors["households"]?.cohorts ?? {};
    let sum = 0;
    for (const id of cohortIds) sum += cohorts[id] ?? 0;
    return sum;
  }

  function cohortOf(state: GameState, id: string): number {
    return state.sectors["households"]?.cohorts[id] ?? 0;
  }

  /** Deaths of the tick: the cohorts before, thinned by the recorded factors. */
  function deathsOf(previous: GameState | undefined, state: GameState): number {
    if (previous === undefined) return 0;
    let dead = 0;
    for (const id of cohortIds) {
      dead += cohortOf(previous, id) * (1 - (state.lastSurvival[id] ?? 1));
    }
    return dead;
  }

  /** The cohorts stacked into areas, normalised to the run's highest count. */
  function stackPaths(history: readonly GameState[], w: number, h: number): string[] {
    if (history.length < 2) return cohortIds.map(() => "");
    let peak = 0;
    for (const state of history) peak = Math.max(peak, headsOf(state));
    if (peak <= 0) return cohortIds.map(() => "");
    const dx = w / (history.length - 1);
    const y = (value: number): string => (h - (value / peak) * (h - 2)).toFixed(1);
    const lower: number[] = history.map(() => 0);
    return cohortIds.map((id) => {
      const upper = history.map((state, i) => (lower[i] ?? 0) + cohortOf(state, id));
      const top = upper.map((value, i) => `${(i * dx).toFixed(1)},${y(value)}`);
      const bottom = lower
        .map((value, i) => `${(i * dx).toFixed(1)},${y(value)}`)
        .reverse();
      for (let i = 0; i < lower.length; i += 1) lower[i] = upper[i] ?? 0;
      return `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`;
    });
  }

  const one = (value: number): string => (Math.round(value * 10) / 10).toFixed(1);
  const two = (value: number): string => (Math.round(value * 100) / 100).toFixed(2);

  $: history = $game.history;
  $: state = currentState($game);
  $: previous = history[history.length - 2];
  $: heads = headsOf(state);
  $: born = state.lastBorn;
  $: dead = deathsOf(previous, state);
  $: carrying = state.lastBirthFactors.carrying;
  $: carryingCourse = history.map((entry) => entry.lastBirthFactors.carrying);
  $: paths = stackPaths(history, 240, 60);
</script>

<div class="headline">
  <span class="count">{one(heads)}</span>
  <span class="flows">
    {$t("people.births", { born: two(born) })} ·
    {$t("people.deaths", { dead: two(dead) })}
  </span>
</div>

<svg
  viewBox="0 0 240 60"
  width="100%"
  height="60"
  role="img"
  aria-label={$t("tile.people")}
>
  {#each paths as path, i (i)}
    <path d={path} fill={COHORT_COLORS[i % COHORT_COLORS.length]} opacity="0.85" />
  {/each}
</svg>
<div class="legend">
  {#each cohortIds as id, i (id)}
    <span>
      <i style:background={COHORT_COLORS[i % COHORT_COLORS.length]}></i>
      {$t(`name.cohort.${id}`)}
      {one(cohortOf(state, id))}
    </span>
  {/each}
</div>

<div class="brake">
  <span>{$t("people.brake", { carrying: two(carrying) })}</span>
  <Spark values={carryingCourse} width={120} height={22} />
</div>

{#if state.abandonedAt !== undefined}
  <p class="abandoned">{$t("people.abandoned", { tick: state.abandonedAt })}</p>
{/if}

<details>
  <summary>{$t("people.survival")}</summary>
  {#each cohortIds as id (id)}
    <div class="survival">
      <span>{$t(`name.cohort.${id}`)} {two(state.lastSurvival[id] ?? 1)}</span>
      <Spark
        values={history.map((entry) => entry.lastSurvival[id] ?? 1)}
        width={160}
        height={22}
      />
    </div>
  {/each}
</details>

<style>
  .headline {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }
  .count {
    font-size: 1.6rem;
    font-weight: 600;
  }
  .flows {
    color: #5b5647;
    font-size: 0.85rem;
  }
  .legend {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #5b5647;
  }
  .legend i {
    display: inline-block;
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 2px;
    margin-right: 0.3rem;
  }
  .brake {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
    font-size: 0.85rem;
  }
  .abandoned {
    color: #8f2f2f;
    font-weight: 600;
  }
  details {
    margin-top: 0.5rem;
    font-size: 0.85rem;
  }
  .survival {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }
</style>
