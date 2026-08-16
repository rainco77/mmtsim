<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { translate } from "../../i18n/t.ts";
  import { derive, type ActiveProject } from "../../sim/index.ts";
  import { shownPercent } from "../band.ts";
  import { act, begin, catalogueGroups, currentState, game, index } from "../game.ts";

  /**
   * The project catalogue (T9), four groups in this order: **running** with
   * their grips, **buildable** with the split card — the use-line written by
   * hand, costs and duration from the data — **done** with name and check, and
   * the visible but **in sight** ones with a has/needs bar per condition, the
   * progress bar the monotony rule was made for.
   *
   * Done holds what can never be started again: a one-off that is built, a
   * repeatable whose count is spent. A repeatable with room left comes back to
   * buildable with its counter and never lands in done — it is not over.
   * Without the group a finished one-off fell back among the ones in sight, as
   * though it had never been built.
   *
   * Once seen stays seen; the offers come sorted by the core's own worth
   * figure.
   */
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  const one = (value: number): string => (Math.round(value * 10) / 10).toFixed(1);

  $: state = currentState($game);
  $: previous = $game.history[$game.history.length - 2];
  $: view = derive(state, index);
  $: groups = catalogueGroups(view);
  $: running = groups.running;
  $: buildable = groups.buildable;
  $: done = groups.done;
  $: locked = groups.inSight;

  function activeOf(id: string): ActiveProject | undefined {
    return state.activeProjects.find((project) => project.id === id);
  }

  /** A project whose progress did not move, although it runs, got no hands. */
  function starved(id: string): boolean {
    const now = activeOf(id);
    const before = previous?.activeProjects.find((project) => project.id === id);
    return (
      now !== undefined &&
      !now.paused &&
      before !== undefined &&
      before.progress === now.progress
    );
  }

  /** A name, wherever the surface keeps it: good, capacity, rank, activity. */
  function nameOf(kind: string, id: string): string {
    const key = `name.${kind}.${id}`;
    const named = $t(key);
    return named === key ? id : named;
  }

  /** "Sammeln, Jagen und Fischen" — the last two joined, the rest by commas. */
  function listed(names: readonly string[]): string {
    if (names.length === 0) return "";
    if (names.length === 1) return names[0] ?? "";
    const head = names.slice(0, -1).join(", ");
    return $t("list.and", { head, last: names[names.length - 1] ?? "" });
  }

  /** The generic cost line, read from the content and never written by hand. */
  function costsOf(id: string): string {
    const def = index.project.get(id);
    if (def === undefined) return "";
    const parts = [$t("projects.costLabor", { labor: one(def.laborCost) })];
    for (const [stock, amount] of Object.entries(def.stockCost)) {
      parts.push(`${nameOf("stock", stock)} ${one(amount)}`);
    }
    parts.push($t("projects.duration", { ticks: def.minTicks }));
    return parts.join(" · ");
  }

  /**
   * A condition of a locked project, as a label beside its has/needs bar.
   *
   * **It names the event and carries no raw figures.** "Fischgründe gebaut"
   * rather than a pair of numbers: the bar and its rounded-down percent say how
   * far along it is, and a pair like "13 / 25" made the player read a rule
   * where he only wanted to know whether he was getting closer. Every wording
   * is uninflectable — thing plus participle — so a later epoch can add
   * conditions without thinking about grammar. "Gebaut" carries the ownness:
   * built is always built oneself, and what the range holds free counts for no
   * such condition.
   *
   * One key per kind the core knows, named after that kind — every kind is
   * listed here, so a new one in the core shows up as a bare id and not as a
   * raw key on the screen.
   */
  function conditionLabel(condition: { kind: string } & Record<string, unknown>): string {
    const key = `projects.condition.${condition.kind}`;
    switch (condition.kind) {
      case "projectDone":
        return $t(key, { project: nameOf("project", String(condition["id"])) });
      case "ownedCapacity":
      case "capacityPerHead":
        return $t(key, { what: nameOf("capacity", String(condition["capacity"])) });
      case "stockPerHead":
        return $t(key, { what: nameOf("stock", String(condition["stock"])) });
      case "coverage":
        return $t(key, { what: nameOf("tier", String(condition["tier"])) });
      case "experience":
        return $t(key, {
          what: listed(
            (Array.isArray(condition["activities"]) ? condition["activities"] : []).map(
              (activity: unknown) => nameOf("activity", String(activity)),
            ),
          ),
        });
      case "population":
      case "rule":
      case "unownedCapacity":
      case "strain":
      case "stockDear":
        return $t(key);
      default:
        return condition.kind;
    }
  }

  /** How far a condition stands, rounded down as every standing on the screen. */
  function conditionPercent(unmet: { have: number; need: number }): number {
    return shownPercent(unmet.need > 0 ? unmet.have / unmet.need : 0);
  }
</script>

{#if running.length > 0}
  <h3>{$t("projects.running")}</h3>
  {#each running as project (project.id)}
    {@const active = activeOf(project.id)}
    <div class="row">
      <span class="name">{$t(`name.project.${project.id}`)}</span>
      <span class="bar">
        <span class="fill" style:width={`${project.progress * 100}%`}></span>
      </span>
      <!-- Rounded down like every standing on the screen: "100 %" means done. -->
      <span class="stat">{shownPercent(project.progress)} %</span>
      {#if project.paused}
        <span class="note">{$t("project.paused")}</span>
      {:else if starved(project.id)}
        <span class="note">{$t("project.noHands")}</span>
      {/if}
      {#if active !== undefined}
        <span class="grips">
          <button
            on:click={() =>
              act({ type: "pauseProject", id: project.id, paused: !active.paused })}
          >
            {active.paused ? $t("project.resume") : $t("project.pause")}
          </button>
          <button on:click={() => act({ type: "abandonProject", id: project.id })}>
            {$t("project.abandon")}
          </button>
        </span>
      {/if}
    </div>
  {/each}
{/if}

<h3>{$t("projects.buildable")}</h3>
{#each buildable as project (project.id)}
  <div class="card">
    <div class="row">
      <span class="name">
        {$t(`name.project.${project.id}`)}
        {#if project.completed > 0}
          <span class="counter">×{project.completed}</span>
        {/if}
      </span>
      <button class="start" on:click={() => begin(project.id)}>
        {$t("projects.start")}
      </button>
    </div>
    <p class="use">{$t(`project.use.${project.id}`)}</p>
    <p class="costs">{costsOf(project.id)}</p>
  </div>
{:else}
  <p class="empty">{$t("projects.nothing")}</p>
{/each}

<!--
  Done: name and check mark, nothing more. What a finished thing does for the
  community is a display of its own and comes later; standing here it at least
  stops looking as if it had never been built.
-->
{#if done.length > 0}
  <h3>{$t("projects.done")}</h3>
  {#each done as project (project.id)}
    <div class="row finished">
      <span class="name">{$t(`name.project.${project.id}`)}</span>
      <span class="check">✓</span>
    </div>
  {/each}
{/if}

{#if locked.length > 0}
  <h3>{$t("projects.locked")}</h3>
  {#each locked as project (project.id)}
    <div class="card locked">
      <div class="row">
        <span class="name">{$t(`name.project.${project.id}`)}</span>
      </div>
      <p class="use">{$t(`project.use.${project.id}`)}</p>
      {#each project.missing as unmet (JSON.stringify(unmet.condition))}
        <div class="row condition">
          <span class="label">{conditionLabel(unmet.condition)}</span>
          <span class="bar">
            <span
              class="fill needs"
              style:width={`${unmet.need > 0 ? Math.min(1, unmet.have / unmet.need) * 100 : 0}%`}
            ></span>
          </span>
          <span class="stat">{conditionPercent(unmet)} %</span>
        </div>
      {/each}
    </div>
  {/each}
{/if}

<style>
  h3 {
    margin: 0.5rem 0 0.25rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #8a8578;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  .name {
    font-weight: 600;
    min-width: 7rem;
  }
  .counter {
    color: #8a8578;
    font-weight: 400;
  }
  .bar {
    flex: 1 1 3rem;
    min-width: 3rem;
    height: 0.55rem;
    background: #eee7d7;
    border-radius: 4px;
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    background: #b0793a;
    border-radius: 4px;
  }
  .fill.needs {
    background: #6b8f2f;
  }
  .stat {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .note {
    color: #8f2f2f;
    font-size: 0.8rem;
  }
  .grips {
    display: inline-flex;
    gap: 0.4rem;
    margin-left: auto;
  }
  button {
    font: inherit;
    font-size: 0.8rem;
    padding: 0.15rem 0.6rem;
    border: 1px solid #8a8578;
    border-radius: 0.25rem;
    background: #f4f1ea;
    cursor: pointer;
  }
  .card {
    border-bottom: 1px solid #eee7d7;
    padding: 0.35rem 0;
  }
  .card .start {
    margin-left: auto;
  }
  .use {
    margin: 0.15rem 0;
    font-size: 0.85rem;
    color: #5b5647;
  }
  .costs {
    margin: 0.15rem 0 0;
    font-size: 0.8rem;
    color: #8a8578;
  }
  .card.locked .name {
    color: #8a8578;
  }
  .finished .name {
    font-weight: 400;
  }
  .finished .check {
    color: #6b8f2f;
  }
  .condition .label {
    min-width: 9rem;
    font-size: 0.8rem;
    color: #5b5647;
  }
  .empty {
    color: #8a8578;
    font-style: italic;
    font-size: 0.85rem;
  }
</style>
