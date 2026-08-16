<script lang="ts">
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { segments, translate, type Segment, type Translate } from "../../i18n/t.ts";
  import { derive, type Action, type StockId } from "../../sim/index.ts";
  import {
    brakesByFrequency,
    builtCount,
    curveOf,
    drawPerTick,
    goalOf,
    projectResources,
    ranksForOrder,
    shortTicks,
    shownPercent,
    tickShares,
    ticksLeft,
    type BandField,
  } from "../band.ts";
  import { act, begin, currentState, game, index, ownDeeds } from "../game.ts";
  import { windowBook } from "../losses.ts";
  import { STORE_GOAL_TICKS_MAX } from "../presentation.ts";
  import StepCurve from "./StepCurve.svelte";

  /**
   * The explainer card of one band field (T9), and every card in the band
   * follows the one grammar: **what → why → how it went → what held it back →
   * what to do**, seven places in a fixed order, and a place stands only where
   * it has something to say.
   *
   * Figures live in the fact line, sentences are for explanations, and no
   * absolute amount of a resource ever appears on a player's card. Only the
   * head sentence is written by hand; everything else is generic out of the
   * record.
   */
  export let field: BandField;
  /** The whole band, so a way out can name the neighbour it moves past. */
  export let fields: readonly BandField[] = [];

  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  $: history = $game.history;
  $: state = currentState($game);
  $: view = derive(state, index);

  /** Coverage, built, filled: all rounded down, as everywhere on the screen. */
  const pct = shownPercent;

  /**
   * **Whoever writes a line takes the translating with it.** A place in the
   * markup is drawn again when something it names has changed; what a helper
   * reaches for inside itself is named nowhere, and a line built that way went
   * on standing in the old language until the next tick moved its data.
   */

  /** A name, wherever the surface keeps it: rank, project, good, capacity. */
  function nameOf(say: Translate, kind: string, id: string): string {
    const key = `name.${kind}.${id}`;
    const named = say(key);
    return named === key ? id : named;
  }

  /** What a brake is called at the player: labour is labour, not "people". */
  function brakeName(say: Translate, what: string): string {
    for (const key of [
      `name.brake.${what}`,
      `name.stock.${what}`,
      `name.capacity.${what}`,
    ]) {
      const named = say(key);
      if (named !== key) return named;
    }
    return what;
  }

  $: title =
    field.kind === "need"
      ? nameOf($t, "tier", field.id)
      : field.kind === "project"
        ? nameOf($t, "project", field.id)
        : field.kind === "store"
          ? nameOf($t, "claim", field.id)
          : $t("band.idle");

  $: idleShare =
    state.lastLabor.available > 0
      ? state.lastLabor.unused / state.lastLabor.available
      : 0;

  $: standing =
    field.kind === "need"
      ? $t("card.stand.need", { pct: pct(field.fill) })
      : field.kind === "project"
        ? $t("card.stand.project", { pct: pct(field.fill) })
        : field.kind === "store"
          ? $t("card.stand.store", { pct: pct(field.fill) })
          : $t("card.stand.idle", { pct: pct(idleShare) });

  /** The one sentence written by hand; everything else is generic. */
  $: means =
    field.kind === "need"
      ? $t(`need.effect.${field.id}`)
      : field.kind === "project"
        ? $t(`project.use.${field.id}`)
        : field.kind === "store"
          ? $t(`store.purpose.${field.id}`)
          : $t("idle.head");

  // --------------------------------------------------------------- the window

  /** The tick this thing came into the world, so a young one shows less. */
  function bornAt(): number {
    for (const past of history) {
      if (
        field.kind === "project" &&
        past.activeProjects.some((p) => p.id === field.id)
      ) {
        return past.tick;
      }
      if (field.kind === "store" && goalOf(past, index, field.id) > 1e-9)
        return past.tick;
    }
    return 0;
  }

  $: deed = $ownDeeds[field.key];
  $: born = field.claim ? bornAt() : 0;
  /** The later of the two: nothing is judged from before the last own deed. */
  $: since = Math.max(deed?.tick ?? 0, born);
  $: points = curveOf(history, index, field, since);
  $: brakes = brakesByFrequency(points);
  $: missed = shortTicks(points);
  /** The window is the player's own only where his deed set its start. */
  $: sinceDeed =
    deed !== undefined &&
    deed.tick >= born &&
    points.length > 0 &&
    points[0]?.tick === deed.tick;

  // ----------------------------------------------------------- the fact line

  $: resources = projectResources(index, field.id).map((id) => nameOf($t, "stock", id));
  $: resourceList = listed($t, resources);

  /**
   * The tick cost per resource, each against its own stream — the one place a
   * breathing figure is wanted in a fact line, because only it says which
   * resource the undertaking leans on and whether that is affordable.
   *
   * Where one of the resources has no stream to be measured against — nothing
   * of it has come in yet at all — the line falls back to naming the resources
   * plainly: a list in which one share is silently missing would read as if
   * that resource cost nothing.
   */
  $: shares = field.kind === "project" ? tickShares(history, index, field.id) : [];
  $: shareLine = shares.every((one) => one.share !== undefined)
    ? shares
        .map((one) =>
          $t("card.fact.share", {
            what: nameOf($t, "stock", one.stock),
            pct: Math.floor((one.share ?? 0) * 100),
          }),
        )
        .join(" · ")
    : "";
  $: factLine =
    shareLine === ""
      ? $t("card.fact.project.plain", {
          ticks: ticksLeft(index, field.id, field.fill),
          needs: resourceList,
        })
      : $t("card.fact.project", {
          ticks: ticksLeft(index, field.id, field.fill),
          shares: shareLine,
        });

  /** "Arbeit und Fasern" — the last two joined, the rest by commas. */
  function listed(say: Translate, names: readonly string[]): string {
    if (names.length === 0) return "";
    if (names.length === 1) return names[0] ?? "";
    const head = names.slice(0, -1).join(", ");
    return say("list.and", { head, last: names[names.length - 1] ?? "" });
  }

  $: goal = field.kind === "store" ? goalOf(state, index, field.id) : 0;
  $: perTick = field.kind === "store" ? drawPerTick(state, index, field.id) : 0;
  /** The goal read in ticks: how long what is asked for carries the draw. */
  $: goalTicks = perTick > 1e-9 ? Math.round(goal / perTick) : 0;
  $: adjustable = index.stock.get(field.id)?.keeping !== undefined;
  $: pits = field.kind === "store" ? builtCount(state, index, field.id) : 0;

  /** The goal grip serves in ticks; the amount behind it stays internal. */
  function setGoalTicks(ticks: number): void {
    const amount = Math.max(0, ticks) * perTick;
    act({ type: "setStockTarget", stock: field.id, amount });
  }

  function grabGoal(event: PointerEvent): void {
    const rail = event.currentTarget as HTMLElement;
    const move = (at: PointerEvent): void => {
      const box = rail.getBoundingClientRect();
      const share = Math.max(0, Math.min(1, (at.clientX - box.left) / box.width));
      setGoalTicks(Math.round(share * STORE_GOAL_TICKS_MAX));
    };
    move(event);
    rail.setPointerCapture(event.pointerId);
    const release = (): void => {
      rail.removeEventListener("pointermove", move);
      rail.removeEventListener("pointerup", release);
    };
    rail.addEventListener("pointermove", move);
    rail.addEventListener("pointerup", release);
  }

  // ------------------------------------------------------------ the ways out

  interface Way {
    readonly text: string;
    readonly icon: string;
    readonly run: () => void;
  }

  /** Does this project serve the good the short rank lives on? */
  function serves(id: string, stock: StockId): boolean {
    const def = index.project.get(id);
    if (def === undefined) return false;
    return def.effects.some((effect) => {
      if (effect.type === "process") {
        const opened = index.process.get(effect.id);
        return (
          opened !== undefined && index.branch.get(opened.branch)?.produces === stock
        );
      }
      if (effect.type === "capacity") {
        return index.stock.get(stock)?.protectedBy?.capacity === effect.capacity;
      }
      if (effect.type === "tier") return index.tier.get(effect.id)?.stock === stock;
      return false;
    });
  }

  /** Move a claim to where it stands one place earlier, and commit it. */
  function moveTo(key: string, at: number): void {
    const rest = fields.filter((one) => one.key !== key && one.kind !== "idle");
    const moved = fields.find((one) => one.key === key);
    if (moved === undefined) return;
    const order = [...rest.slice(0, at), moved, ...rest.slice(at)];
    for (const [target, rank] of ranksForOrder(order)) {
      const claim = fields.find((one) => one.key === target);
      if (claim === undefined || Math.abs(claim.rank - rank) < 1e-9) continue;
      act(actionForRank(claim, rank));
    }
  }

  function actionForRank(claim: BandField, rank: number): Action {
    return claim.kind === "project"
      ? { type: "setProjectRank", id: claim.id, rank }
      : { type: "setStockRank", stock: claim.id, rank };
  }

  /** Where a field stands among the ranked fields, the idle one left out. */
  function placeOf(key: string): number {
    return fields
      .filter((one) => one.kind !== "idle")
      .findIndex((one) => one.key === key);
  }

  function labelOf(say: Translate, one: BandField): string {
    return one.kind === "need"
      ? nameOf(say, "tier", one.id)
      : one.kind === "project"
        ? nameOf(say, "project", one.id)
        : nameOf(say, "claim", one.id);
  }

  /**
   * The ways out, from the four sources the concept allows and no others, at
   * most two, and every one of them carries its grip. The grip names its
   * target and the consequence is the order, never a duration — that is
   * deterministically true and promises nothing about the weather.
   *
   * The way out that moves the whole community is silent for now: its grip has
   * to open the moving dialogue, and that dialogue is not built yet. Nothing
   * is invented in its place.
   */
  $: ways = ((): readonly Way[] => {
    const out: Way[] = [];
    const ranked = fields.filter((one) => one.kind !== "idle");
    if (field.kind === "need") {
      const tier = index.tier.get(field.id);
      const stock = tier?.stock;
      if (stock === undefined) return out;
      const here = placeOf(field.key);
      // A running undertaking that serves the good, from behind this rank.
      const running = ranked.find(
        (one, at) => one.kind === "project" && at > here && serves(one.id, stock),
      );
      if (running !== undefined) {
        out.push({
          text: $t("card.way.running", {
            project: labelOf($t, running),
            need: labelOf($t, field),
          }),
          icon: "↑",
          run: () => moveTo(running.key, here),
        });
      }
      // One that could be started, the core's own urgency deciding which.
      const buildable = view.projects.find(
        (one) => one.available && serves(one.id, stock),
      );
      if (out.length < 2 && buildable !== undefined) {
        out.push({
          text: $t("card.way.buildable", {
            project: nameOf($t, "project", buildable.id),
            need: labelOf($t, field),
          }),
          icon: "▶",
          run: () => begin(buildable.id),
        });
      }
      // A claim of the player's own that pushes in ahead of the short rank.
      const ahead = ranked.filter((one, at) => one.claim && at < here).pop();
      if (out.length < 2 && ahead !== undefined) {
        out.push({
          text: $t("card.way.behind", {
            claim: labelOf($t, ahead),
            need: labelOf($t, field),
          }),
          icon: "↓",
          run: () => moveTo(ahead.key, here),
        });
      }
      return out;
    }
    // A claim's own way out is to push forward past the field ahead of it.
    const here = placeOf(field.key);
    const ahead = ranked[here - 1];
    if (ahead !== undefined) {
      out.push({
        text: $t("card.way.forward", {
          before: labelOf($t, ahead),
          name: labelOf($t, field),
        }),
        icon: "↑",
        run: () => moveTo(field.key, here - 1),
      });
    }
    return out;
  })();

  /**
   * The cause sentence, and it stands only where something really was short.
   * It counts over the window the curve is drawn over, so drawing and sentence
   * can never disagree, and it names **all** the resources that were missing,
   * the commonest first.
   *
   * It speaks in the nominative, and it has two wordings — one thing missing
   * or several. No case forms per good: a later epoch adds goods, and it must
   * be able to do so without thinking about grammar.
   *
   * The weather is the exception, because it is not a thing that was missing:
   * where it led the window there was nothing to be had more of, and the
   * sentence says so instead of naming a source. Which of the three wordings
   * is used follows the brake that led the window — the same one the sentence
   * would name first anyway.
   */
  $: leading = brakes[0];
  $: missing = brakes.filter((one) => one.kind !== "weather");
  $: causeKey = `card.cause.${field.kind === "project" ? "delayed" : "short"}.${
    sinceDeed ? "since" : "recent"
  }.${leading?.kind === "weather" ? "weather" : missing.length === 1 ? "one" : "many"}`;
  $: cause = ((): readonly Segment[] =>
    segments(
      $language,
      causeKey,
      {
        count: missed,
        total: points.length,
        since: $t(`card.since.${deed?.what ?? "start"}`),
        what: listed(
          $t,
          missing.map((one) => brakeName($t, one.what)),
        ),
      },
      ["count", "total", "what"],
    ))();

  /**
   * The price of the window, in the same block as its cause — cause and price
   * belong together, and both are counted over the same ticks.
   *
   * The wording follows the axis the content gives the rank, and never a freely
   * chosen one: survival names the cohorts it reaches, the births say how many
   * did not come, work says what share of the community's own strength it took.
   * People are whole numbers out of the window's book, so summing the cards of
   * a window lands on what really happened.
   */
  $: book = windowBook(history, index);
  $: toll = field.kind === "need" ? book.get(field.id) : undefined;

  /** "2 Kinder und ein Erwachsener" — whole people, cohort by cohort. */
  function whoOf(say: Translate, people: Readonly<Record<string, number>>): string {
    const parts: string[] = [];
    for (const cohort of index.config.population.cohorts) {
      const heads = people[cohort.id] ?? 0;
      if (heads <= 0) continue;
      parts.push(
        say(`count.cohort.${cohort.id}.${heads === 1 ? "one" : "many"}`, {
          count: heads,
        }),
      );
    }
    return listed(say, parts);
  }

  $: price = ((): string => {
    if (toll === undefined) return "";
    if (toll.axis === "work") {
      const share = Math.round(toll.share * 100);
      return share > 0 ? $t("card.toll.work", { pct: share }) : "";
    }
    const who = whoOf($t, toll.people);
    if (who === "") return "";
    return $t(`card.toll.${toll.axis}`, { who });
  })();

  /**
   * Where no way out applies, the empty line follows the window's brake: what
   * the range would not give more of, or what the ranks in front took. Both
   * hang on the range in the end — hands are short because searching is dear —
   * but only one of them is a lever the player has, and that is what the
   * difference tells him.
   */
  $: noWay = leading?.kind === "labour" ? "card.way.none.labour" : "card.way.none.range";

  $: paused =
    field.kind === "project" &&
    (state.activeProjects.find((p) => p.id === field.id)?.paused ?? false);
</script>

<div class="explain">
  <slot name="beak" />
  <h4>
    {title}
    <span
      class="cov num"
      class:build={field.tone === "build"}
      class:store={field.tone === "store"}
    >
      {standing}
    </span>
  </h4>
  <p class="means">{means}</p>

  <!--
    The fact line carries standing properties only — what breathes with the
    tick has no place here, save the one wanted exception: an undertaking's
    tick cost per resource, which only means anything against the stream it is
    taken from. A need has no fact line at all.
  -->
  {#if field.kind === "project"}
    <p class="cost sub num">{factLine}</p>
  {:else if field.kind === "store"}
    <p class="cost sub num">
      {adjustable
        ? $t(`card.fact.store.${field.id}`, { ticks: goalTicks })
        : $t(`card.fact.store.${field.id}`, { ticks: goalTicks, pits })}
    </p>
    {#if adjustable}
      <div class="goalgrip">
        <span class="sub">{$t("card.goal")}</span>
        <div
          class="slider"
          role="slider"
          tabindex="0"
          aria-valuenow={goalTicks}
          aria-valuemin="0"
          aria-valuemax={STORE_GOAL_TICKS_MAX}
          on:pointerdown={grabGoal}
        >
          <span
            class="knob"
            style:left={`${Math.min(100, (goalTicks / STORE_GOAL_TICKS_MAX) * 100)}%`}
          ></span>
        </div>
        <span class="sub num">{$t("card.goalTicks", { ticks: goalTicks })}</span>
      </div>
    {/if}
  {/if}

  <StepCurve
    {points}
    nameOf={(what) => brakeName($t, what)}
    plain={field.kind === "idle"}
    fullLabel={$t("card.full")}
  />

  {#if missed > 0 && brakes.length > 0 && field.kind !== "idle"}
    <div class="rule"></div>
    <!--
      The sentence stays whole in the translation table and the surface sets
      its figures and its named resources apart — the table says what is said,
      the screen how it looks.
    -->
    <p class="cause">
      {#each cause as piece, i (i)}{#if piece.strong}<b>{piece.text}</b
          >{:else}{piece.text}{/if}{/each}{#if price !== ""}<b class="toll">{price}</b
        >{/if}
    </p>
    <div class="ways">
      {#each ways as way (way.text)}
        <div class="way">
          <span>{way.text}</span>
          <button on:click={way.run}>{way.icon}</button>
        </div>
      {/each}
      {#if ways.length === 0}
        <p class="sub">{$t(noWay)}</p>
      {/if}
    </div>
  {/if}

  <!--
    Administration, at the very bottom: pause and abandon answer no problem,
    and abandon destroys built work, so it stands last.
  -->
  {#if field.kind === "project"}
    <div class="grips">
      <button
        on:click={() => act({ type: "pauseProject", id: field.id, paused: !paused })}
      >
        {paused ? $t("card.resume") : $t("card.pause")}
      </button>
      <button class="stop" on:click={() => act({ type: "abandonProject", id: field.id })}>
        {$t("card.abandon")}
      </button>
    </div>
  {/if}
</div>
