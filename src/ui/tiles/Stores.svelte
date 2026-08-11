<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { translate } from "../../i18n/t.ts";
  import type { GameState } from "../../sim/index.ts";
  import { act, currentState, game, index } from "../game.ts";
  import Spark from "./Spark.svelte";

  /**
   * The stores tile (T9), split by the two reserve mechanics the content
   * knows. A sheltered good's target is the capacity itself — "how large the
   * store is, is what was decided when it was dug" — with the capacity drawn
   * as its own course, so every pit is a step and the quiet decay shows. A
   * good that keeps takes amount and rank from the player. The grips sit here
   * and on the store's card in the band alike: one setting, two windows.
   */
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  const one = (value: number): string => (Math.round(value * 10) / 10).toFixed(1);

  interface StoreRow {
    readonly stock: string;
    readonly fill: number;
    readonly target: number;
    readonly rank: number;
    readonly adjustable: boolean;
    readonly capacityCourse?: readonly number[];
  }

  function fillOf(state: GameState, stock: string): number {
    return state.sectors["households"]?.stocks[stock] ?? 0;
  }

  function rowsOf(state: GameState, history: readonly GameState[]): StoreRow[] {
    const rows: StoreRow[] = [];
    for (const stockDef of index.config.stocks) {
      const shelter = stockDef.protectedBy;
      if (shelter !== undefined) {
        rows.push({
          stock: stockDef.id,
          fill: fillOf(state, stockDef.id),
          target:
            state.sectors["households"]?.capacityHeld[shelter.capacity]?.amount ?? 0,
          rank: state.stockRanks[stockDef.id] ?? shelter.rank,
          adjustable: false,
          capacityCourse: history.map(
            (entry) =>
              entry.sectors["households"]?.capacityHeld[shelter.capacity]?.amount ?? 0,
          ),
        });
      }
      if (stockDef.keeping !== undefined) {
        rows.push({
          stock: stockDef.id,
          fill: fillOf(state, stockDef.id),
          target: state.stockTargets[stockDef.id] ?? 0,
          rank: state.stockRanks[stockDef.id] ?? stockDef.keeping.rank,
          adjustable: true,
        });
      }
    }
    return rows;
  }

  /**
   * The two grips are two actions, because one of the stores has no amount:
   * what the pits hold is what was decided when they were dug, and only
   * another pit lifts it. Sending a nought amount along with the rank was
   * refused outright, so the sheltered store could not be ranked at all.
   */
  function setAmount(stock: string, amount: number): void {
    if (Number.isFinite(amount)) act({ type: "setStockTarget", stock, amount });
  }

  function setRank(stock: string, rank: number): void {
    if (Number.isFinite(rank)) act({ type: "setStockRank", stock, rank });
  }

  $: history = $game.history;
  $: state = currentState($game);
  $: rows = rowsOf(state, history);
</script>

{#each rows as row (row.stock)}
  {@const moved = state.lastStore[row.stock]}
  <div class="store">
    <div class="line">
      <span class="name">{$t(`name.stock.${row.stock}`)}</span>
      <span class="bar">
        <span
          class="fill"
          style:width={`${row.target > 0 ? Math.min(1, row.fill / row.target) * 100 : 0}%`}
        ></span>
      </span>
      <span class="stat">{one(row.fill)} / {one(row.target)}</span>
      {#if moved !== undefined && Math.abs(moved.before - moved.after) > 0.05}
        <span class="moved">
          {$t("store.moved", { from: one(moved.before), to: one(moved.after) })}
        </span>
      {/if}
    </div>
    <div class="line low">
      <Spark
        values={history.map((entry) => fillOf(entry, row.stock))}
        width={140}
        height={20}
      />
      {#if row.capacityCourse !== undefined}
        <span class="capacity">
          {$t("stores.capacity")}
          <Spark values={row.capacityCourse} width={90} height={20} stroke="#5f8a9a" />
        </span>
      {/if}
      <span class="grips">
        {#if row.adjustable}
          <label>
            {$t("store.amount")}
            <input
              type="number"
              value={row.target}
              on:change={(event) =>
                setAmount(row.stock, Number(event.currentTarget.value))}
            />
          </label>
        {:else}
          <span class="hint">{$t("stores.dugTarget")}</span>
        {/if}
        <label>
          {$t("store.rank")}
          <input
            type="number"
            value={row.rank}
            on:change={(event) => setRank(row.stock, Number(event.currentTarget.value))}
          />
        </label>
      </span>
    </div>
  </div>
{/each}

<style>
  .store {
    border-bottom: 1px solid #eee7d7;
    padding: 0.25rem 0;
    font-size: 0.85rem;
  }
  .line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .line.low {
    margin-top: 0.2rem;
    color: #5b5647;
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
    background: #5f8a9a;
    border-radius: 4px;
  }
  .stat,
  .moved {
    white-space: nowrap;
  }
  .capacity {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }
  .grips {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }
  .grips input {
    width: 4rem;
    font: inherit;
  }
  .hint {
    color: #8a8578;
    font-style: italic;
  }
</style>
