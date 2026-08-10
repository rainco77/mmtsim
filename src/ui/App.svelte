<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../i18n/language.ts";
  import { LANGUAGES, translate } from "../i18n/t.ts";
  import { derive } from "../sim/index.ts";
  import { currentState, game, index, pause, runFree, runToStop, step } from "./game.ts";
  import Events from "./tiles/Events.svelte";
  import Ladder from "./tiles/Ladder.svelte";
  import People from "./tiles/People.svelte";
  import Projects from "./tiles/Projects.svelte";
  import Range from "./tiles/Range.svelte";
  import Stores from "./tiles/Stores.svelte";

  /**
   * The screen of the first stage (T9): a top bar that spans, the catalogue
   * left, the ladder in the middle, range over stores beside it, and the frame
   * column — people over events — at the right. Frame and middle are the same
   * split the concept names; the shell knows the places, the tiles know their
   * contents.
   */

  // One translating function per language switch, not one per render — the
  // store changes only when the language does.
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );
  $: state = currentState($game);
  $: view = derive(state, index);
  // While the clock walks by itself the three grips give way to the pause;
  // a grip is only there when it means something (T9).
  $: running = $game.mode !== "paused";
  $: ended = state.abandonedAt !== undefined;
</script>

<div class="page">
  <header class="top">
    <span class="brand">{$t("app.title")}</span>
    <span class="num tick">{$t("time.tick", { tick: state.tick })}</span>
    <span class="num heads">{$t("people.count", { count: Math.round(view.heads) })}</span>
    <nav class="timegrips">
      {#if running}
        <button title={$t("time.pause")} on:click={pause}>⏸</button>
      {:else}
        <button title={$t("time.step")} on:click={step} disabled={ended}>⏯</button>
        <button
          class="primary"
          title={$t("time.runToStop")}
          on:click={runToStop}
          disabled={ended}>⏩</button
        >
        <button title={$t("time.runFree")} on:click={runFree} disabled={ended}>▶</button>
      {/if}
    </nav>
    <nav class="lang">
      {#each LANGUAGES as id (id)}
        <button class:on={$language === id} on:click={() => language.set(id)}>
          {id.toUpperCase()}
        </button>
      {/each}
    </nav>
  </header>

  <section class="tile cat">
    <h2>{$t("tile.projects")}</h2>
    <div class="tilebody"><Projects /></div>
  </section>

  <section class="tile ladder">
    <h2>{$t("tile.ladder")}</h2>
    <div class="tilebody"><Ladder /></div>
  </section>

  <div class="side">
    <section class="tile range">
      <h2>{$t("tile.range")}</h2>
      <div class="tilebody"><Range /></div>
    </section>
    <section class="tile stores">
      <h2>{$t("tile.stores")}</h2>
      <div class="tilebody"><Stores /></div>
    </section>
  </div>

  <div class="frame">
    <section class="tile people">
      <h2>{$t("tile.people")}</h2>
      <div class="tilebody"><People /></div>
    </section>
    <section class="tile log">
      <h2>{$t("tile.events")}</h2>
      <div class="tilebody"><Events /></div>
    </section>
  </div>
</div>
