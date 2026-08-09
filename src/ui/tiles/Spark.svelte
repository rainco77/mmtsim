<script lang="ts">
  /**
   * A course as a thin line — the smallest chart the tiles share. No axes, no
   * legend: it stands beside the number it explains and never alone.
   */
  export let values: readonly number[];
  export let width = 120;
  export let height = 28;
  export let stroke = "#5b5647";

  function toPoints(series: readonly number[], w: number, h: number): string {
    if (series.length < 2) return "";
    let min = Infinity;
    let max = -Infinity;
    for (const value of series) {
      if (value < min) min = value;
      if (value > max) max = value;
    }
    const span = max - min || 1;
    const dx = w / (series.length - 1);
    return series
      .map((value, i) => {
        const x = (i * dx).toFixed(1);
        const y = (h - 2 - ((value - min) / span) * (h - 4)).toFixed(1);
        return `${x},${y}`;
      })
      .join(" ");
  }

  $: points = toPoints(values, width, height);
</script>

<svg viewBox="0 0 {width} {height}" {width} {height} aria-hidden="true">
  <polyline
    {points}
    fill="none"
    {stroke}
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
</svg>
