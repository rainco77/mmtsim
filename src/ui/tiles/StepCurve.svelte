<script lang="ts">
  import type { CurvePoint } from "../band.ts";

  /**
   * The step curve of an explainer card, with its braking carpet (T9).
   *
   * One horizontal run per tick on its own value, vertical jumps between them.
   * A line drawn from tick point to tick point would claim a course inside the
   * tick that does not exist. Because the curve is flat across a tick, the
   * shortfall of a braked tick is a full column — the carpet fills it whole and
   * is exactly as tall as what was missing. On a tie two colours share it.
   *
   * The dashed full line is drawn last, over everything: a curve lying on it —
   * a store that was full throughout — would otherwise hide it, and "full
   * throughout" is exactly what has to stay readable.
   */
  export let points: readonly CurvePoint[] = [];
  /** How the surface names a braking resource; the legend is card-local. */
  export let nameOf: (what: string) => string;
  /** Drawn without a carpet and without a legend — the idle field's curve. */
  export let plain = false;
  /** What the dashed line means, in the player's language. */
  export let fullLabel = "";

  /**
   * The braking colours. All cool: the palette holds exactly one warm
   * identity and the project ochre owns it, so a warm brake would be
   * indistinguishable from "yours". Labour and fibre have a colour of their
   * own, a good that feeds a need brings its process colour, and anything else
   * takes the next cool tone. Which colour means what is read off the card's
   * own legend and never learnt by heart.
   */
  const NAMED: Readonly<Record<string, string>> = {
    labor: "var(--brake-work)",
    people: "var(--brake-work)",
    fibre: "var(--brake-fibre)",
    fish: "var(--p-fish)",
    plants: "var(--p-gather)",
  };
  const SPARE = [
    "var(--brake-slate)",
    "var(--brake-teal)",
    "var(--brake-moss)",
    "var(--brake-indigo)",
  ];

  /** Plot 26 high, the legend under it: the room a card can give a curve. */
  const TOP = 4;
  const BASE = 30;
  const LEG = 36;
  const HEIGHT = 47;

  let width = 0;

  const one = (value: number): string => value.toFixed(1);

  $: seen = (() => {
    const out: string[] = [];
    for (const point of points) {
      for (const what of point.brake) if (!out.includes(what)) out.push(what);
    }
    return out;
  })();
  $: colour = new Map(
    seen.map((what, i) => [
      what,
      NAMED[what] ?? SPARE[i % SPARE.length] ?? "var(--brake-work)",
    ]),
  );

  const yOf = (value: number): number => TOP + (1 - value) * (BASE - TOP);

  // The tick edges are snapped to whole pixels once and shared by everything
  // drawn. Two columns meeting on a fractional edge are each blended against
  // the ground on their own, and the pale seam that leaves reads as a division
  // that is not there.
  $: edges = [
    ...points.map((_, i) => Math.round((i * width) / Math.max(1, points.length))),
    width,
  ];

  /**
   * The step curve: a horizontal run across the whole width of each tick at
   * its own value, vertical jumps in between. Every tick is as wide as any
   * other, the first and the last included.
   */
  $: path =
    points.length === 0
      ? ""
      : `M0 ${one(yOf(points[0]?.value ?? 1))} ` +
        points
          .map((point, i) => {
            const y = one(yOf(point.value));
            return `L${edges[i] ?? 0} ${y} L${edges[i + 1] ?? width} ${y}`;
          })
          .join(" ");

  /** One braked tick as a full column, split down the middle on a tie. */
  interface Column {
    readonly x: number;
    readonly w: number;
    readonly h: number;
    readonly fill: string;
  }
  $: carpet = (() => {
    if (plain) return [] as Column[];
    const out: Column[] = [];
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      if (point === undefined || point.brake.length === 0) continue;
      const height = yOf(point.value) - TOP;
      if (height <= 0.05) continue;
      // A hairline is a pixel left unpainted, not a pixel painted over: the
      // ground shows through and the two colours stay themselves.
      const previous = points[i - 1]?.brake ?? [];
      const parted = previous.length > 0 && previous.join() !== point.brake.join();
      const left = edges[i] ?? 0;
      const from = left + (parted ? 1 : 0);
      const to = edges[i + 1] ?? width;
      if (point.brake.length === 1) {
        out.push({
          x: from,
          w: to - from,
          h: height,
          fill: colour.get(point.brake[0] ?? "") ?? "var(--brake-work)",
        });
      } else {
        const middle = Math.round((left + to) / 2);
        out.push({
          x: from,
          w: middle - from,
          h: height,
          fill: colour.get(point.brake[0] ?? "") ?? "var(--brake-work)",
        });
        out.push({
          x: middle + 1,
          w: to - middle - 1,
          h: height,
          fill: colour.get(point.brake[1] ?? "") ?? "var(--brake-work)",
        });
      }
    }
    return out;
  })();

  /** The card's own legend: what braked here, and what the dashes mean. */
  $: legend = (() => {
    const out: { x: number; label: string; fill: string; tie: boolean }[] = [];
    let x = 0;
    for (const what of seen) {
      const label = nameOf(what);
      out.push({ x, label, fill: colour.get(what) ?? "var(--brake-work)", tie: false });
      x += 12 + label.length * 4.9 + 11;
    }
    return out;
  })();
  $: tail =
    points.length > 0
      ? `Tick ${points[0]?.tick ?? 0}–${points[points.length - 1]?.tick ?? 0} · ┄ ${fullLabel}`
      : "";
</script>

<div class="curve" bind:clientWidth={width}>
  {#if width > 0 && points.length > 0}
    <svg {width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`}>
      <path d={`${path} L${width} ${BASE} L0 ${BASE} Z`} fill="var(--sunk)" />
      {#each carpet as column, i (i)}
        <rect
          x={column.x}
          y={TOP}
          width={column.w}
          height={one(column.h)}
          fill={column.fill}
        />
      {/each}
      <line x1="0" y1={BASE} x2={width} y2={BASE} stroke="var(--line)" stroke-width="1" />
      <path
        d={path}
        fill="none"
        stroke="var(--ink)"
        stroke-width="1.4"
        stroke-linejoin="miter"
      />
      <line
        x1="0"
        y1={TOP}
        x2={width}
        y2={TOP}
        stroke="var(--line)"
        stroke-width="1"
        stroke-dasharray="3 4"
      />
      {#each legend as entry (entry.label)}
        <rect x={entry.x} y={LEG} width="9" height="9" rx="1" fill={entry.fill} />
        <text x={entry.x + 12} y={LEG + 7.4} font-size="9" fill="var(--ink)">
          {entry.label}
        </text>
      {/each}
      <text x={width} y={LEG + 7.4} font-size="8.5" fill="var(--muted)" text-anchor="end">
        {tail}
      </text>
    </svg>
  {/if}
</div>

<style>
  .curve {
    margin: 6px 0 0;
  }
  .curve :global(svg) {
    display: block;
  }
</style>
