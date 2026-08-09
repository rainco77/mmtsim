<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { translate } from "../../i18n/t.ts";
  import type { ActiveProject, GameState, NeedTierDef } from "../../sim/index.ts";
  import { act, currentState, game, index } from "../game.ts";

  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  $: state = currentState($game);
  $: previous = $game.history[$game.history.length - 2];

  /**
   * The one ladder the model actually has (T9): every claim on labour in rank
   * order — need tiers, running projects, reserve claims — and free labour as
   * the footer. Everything shown of the past comes from the tick's record.
   */
  type Row =
    | { kind: "need"; rank: number; tier: NeedTierDef }
    | { kind: "project"; rank: number; project: ActiveProject }
    | {
        kind: "reserve";
        rank: number;
        stock: string;
        fill: number;
        target: number;
        adjustable: boolean;
      };

  function reserveRows(now: GameState): Row[] {
    const rows: Row[] = [];
    const stocks = now.sectors["households"]?.stocks ?? {};
    for (const stockDef of index.config.stocks) {
      const shelter = stockDef.protectedBy;
      if (shelter !== undefined) {
        const capacity = now.sectors["households"]?.capacityHeld[shelter.capacity];
        rows.push({
          kind: "reserve",
          rank: now.stockRanks[stockDef.id] ?? shelter.rank,
          stock: stockDef.id,
          fill: stocks[stockDef.id] ?? 0,
          target: capacity?.amount ?? 0,
          adjustable: false,
        });
      }
      if (stockDef.keeping !== undefined) {
        rows.push({
          kind: "reserve",
          rank: now.stockRanks[stockDef.id] ?? stockDef.keeping.rank,
          stock: stockDef.id,
          fill: stocks[stockDef.id] ?? 0,
          target: now.stockTargets[stockDef.id] ?? 0,
          adjustable: true,
        });
      }
    }
    return rows;
  }

  $: rows = (
    [
      ...index.config.needTiers.map((tier): Row => ({
        kind: "need",
        rank: tier.rank,
        tier,
      })),
      ...state.activeProjects.map((project): Row => ({
        kind: "project",
        rank: project.rank,
        project,
      })),
      ...reserveRows(state),
    ] as Row[]
  ).sort((a, b) => a.rank - b.rank);

  $: freeShare =
    state.lastLabor.available > 0
      ? state.lastLabor.unused / state.lastLabor.available
      : 0;

  // Which need rows are folded open. Kept by tier id, so a re-sort keeps it.
  let open: Record<string, boolean> = {};

  /** A project whose progress did not move, although it runs, got no hands. */
  function starved(project: ActiveProject): boolean {
    if (project.paused || previous === undefined) return false;
    const before = previous.activeProjects.find((p) => p.id === project.id);
    return before !== undefined && before.progress === project.progress;
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

  /** The record's supply of the good behind a tier: runs of its branch. */
  function supplyOf(now: GameState, tier: NeedTierDef) {
    return now.lastRuns
      .filter((run) => index.process.get(run.process)?.branch === tier.branch)
      .map((run) => ({
        run,
        intermediates: Object.keys(
          index.process.get(run.process)?.intermediatesPerOutput ?? {},
        ),
      }));
  }

  /** Coverage of a tier over the last stretch, drawn as an svg polyline. */
  function sparkline(history: readonly GameState[], tierId: string): string {
    const slice = history.slice(-120);
    return slice
      .map((past, i) => {
        const x = (i / Math.max(1, slice.length - 1)) * 100;
        const y = 20 - (past.lastCoverage[tierId] ?? 1) * 18;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  function coverageOf(now: GameState, tierId: string): number | undefined {
    return now.lastCoverage[tierId];
  }

  function bindingOf(now: GameState, tierId: string): string | undefined {
    const binding = now.lastBinding[tierId];
    if (binding === undefined || binding.kind === "none" || binding.what === undefined)
      return undefined;
    return nameOf(binding.what, "either");
  }

  function setProjectRank(project: ActiveProject, value: string): void {
    const rank = Number(value);
    if (Number.isFinite(rank)) act({ type: "setProjectRank", id: project.id, rank });
  }

  function setReserve(stock: string, amount: number, rank: number): void {
    if (Number.isFinite(amount) && Number.isFinite(rank))
      act({ type: "setStockTarget", stock, amount, rank });
  }

  const round1 = (value: number): number => Math.round(value * 10) / 10;
</script>

<ul class="ladder">
  {#each rows as row (row.kind + (row.kind === "need" ? row.tier.id : row.kind === "project" ? row.project.id : row.stock))}
    {#if row.kind === "need"}
      {@const coverage = coverageOf(state, row.tier.id)}
      {@const binds = bindingOf(state, row.tier.id)}
      <li class="row need">
        <button class="head" on:click={() => (open[row.tier.id] = !open[row.tier.id])}>
          <span class="rank">{row.rank}</span>
          <span class="name">{$t(`name.tier.${row.tier.id}`)}</span>
          <span class="bar">
            <span class="fill" style:width={`${(coverage ?? 0) * 100}%`}></span>
          </span>
          <span class="value">{coverage === undefined ? "—" : coverage.toFixed(2)}</span>
          {#if coverage !== undefined && coverage < 1 && binds !== undefined}
            <span class="binds">{$t("ladder.binds", { what: binds })}</span>
          {/if}
        </button>
        {#if open[row.tier.id]}
          <div class="details">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" class="spark">
              <polyline points={sparkline($game.history, row.tier.id)} />
            </svg>
            <p class="supply">
              {$t("ladder.supply", { stock: nameOf(row.tier.stock, "stock") })}
            </p>
            <ul class="runs">
              {#each supplyOf(state, row.tier) as { run, intermediates } (run.process)}
                <li>
                  <span class="name">{$t(`name.process.${run.process}`)}</span>
                  <span>{$t("ladder.work", { n: round1(run.labor) })}</span>
                  <span>{$t("ladder.yield", { n: round1(run.output) })}</span>
                  {#each intermediates as stock (stock)}
                    {#if state.lastEffort[stock] !== undefined}
                      <span class="effort">
                        {nameOf(stock, "stock")}
                        {(state.lastEffort[stock] ?? 1).toFixed(2)}
                      </span>
                    {/if}
                  {/each}
                </li>
              {/each}
            </ul>
            {#if state.lastStore[row.tier.stock] !== undefined}
              {@const moved = state.lastStore[row.tier.stock]}
              <p class="store">
                {$t("ladder.store", {
                  from: round1(moved?.before ?? 0),
                  to: round1(moved?.after ?? 0),
                })}
              </p>
            {/if}
          </div>
        {/if}
      </li>
    {:else if row.kind === "project"}
      <li class="row project">
        <span class="rank">{row.rank}</span>
        <span class="name">{$t(`name.project.${row.project.id}`)}</span>
        <span class="bar">
          <span class="fill build" style:width={`${row.project.progress * 100}%`}></span>
        </span>
        <span class="value">{Math.round(row.project.progress * 100)} %</span>
        {#if row.project.paused}
          <span class="binds">{$t("ladder.paused")}</span>
        {:else if starved(row.project)}
          <span class="binds">{$t("ladder.noHands")}</span>
        {/if}
        <span class="grips">
          <label>
            {$t("ladder.rank")}
            <input
              type="number"
              value={row.project.rank}
              on:change={(event) =>
                setProjectRank(row.project, event.currentTarget.value)}
            />
          </label>
          <button
            on:click={() =>
              act({
                type: "pauseProject",
                id: row.project.id,
                paused: !row.project.paused,
              })}
          >
            {row.project.paused ? $t("ladder.resume") : $t("ladder.pause")}
          </button>
          <button on:click={() => act({ type: "abandonProject", id: row.project.id })}>
            {$t("ladder.abandon")}
          </button>
        </span>
      </li>
    {:else}
      <li class="row reserve">
        <span class="rank">{row.rank}</span>
        <span class="name">
          {$t("ladder.reserve", { stock: nameOf(row.stock, "stock") })}
        </span>
        <span class="bar">
          <span
            class="fill keep"
            style:width={`${row.target > 0 ? Math.min(1, row.fill / row.target) * 100 : 0}%`}
          ></span>
        </span>
        <span class="value">{round1(row.fill)} / {round1(row.target)}</span>
        <span class="grips">
          {#if row.adjustable}
            <label>
              {$t("ladder.amount")}
              <input
                type="number"
                value={row.target}
                on:change={(event) =>
                  setReserve(row.stock, Number(event.currentTarget.value), row.rank)}
              />
            </label>
          {/if}
          <label>
            {$t("ladder.rank")}
            <input
              type="number"
              value={row.rank}
              on:change={(event) =>
                setReserve(
                  row.stock,
                  row.adjustable ? row.target : 0,
                  Number(event.currentTarget.value),
                )}
            />
          </label>
        </span>
      </li>
    {/if}
  {/each}
  <li class="row footer">
    <span class="rank"></span>
    <span class="name">{$t("ladder.freeLabor")}</span>
    <span class="bar">
      <span class="fill free" style:width={`${freeShare * 100}%`}></span>
    </span>
    <span class="value">
      {round1(state.lastLabor.unused)} / {round1(state.lastLabor.available)}
    </span>
  </li>
</ul>

<style>
  .ladder {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-variant-numeric: tabular-nums;
  }

  .row {
    border-bottom: 1px solid #eee8da;
    padding-bottom: 0.25rem;
  }

  .head {
    all: unset;
    cursor: pointer;
    width: 100%;
  }

  .head,
  .row.project,
  .row.reserve,
  .row.footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rank {
    width: 2.2rem;
    text-align: right;
    color: #8a8578;
    font-size: 0.8rem;
  }

  .name {
    width: 9rem;
  }

  .bar {
    flex: 1;
    height: 0.6rem;
    background: #eee8da;
    border-radius: 0.3rem;
    overflow: hidden;
  }

  .fill {
    display: block;
    height: 100%;
    background: #7a9a5f;
  }

  .fill.build {
    background: #b08a4f;
  }

  .fill.keep {
    background: #5f8a9a;
  }

  .fill.free {
    background: #c8b98a;
  }

  .value {
    width: 5.5rem;
    text-align: right;
    font-size: 0.85rem;
  }

  .binds {
    color: #a04a3a;
    font-size: 0.8rem;
  }

  .grips {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    font-size: 0.8rem;
  }

  .grips input {
    width: 4rem;
    font: inherit;
  }

  .grips button {
    font: inherit;
    font-size: 0.8rem;
    padding: 0.1rem 0.5rem;
    border: 1px solid #8a8578;
    border-radius: 0.25rem;
    background: #f4f1ea;
    cursor: pointer;
  }

  .details {
    margin: 0.3rem 0 0.3rem 2.7rem;
    font-size: 0.85rem;
    color: #5a5548;
  }

  .spark {
    width: 100%;
    height: 2.2rem;
    display: block;
  }

  .spark polyline {
    fill: none;
    stroke: #7a9a5f;
    stroke-width: 1;
  }

  .supply {
    margin: 0.2rem 0;
  }

  .runs {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .runs li {
    display: flex;
    gap: 0.8rem;
  }

  .effort {
    color: #8a6a3a;
  }

  .store {
    margin: 0.2rem 0 0;
  }
</style>
