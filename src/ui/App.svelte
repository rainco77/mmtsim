<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../i18n/language.ts";
  import { LANGUAGES, translate } from "../i18n/t.ts";
  import { derive } from "../sim/index.ts";
  import { currentState, game, index, pause, runFree, runToStop, step } from "./game.ts";
  import Band from "./tiles/Band.svelte";
  import Events from "./tiles/Events.svelte";
  import People from "./tiles/People.svelte";
  import Projects from "./tiles/Projects.svelte";
  import Range from "./tiles/Range.svelte";
  import Stores from "./tiles/Stores.svelte";

  /**
   * The screen of the first stage (T9): a top bar that spans, the band below
   * it spanning as well — the frame's head element and the one overview —,
   * then the catalogue left, range over stores in the middle, and the frame
   * column, people over events, at the right. Frame and middle are the same
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
   * Four time grips in four fixed places, all four always on screen. Three
   * start the clock and are dead while it walks; the fourth only pauses and is
   * dead while it stands. No grip ever changes what it does under the finger:
   * a run that halts by itself must not turn the button the hand is already
   * reaching for into a different one.
   *
   * The single step carries a written "+1" rather than a sign: every step sign
   * belongs to the same family as the run signs beside it, reads as the
   * fastest of them, and says nothing about how far it goes.
   */
  const GRIPS = [
    { key: "time.step", icon: "+1", word: true, pauses: false, press: step },
    { key: "time.runToStop", icon: "⏯", word: false, pauses: false, press: runToStop },
    { key: "time.runFree", icon: "▶", word: false, pauses: false, press: runFree },
    { key: "time.pause", icon: "⏸", word: false, pauses: true, press: pause },
  ] as const;
</script>

<div class="page">
  <header class="top">
    <span class="brand">{$t("app.title")}</span>
    <span class="num tick">{$t("time.tick", { tick: state.tick })}</span>
    <span class="num heads">{$t("people.count", { count: Math.round(view.heads) })}</span>
    <nav class="timegrips">
      {#each GRIPS as grip (grip.key)}
        <button
          class:word={grip.word}
          title={$t(grip.key)}
          on:click={grip.press}
          disabled={grip.pauses ? !running : running || ended}
        >
          {grip.icon}
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

  <section class="tile bandtile">
    <Band />
  </section>

  <section class="tile cat">
    <h2>{$t("tile.projects")}</h2>
    <div class="tilebody"><Projects /></div>
  </section>

  <div class="mid">
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
