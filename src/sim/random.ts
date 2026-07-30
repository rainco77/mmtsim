import type { RandomStreamId } from "./ids.ts";

/**
 * Named random streams (E25).
 *
 * The state carries one seed and, per stream, a counter. A draw is a pure
 * function of `(seed, stream, counter)`, so adding a new stream never shifts
 * the sequence of an existing one — a balance run, a save and a test all keep
 * behaving the same when a stream is added later.
 *
 * A missing counter means "never drawn", so a new stream needs no migration.
 */
export interface RandomState {
  readonly seed: number;
  readonly draws: Readonly<Record<RandomStreamId, number>>;
}

export function createRandomState(seed: number): RandomState {
  return { seed, draws: {} };
}

/** 32-bit mix, deterministic across engines: only integer arithmetic. */
function mix32(value: number): number {
  let x = value | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  x = x ^ (x >>> 15);
  return x >>> 0;
}

function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
  }
  return hash >>> 0;
}

/**
 * A uniform value in [0, 1) for the given stream position. Pure: the same
 * arguments always yield the same number.
 */
export function uniformAt(
  random: RandomState,
  stream: RandomStreamId,
  counter: number,
): number {
  const combined = mix32(mix32(random.seed ^ hashString(stream)) + counter);
  return combined / 0x1_0000_0000;
}

/** The counter a stream stands at; a stream never drawn stands at zero. */
export function counterOf(random: RandomState, stream: RandomStreamId): number {
  return random.draws[stream] ?? 0;
}

/**
 * Draw once from a stream. Returns the value and the advanced state — the
 * caller decides what to do with both, nothing is hidden.
 */
export function draw(
  random: RandomState,
  stream: RandomStreamId,
): { value: number; random: RandomState } {
  const counter = counterOf(random, stream);
  const value = uniformAt(random, stream, counter);
  return {
    value,
    random: { seed: random.seed, draws: { ...random.draws, [stream]: counter + 1 } },
  };
}

/** The value a stream will produce next, without advancing it. */
export function peek(random: RandomState, stream: RandomStreamId): number {
  return uniformAt(random, stream, counterOf(random, stream));
}
