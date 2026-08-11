<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { translate } from "../../i18n/t.ts";
  import { derive, type ActiveProject } from "../../sim/index.ts";
  import { act, begin, currentState, game, index } from "../game.ts";

  /**
   * The project catalogue (T9), three groups: running with their grips,
   * buildable with the split card — the use-line written by hand, costs and
   * duration from the data, the consequences as figures — and the visible but
   * locked ones with a has/needs bar per condition, the progress bar the
   * monotony rule was made for. Once seen stays seen; the offers come sorted
   * by the core's own worth figure.
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
  $: running = view.projects.filter((project) => project.running);
  $: buildable = view.projects
    .filter((project) => project.available && !project.running)
    .sort((a, b) => b.worth - a.worth);
  $: locked = view.projects.filter(
    (project) => project.visible && !project.available && !project.running,
  );

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

  function nameOf(id: string, kind: "stock" | "capacity" | "either"): string {
    const keys =
      kind === "either"
        ? [`name.stock.${id}`, `name.capacity.${id}`]
        : [`name.${kind}.${id}`];
    for (const key of keys) {
      const named = $t(key);
      if (named !== key) return named;
    }
    return id;
  }

  /** The generic cost line, read from the content and never written by hand. */
  function costsOf(id: string): string {
    const def = index.project.get(id);
    if (def === undefined) return "";
    const parts = [$t("projects.costLabor", { labor: one(def.laborCost) })];
    for (const [stock, amount] of Object.entries(def.stockCost)) {
      parts.push(`${nameOf(stock, "stock")} ${one(amount)}`);
    }
    parts.push($t("projects.duration", { ticks: def.minTicks }));
    return parts.join(" · ");
  }

  /**
   * A condition of a locked project, as a label beside its has/needs bar. One
   * key per kind the core knows, named after that kind — every kind is listed
   * here, so a new one in the core shows up as a bare id and not as a raw key
   * on the screen.
   */
  function conditionLabel(condition: { kind: string } & Record<string, unknown>): string {
    const key = `projects.condition.${condition.kind}`;
    switch (condition.kind) {
      case "projectDone":
        return $t(key, { project: $t(`name.project.${String(condition["id"])}`) });
      case "ownedCapacity":
      case "capacityPerHead":
        return $t(key, { what: nameOf(String(condition["capacity"]), "capacity") });
      case "stockPerHead":
        return $t(key, { what: nameOf(String(condition["stock"]), "stock") });
      case "population":
      case "rule":
      case "unownedCapacity":
      case "coverage":
      case "experience":
      case "strain":
      case "stockDear":
        return $t(key);
      default:
        return condition.kind;
    }
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
      <span class="stat">{Math.round(project.progress * 100)} %</span>
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
          <span class="stat">{one(unmet.have)} / {one(unmet.need)}</span>
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
