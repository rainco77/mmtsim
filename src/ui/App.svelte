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
  $: running = $game.mode !== "paused";
  $: ended = state.abandonedAt !== undefined;

  /**
   * The three time grips, in fixed places. The two that start a run carry the
   * mode they put the clock into, so the running one can turn into the pause
   * where it stands: nothing moves under the finger, and the grip that stopped
   * the clock is the one that started it. The other two wait, greyed.
   *
   * The step grip is the odd one out — it never leaves the clock running, so
   * it never becomes a pause.
   */
  const GRIPS = [
    { key: "time.step", icon: "⏭", mode: undefined, press: step },
    { key: "time.runToStop", icon: "⏯", mode: "toStop", press: runToStop },
    { key: "time.runFree", icon: "▶", mode: "free", press: runFree },
  ] as const;
</script>

<div class="page">
  <header class="top">
    <span class="brand">{$t("app.title")}</span>
    <span class="num tick">{$t("time.tick", { tick: state.tick })}</span>
    <span class="num heads">{$t("people.count", { count: Math.round(view.heads) })}</span>
    <nav class="timegrips">
      {#each GRIPS as grip (grip.key)}
        {@const holding = running && grip.mode === $game.mode}
        <button
          title={holding ? $t("time.pause") : $t(grip.key)}
          on:click={holding ? pause : grip.press}
          disabled={ended || (running && !holding)}
        >
          {holding ? "⏸" : grip.icon}
        </button>
      {/each}
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
