import type { Config, ProcessDef } from "./config.ts";
import type { RandomStreamId } from "./ids.ts";
import { draw, type RandomState } from "./random.ts";

/**
 * Risk (E24, E25).
 *
 * Risk is not only weather. A process declares its **exposure per named
 * stream**, and the streams stay independent of one another (E25) — so two
 * processes on the same stream break down *together*, while a process that
 * moves to a different stream is a genuine spreading of risk and not merely a
 * smaller number.
 */

/** The realised factor per stream this tick; 1 means "an average year". */
export type Shocks = Readonly<Record<RandomStreamId, number>>;

/**
 * Draws every stream a process is exposed to, once per tick. Streams nobody is
 * exposed to are not drawn at all, so adding a process later cannot shift the
 * sequence of an existing stream (E25).
 */
export function drawShocks(
  random: RandomState,
  config: Config,
): { shocks: Shocks; random: RandomState } {
  const streams = new Set<RandomStreamId>();
  for (const process of config.processes) {
    for (const [stream, exposure] of Object.entries(process.exposure)) {
      if (exposure > 0) streams.add(stream);
    }
  }

  const shocks: Record<RandomStreamId, number> = {};
  let next = random;
  // Sorted, so the order of the content cannot change the outcome.
  for (const stream of [...streams].sort()) {
    const shape = config.shocks[stream];
    const result = draw(next, stream);
    next = result.random;
    shocks[stream] = shape === undefined ? 1 : shapeValue(result.value, shape);
  }
  return { shocks, random: next };
}

/**
 * `powerLeftSkewed`: `u^(1/exponent) · (exponent+1)/exponent`. Mean exactly 1,
 * an upper bound, and a long left tail (E24) — harvests have a ceiling but no
 * counterpart below, so a bad year is the left edge of this distribution and
 * needs no second mechanism.
 */
function shapeValue(
  uniform: number,
  shape: { readonly shape: "powerLeftSkewed"; readonly exponent: number },
): number {
  const scale = (shape.exponent + 1) / shape.exponent;
  return Math.pow(uniform, 1 / shape.exponent) * scale;
}

/** How this tick's shocks strike one process: the product over its exposures. */
export function shockFactor(process: ProcessDef, shocks: Shocks): number {
  let factor = 1;
  for (const [stream, exposure] of Object.entries(process.exposure)) {
    if (exposure <= 0) continue;
    factor *= 1 + exposure * ((shocks[stream] ?? 1) - 1);
  }
  return Math.max(0, factor);
}

/**
 * How risky a process is at all, independent of this tick's draw — the sum of
 * its exposures. Used to order processes (E5), not to produce with.
 */
export function exposureMagnitude(process: ProcessDef): number {
  let sum = 0;
  for (const exposure of Object.values(process.exposure)) sum += Math.max(0, exposure);
  return sum;
}
