<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../i18n/language.ts";
  import { LANGUAGES, translate } from "../i18n/t.ts";
  import { derive } from "../sim/index.ts";
  import { currentState, game, index, pause, runFree, runToStop, step } from "./game.ts";
  import Ladder from "./tiles/Ladder.svelte";
  import People from "./tiles/People.svelte";
  import Range from "./tiles/Range.svelte";

  // One translating function per language switch, not one per render — the
  // store changes only when the language does.
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );
  $: state = currentState($game);
  $: view = derive(state, index);
  $: paused = $game.mode === "paused";

  const TILES = [
    "tile.ladder",
    "tile.people",
    "tile.range",
    "tile.stores",
    "tile.projects",
    "tile.events",
  ] as const;
</script>

<header>
  <strong>{$t("app.title")}</strong>
  <span class="tick">{$t("time.tick", { tick: state.tick })}</span>
  <span class="people">{$t("people.count", { count: Math.round(view.heads) })}</span>
  <nav class="time">
    <button on:click={step} disabled={!paused}>{$t("time.step")}</button>
    <button on:click={runToStop} disabled={!paused}>{$t("time.runToStop")}</button>
    <button on:click={runFree} disabled={!paused}>{$t("time.runFree")}</button>
    <button on:click={pause} disabled={paused}>{$t("time.pause")}</button>
  </nav>
  <nav class="languages">
    {#each LANGUAGES as id (id)}
      <button class:active={$language === id} on:click={() => language.set(id)}>
        {id.toUpperCase()}
      </button>
    {/each}
  </nav>
</header>

<main>
  {#each TILES as tile (tile)}
    <section class:wide={tile === "tile.ladder"}>
      <h2>{$t(tile)}</h2>
      {#if tile === "tile.ladder"}
        <Ladder />
      {:else if tile === "tile.people"}
        <People />
      {:else if tile === "tile.range"}
        <Range />
      {:else}
        <p class="pending">{$t("tile.pending")}</p>
      {/if}
    </section>
  {/each}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #f4f1ea;
    color: #2b2b2b;
  }
  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: #2b2b2b;
    color: #f4f1ea;
  }
  header .time {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }
  header .languages {
    display: flex;
    gap: 0.25rem;
  }
  button {
    font: inherit;
    padding: 0.25rem 0.75rem;
    border: 1px solid #8a8578;
    border-radius: 0.25rem;
    background: #f4f1ea;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .languages button.active {
    background: #c8b98a;
  }
  main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    padding: 0.75rem;
  }
  section {
    background: #fffdf8;
    border: 1px solid #d9d2c0;
    border-radius: 0.5rem;
    padding: 0.75rem;
    min-height: 10rem;
  }
  section.wide {
    grid-column: span 2;
    grid-row: span 2;
  }
  h2 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }
  .pending {
    color: #8a8578;
  }
</style>
