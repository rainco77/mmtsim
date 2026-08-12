<script lang="ts">
  import { afterUpdate } from "svelte";
  import { derived as fromStore } from "svelte/store";
  import { language } from "../../i18n/language.ts";
  import { segments, translate, type Segment } from "../../i18n/t.ts";
  import { derive, type Action } from "../../sim/index.ts";
  import {
    bandFields,
    nameBelow,
    ranksForOrder,
    shownPercent,
    type BandField,
  } from "../band.ts";
  import { act, currentState, game, index } from "../game.ts";
  import BandCard from "./BandCard.svelte";
  import BandIcons from "./BandIcons.svelte";

  /**
   * The band: the whole overview as the frame's head element (T9).
   *
   * Every claim on this tick's labour stands here side by side in rank order,
   * **left is served first** — there are no rank numbers, the row itself is
   * the order. Width is what full coverage of that claim would have cost this
   * tick, fill is how far it is met. What is outlined in ochre is the
   * player's: he can take it by its lip and put it elsewhere, and the drop is
   * a real re-ranking through the same actions a strategy uses (T4).
   */
  const t = fromStore(
    language,
    ($language) => (key: string, params?: Readonly<Record<string, string | number>>) =>
      translate($language, key, params),
  );

  /** Air between the band's lower edge and the card floating below it. */
  const CARD_GAP = 8;
  const CARD_WIDTH = 396;
  /** How near the beak may come to a card's edge before the card moves. */
  const BEAK_INSET = 24;
  /** Beyond this the finger is moving a segment and not tapping it. */
  const DRAG_SLOP = 4;

  /**
   * The hook of a leader line, in the specification sheet's measures (the
   * `--leader-h` and `--leader-drop` tokens say the same in the stylesheet; a
   * drawing cannot read a custom property, so the figures stand twice).
   */
  const LEADER_H = 13;
  const LEADER_DROP = 6;

  /**
   * The air a field keeps left and right of its writing (`.fld` padding). It
   * is subtracted from the measured box, because what decides whether a name
   * fits is the room inside the field — the very size a container query
   * reports.
   */
  const FIELD_PAD = 7;

  $: state = currentState($game);
  $: rules = new Set(derive(state, index).rules);
  $: fields = bandFields($game.history, index, rules);

  let openKey: string | null = null;
  let dragKey: string | null = null;
  let dropAt = 0;

  /**
   * Where the segment in the hand is drawn.
   *
   * It follows the finger sideways and continuously — the thing being moved is
   * under the hand at every moment, not at the place it would land — and it
   * does not rise or fall: the band is one line to read along, and a segment
   * lifting off it reads as a different element. What snaps is the gap in the
   * dimmed band behind, and that is the only thing that should: it is the
   * answer to "where would this land", and an answer that slides is no answer.
   *
   * The figures are pixels within the band, taken once when the segment is
   * grasped, so that the width and the height under the hand stay what they
   * were and only the one number moves.
   */
  let grabbed: { left: number; top: number; width: number } | null = null;

  let bandEl: HTMLElement | undefined;
  let rowEl: HTMLElement | undefined;

  $: ranked = fields.filter((one) => one.kind !== "idle");
  $: idle = fields.find((one) => one.kind === "idle");

  /** The order on screen: a held segment sits where it would land. */
  $: shown = ((): readonly BandField[] => {
    if (dragKey === null) return fields;
    const held = fields.find((one) => one.key === dragKey);
    if (held === undefined) return fields;
    const rest = ranked.filter((one) => one.key !== dragKey);
    const order = [...rest.slice(0, dropAt), held, ...rest.slice(dropAt)];
    return idle === undefined ? order : [...order, idle];
  })();

  $: open = openKey === null ? undefined : fields.find((one) => one.key === openKey);

  /**
   * The number in the field, and the width of the fill behind it: one figure
   * for both, rounded down, so the writing and the edge it switches tone at
   * can never drift apart and "100 %" never stands under the crisis colour.
   */
  const pct = shownPercent;

  function labelOf(one: BandField): string {
    const key =
      one.kind === "need"
        ? `name.tier.${one.id}`
        : one.kind === "project"
          ? `name.project.${one.id}`
          : one.kind === "store"
            ? `name.claim.${one.id}`
            : "band.idle";
    const named = $t(key);
    return named === key ? one.id : named;
  }

  // ------------------------------------------------------------------- drag

  /**
   * A segment answers to two hands on the same spot: a tap opens its card, a
   * pull moves it. They are told apart by distance, not by where the finger
   * landed — a lip small enough to miss would make the moving of a claim a
   * matter of aim.
   */
  function grab(event: PointerEvent, field: BandField): void {
    if (!field.claim || event.button !== 0) return;
    const from = event.clientX;
    const at = ranked.findIndex((one) => one.key === field.key);
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const outer = bandEl?.getBoundingClientRect();
    // Where the finger sits inside the segment, and where the segment sits in
    // the band. Both are taken now and never again: the segment must not jump
    // under the hand at the first millimetre of the pull.
    const grip = from - box.left;
    const top = outer === undefined ? 0 : box.top - outer.top;
    const width = box.width;
    const move = (now: PointerEvent): void => {
      if (dragKey === null) {
        if (Math.abs(now.clientX - from) < DRAG_SLOP) return;
        openKey = null;
        dragKey = field.key;
        dropAt = at < 0 ? 0 : at;
      }
      const band = bandEl?.getBoundingClientRect();
      grabbed = { left: now.clientX - grip - (band?.left ?? 0), top, width };
      dropAt = dropIndexAt(now.clientX);
    };
    const release = (): void => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      if (dragKey !== null) drop();
      grabbed = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
  }

  /** How many ranked fields have their middle left of the finger. */
  function dropIndexAt(x: number): number {
    const kids = [...(rowEl?.children ?? [])] as HTMLElement[];
    let at = 0;
    for (let i = 0; i < shown.length; i += 1) {
      const one = shown[i];
      const el = kids[i];
      if (one === undefined || el === undefined) continue;
      if (one.key === dragKey || one.kind === "idle") continue;
      const box = el.getBoundingClientRect();
      if (x > box.left + box.width / 2) at += 1;
    }
    return at;
  }

  /** The drop commits the new order through the ordinary actions (T4). */
  function drop(): void {
    const order = shown.filter((one) => one.kind !== "idle");
    dragKey = null;
    for (const [key, rank] of ranksForOrder(order)) {
      const claim = fields.find((one) => one.key === key);
      if (claim === undefined || Math.abs(claim.rank - rank) < 1e-9) continue;
      act(actionForRank(claim, rank));
    }
  }

  function actionForRank(claim: BandField, rank: number): Action {
    return claim.kind === "project"
      ? { type: "setProjectRank", id: claim.id, rank }
      : { type: "setStockRank", stock: claim.id, rank };
  }

  /** What the floating flag says: the name, and where it would land. */
  $: flag = ((): readonly Segment[] => {
    if (dragKey === null) return [];
    const held = fields.find((one) => one.key === dragKey);
    if (held === undefined) return [];
    const order = shown.filter((one) => one.kind !== "idle");
    const at = order.findIndex((one) => one.key === dragKey);
    const behind = order[at + 1];
    const name = labelOf(held);
    return behind === undefined
      ? segments($language, "band.dropLast", { name }, ["name"])
      : segments($language, "band.dropBefore", { name, before: labelOf(behind) }, [
          "name",
        ]);
  })();

  // -------------------------------------------------------------- the names

  /**
   * The name row below the band. **Every field carries its own name inside it
   * where the name fits**, needs and claims alike; the row below is for the
   * one case a field cannot serve — a claim squeezed too narrow for its name.
   * The row keeps its height even when it holds nothing, so the band never
   * jumps; names that would collide move apart and a thin line leads back to
   * the segment they belong to.
   *
   * The places are measured off the row after it has been laid out, because
   * the widths are not simply the shares: every field has the same minimum
   * width, and what one field gains that way the others lose.
   */
  interface NameMark {
    key: string;
    centre: number;
    at: number;
    text: string;
  }

  /** Where a field sits in the row, and how much room it has inside. */
  interface Place {
    centre: number;
    inner: number;
  }

  let places: Record<string, Place> = {};
  let rowWidth = 0;

  afterUpdate(() => {
    if (rowEl === undefined) return;
    const kids = [...rowEl.children] as HTMLElement[];
    const outer = rowEl.getBoundingClientRect();
    const found: Record<string, Place> = {};
    for (let i = 0; i < shown.length; i += 1) {
      const one = shown[i];
      const el = kids[i];
      if (one === undefined || el === undefined || !one.claim) continue;
      const box = el.getBoundingClientRect();
      found[one.key] = {
        centre: box.left - outer.left + box.width / 2,
        inner: el.clientWidth - 2 * FIELD_PAD,
      };
    }
    const same =
      Object.keys(found).length === Object.keys(places).length &&
      Object.entries(found).every(
        ([key, place]) =>
          Math.abs((places[key]?.centre ?? -1) - place.centre) < 0.5 &&
          Math.abs((places[key]?.inner ?? -1) - place.inner) < 0.5,
      );
    if (!same) places = found;
    if (Math.abs(rowWidth - outer.width) > 0.5) rowWidth = outer.width;
  });

  /**
   * Measured with a canvas rather than by laying the row out a second time: a
   * measuring pass that changes the layout it measures oscillates.
   */
  let measurer: CanvasRenderingContext2D | null = null;
  function textWidth(text: string): number {
    if (measurer === null) {
      measurer = document.createElement("canvas").getContext("2d");
      if (measurer !== null) measurer.font = "600 12px system-ui, sans-serif";
    }
    return measurer?.measureText(text).width ?? text.length * 6.5;
  }

  $: names = ((): readonly NameMark[] => {
    const marks: NameMark[] = [];
    for (const one of shown) {
      const place = places[one.key];
      if (place === undefined || !nameBelow(one, place.inner)) continue;
      marks.push({
        key: one.key,
        centre: place.centre,
        at: place.centre,
        text: labelOf(one),
      });
    }
    // Left to right, pushing aside a name that would sit on its neighbour;
    // then back from the right edge, so nothing is pushed off the band.
    let edge = 0;
    for (const mark of marks) {
      const half = textWidth(mark.text) / 2;
      mark.at = Math.max(mark.at, edge + half);
      edge = mark.at + half + 8;
    }
    let limit = rowWidth;
    for (let i = marks.length - 1; i >= 0; i -= 1) {
      const mark = marks[i];
      if (mark === undefined) continue;
      const half = textWidth(mark.text) / 2;
      mark.at = Math.min(mark.at, limit - half);
      limit = mark.at - half - 8;
    }
    return marks;
  })();

  // --------------------------------------------------------------- the card

  /** The card floats below the flush lower edge of the band and moves nothing. */
  $: place = ((): { top: number; left: number; beak: number } | undefined => {
    const held = open;
    if (held === undefined || bandEl === undefined || rowEl === undefined)
      return undefined;
    const at = shown.findIndex((one) => one.key === held.key);
    const el = [...rowEl.children][at] as HTMLElement | undefined;
    if (el === undefined) return undefined;
    const box = el.getBoundingClientRect();
    const outer = bandEl.getBoundingClientRect();
    const centre = box.left - outer.left + box.width / 2;
    const top = rowEl.offsetTop + rowEl.offsetHeight + CARD_GAP;
    const left = Math.max(0, Math.min(outer.width - CARD_WIDTH, centre - CARD_WIDTH / 2));
    const beak = Math.max(BEAK_INSET, Math.min(CARD_WIDTH - BEAK_INSET, centre - left));
    return { top, left, beak };
  })();

  function tap(field: BandField): void {
    if (dragKey !== null) return;
    openKey = openKey === field.key ? null : field.key;
  }

  function onKey(event: KeyboardEvent, field: BandField): void {
    if (event.key === "Enter" || event.key === " ") tap(field);
  }

  /** A tap anywhere else closes the card; a tap inside it does not. */
  function outside(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".explain") !== null || target.closest(".fld") !== null) return;
    openKey = null;
  }
</script>

<svelte:window on:click={outside} />

<BandIcons />

<div class="band" class:dragmode={dragKey !== null} bind:this={bandEl}>
  <div class="bandhead"><h2>{$t("tile.overview")}</h2></div>

  <div class="bandrow" class:dragmode={dragKey !== null} bind:this={rowEl}>
    {#each shown as field (field.key)}
      {#if field.key === dragKey}
        <!-- The gap: it snaps to where the segment would land, and it is the
             only thing here that snaps. What is in the hand is drawn over the
             band, following the finger. -->
        <div class="slot" style={`flex-grow: ${field.share}`}></div>
      {:else if field.kind === "idle"}
        <div
          class="fld idle"
          style={`flex-grow: ${field.share}`}
          role="button"
          tabindex="0"
          title={$t("band.idle")}
          on:click={() => tap(field)}
          on:keydown={(event) => onKey(event, field)}
        >
          <span>{$t("band.idle")}</span>
        </div>
      {:else}
        <div
          class="fld"
          class:claim={field.claim}
          class:build={field.tone === "build"}
          class:store={field.tone === "store"}
          class:short={field.short}
          style={`flex-grow: ${field.share}; --f: ${pct(field.fill)}%`}
          role="button"
          tabindex="0"
          title={labelOf(field)}
          on:click={() => tap(field)}
          on:keydown={(event) => onKey(event, field)}
          on:pointerdown={(event) => grab(event, field)}
        >
          <!--
            Every field carries its name where the name fits — the stylesheet
            drops it below `--fld-name-min` and the sign stays. Only a claim
            too narrow for it gets its name in the row below the band.
          -->
          <span class="fill"></span>
          <span class="lay dark">
            {#if field.icon}<svg class="ico"><use href={`#${field.icon}`} /></svg>{/if}
            <span class="nm">{labelOf(field)}</span>
            <span class="pct num" class:crit={field.short}>{pct(field.fill)} %</span>
          </span>
          <span class="lay light">
            {#if field.icon}<svg class="ico"><use href={`#${field.icon}`} /></svg>{/if}
            <span class="nm">{labelOf(field)}</span>
            <span class="pct num" class:crit={field.short}>{pct(field.fill)} %</span>
          </span>
          {#if field.claim}
            <span class="lip"><i></i><i></i><i></i></span>
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  <!--
    What is in the hand. It hangs over the band rather than in it, so it can
    follow the finger to the pixel while the gap behind it snaps; and it keeps
    the height and the top edge it was grasped at, because the band is a line
    to read along and a segment that rises off it reads as something else.
  -->
  {#if dragKey !== null && grabbed !== null}
    {@const carried = fields.find((one) => one.key === dragKey)}
    {#if carried !== undefined}
      <div
        class="carry"
        style={`left: ${grabbed.left.toFixed(1)}px; top: ${grabbed.top.toFixed(1)}px; width: ${grabbed.width.toFixed(1)}px`}
      >
        <div
          class="fld claim dragging {carried.tone}"
          style={`--f: ${pct(carried.fill)}%`}
        >
          <span class="fill"></span>
          <span class="lay dark">
            {#if carried.icon}<svg class="ico"><use href={`#${carried.icon}`} /></svg
              >{/if}
            <span class="pct num">{pct(carried.fill)} %</span>
          </span>
          <span class="lay light">
            {#if carried.icon}<svg class="ico"><use href={`#${carried.icon}`} /></svg
              >{/if}
            <span class="pct num">{pct(carried.fill)} %</span>
          </span>
          <span class="lip"><i></i><i></i><i></i></span>
          <span class="droptag">
            {#each flag as piece, i (i)}{#if piece.strong}<b>{piece.text}</b
                >{:else}{piece.text}{/if}{/each}
          </span>
        </div>
      </div>
    {/if}
  {/if}

  <div class="names">
    <!--
      The hook of a leader line, at the height the specification sheet gives
      it: down out of the field, across to where the name had to move, down
      into the name. The sparing four-pixel version was all but invisible in
      play, so the name row carries the sheet's measures and grows by them.
    -->
    <svg
      class="leader"
      width={rowWidth}
      height={LEADER_H}
      viewBox={`0 0 ${rowWidth} ${LEADER_H}`}
    >
      {#each names as mark (mark.key)}
        {#if Math.abs(mark.at - mark.centre) > 0.5}
          <path
            d={`M${mark.centre.toFixed(1)} 0 L${mark.centre.toFixed(1)} ${LEADER_DROP} L${mark.at.toFixed(1)} ${LEADER_DROP} L${mark.at.toFixed(1)} ${LEADER_H - 1}`}
            fill="none"
            stroke="var(--accent-ink)"
            stroke-width="1"
          />
        {/if}
      {/each}
    </svg>
    {#each names as mark (mark.key)}
      <span class="leadname" style={`left: ${mark.at.toFixed(1)}px`}>{mark.text}</span>
    {/each}
  </div>

  {#if open !== undefined && place !== undefined}
    <div class="cardhold" style={`top: ${place.top}px; left: ${place.left}px`}>
      <BandCard field={open} {fields}>
        <span slot="beak" class="beak" style={`left: ${place.beak - 7}px`}></span>
      </BandCard>
    </div>
  {/if}
</div>
