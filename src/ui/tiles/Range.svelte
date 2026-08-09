<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { translate } from "../../i18n/t.ts";
  import { derive, type GameState } from "../../sim/index.ts";
  import { act, currentState, game, index } from "../game.ts";
  import Spark from "./Spark.svelte";

  /**
   * The range tile (T9): per renewable stock its level against the ceiling,
   * the tick's regrowth and taking, the search costs with their course — the
   * epoch's price display — and the tended bonus fading. Expanded: the
   * processes that draw from the stock. Below, the move pair with the price
   * tag on the moving button: what a move sets to nothing, listed from the
   * project's own effects.
   */
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  const MOVE = "range_change";

  const one = (value: number): string => (Math.round(value * 10) / 10).toFixed(1);
  const two = (value: number): string => (Math.round(value * 100) / 100).toFixed(2);

  /** What the tick took of a stock, from the recorded runs. */
  function takenOf(state: GameState, id: string): number {
    let taken = 0;
    for (const run of state.lastRuns) {
      taken +=
        run.output * (index.process.get(run.process)?.intermediatesPerOutput[id] ?? 0);
    }
    return taken;
  }

  /** What grew back this tick: the record's opening level against the last close. */
  function regrownOf(
    previous: GameState | undefined,
    state: GameState,
    id: string,
  ): number {
    const opened = state.lastStore[id]?.before;
    const closed = previous?.lastStore[id]?.after;
    if (opened === undefined || closed === undefined) return 0;
    return Math.max(0, opened - closed);
  }

  /** The processes that drew from a stock this tick, with labour and yield. */
  function drawersOf(state: GameState, id: string) {
    return state.lastRuns.filter(
      (run) => (index.process.get(run.process)?.intermediatesPerOutput[id] ?? 0) > 0,
    );
  }

  /** The worth of the land underfoot: its kinds weighted by area (E13). */
  function standingOf(state: GameState): number {
    let area = 0;
    let weighted = 0;
    const held = state.sectors["households"]?.capacityHeld ?? {};
    for (const kind of Object.keys(index.config.land.perHeadAtStart)) {
      for (const capacity of [held[kind], state.unownedCapacity[kind]]) {
        if (capacity === undefined) continue;
        area += capacity.amount;
        weighted += capacity.amount * capacity.quality;
      }
    }
    return area > 0 ? weighted / area : index.config.land.baseQuality;
  }

  /**
   * The price tag (T9): everything the move's own effects set to nothing that
   * is worth something right now — read from the content, never spelled out.
   */
  function priceOf(state: GameState, view: ReturnType<typeof derive>) {
    const price: { key: string; amount: number }[] = [];
    const effects = index.project.get(MOVE)?.effects ?? [];
    for (const effect of effects) {
      if (!("to" in effect) || effect.to === undefined) continue;
      if (effect.to.kind !== "fixed" || effect.to.value !== 0) continue;
      if (effect.type === "setCapacity") {
        const amount = view.ownedCapacity[effect.capacity]?.amount ?? 0;
        if (amount > 0.05)
          price.push({ key: `name.capacity.${effect.capacity}`, amount });
      }
      if (effect.type === "stock") {
        const amount = view.stocks[effect.id] ?? 0;
        if (amount > 0.05) price.push({ key: `name.stock.${effect.id}`, amount });
      }
    }
    return price;
  }

  $: history = $game.history;
  $: state = currentState($game);
  $: previous = history[history.length - 2];
  $: view = derive(state, index);
  $: stands = Object.entries(view.renewable);
  $: standing = standingOf(state);
  $: offered = view.nextTakingQuality;
  $: moveOffered = view.projects.some(
    (project) => project.id === MOVE && project.available && !project.running,
  );
  $: price = priceOf(state, view);

  function move(): void {
    act({ type: "startProject", id: MOVE });
  }
</script>

{#each stands as [id, stand] (id)}
  <details class="stand">
    <summary>
      <span class="name">{$t(`name.stock.${id}`)}</span>
      <span
        class="bar"
        role="img"
        aria-label={$t("range.stand", {
          held: one(stand.held),
          ceiling: one(stand.ceiling),
        })}
      >
        <span
          class="fill"
          style:width={`${Math.min(100, (stand.held / Math.max(1e-9, stand.ceiling)) * 100)}%`}
        ></span>
      </span>
      <span class="stat"
        >{$t("range.stand", { held: one(stand.held), ceiling: one(stand.ceiling) })}</span
      >
      <span class="flow">
        {$t("range.flow", {
          grown: one(regrownOf(previous, state, id)),
          taken: one(takenOf(state, id)),
        })}
      </span>
      <span class="effort">
        {$t("range.effort", { effort: two(state.lastEffort[id] ?? 1) })}
        <Spark
          values={history.map((entry) => entry.lastEffort[id] ?? 1)}
          width={70}
          height={18}
        />
      </span>
      {#if (state.rangeCarries[id] ?? 0) > 0.05}
        <span class="tended"
          >{$t("range.tended", { tended: one(state.rangeCarries[id] ?? 0) })}</span
        >
      {/if}
    </summary>
    <div class="drawers">
      {#each drawersOf(state, id) as run (run.process)}
        <span>
          {$t(`name.process.${run.process}`)} — {$t("range.work", {
            labor: one(run.labor),
          })},
          {$t("range.yield", { output: one(run.output) })}
        </span>
      {:else}
        <span>{$t("range.untouched")}</span>
      {/each}
    </div>
  </details>
{/each}

<div class="pair">
  <span>{$t("range.pair", { standing: two(standing), offered: two(offered) })}</span>
  <button on:click={move} disabled={!moveOffered}>{$t("range.move")}</button>
</div>
{#if price.length > 0}
  <p class="price">
    {$t("range.movePrice")}
    {#each price as item, i (item.key)}{i > 0 ? " · " : " "}{$t(item.key)}
      {one(item.amount)}{/each}
  </p>
{/if}

<style>
  details.stand {
    border-bottom: 1px solid #eee7d7;
    padding: 0.25rem 0;
    font-size: 0.85rem;
  }
  summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    cursor: pointer;
    list-style: none;
  }
  .name {
    min-width: 4.5rem;
    font-weight: 600;
  }
  .bar {
    flex: 1 1 4rem;
    min-width: 4rem;
    height: 0.55rem;
    background: #eee7d7;
    border-radius: 4px;
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    background: #6b8f2f;
    border-radius: 4px;
  }
  .stat,
  .flow,
  .tended {
    color: #5b5647;
    white-space: nowrap;
  }
  .effort {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }
  .drawers {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.25rem 0 0.25rem 1rem;
    color: #5b5647;
  }
  .pair {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  .pair button {
    font: inherit;
    padding: 0.25rem 0.75rem;
    border: 1px solid #8a8578;
    border-radius: 0.25rem;
    background: #f4f1ea;
    cursor: pointer;
  }
  .pair button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .price {
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    color: #8f2f2f;
  }
</style>
