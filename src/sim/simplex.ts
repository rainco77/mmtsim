/**
 * A small linear program solved in ranked order (E9, E21).
 *
 * This is deliberately not a general solver. It answers exactly the question
 * the allocation asks and nothing else, which is why it fits in one file:
 *
 * > Run the processes as hard as possible, subject to what the country and the
 * > hands allow — covering the first rank as far as it will go, then the second
 * > as far as it will go **without giving up any of the first**, and so on.
 *
 * Two properties of our question strip out most of what a solver usually
 * carries:
 *
 * **Every constraint is an upper bound with a non-negative limit.** A capacity
 * offers so much, a stock holds so much, and no activity can run backwards. So
 * doing nothing is already a lawful answer, and the search can start there —
 * the whole first phase of a textbook simplex, which exists only to find a
 * lawful starting point, is not needed.
 *
 * **The ranks are an order, not a weighting.** Rank 100 comes before rank 200
 * absolutely: no amount of the second buys any of the first. Rather than solve
 * once per rank, the tableau carries **one objective row per rank** and a
 * column may only enter if it improves the rank in hand *and* leaves every
 * higher rank untouched. The order is then a property of the algorithm instead
 * of a sequence of calls — which is also what keeps it quick: one search, not
 * one per rank.
 *
 * What it hands back is not only the answer but the reason: which limits are
 * pressed against, and what one more unit of each would have been worth. Both
 * fall out of the tableau, so they cost nothing and cannot drift from the
 * answer they explain.
 *
 * There are no prices here. What `opportunity` reports is measured in the same
 * units as the objective — how much more of a need would be covered if one more
 * unit of that limit were to be had. That is an opportunity cost in real terms;
 * a price would need a market and a currency, and this epoch has neither.
 */

/** A limit of the form `sum(coefficients · levels) <= limit`, with `limit >= 0`. */
export interface Limit {
  /** Whatever the caller wants to recognise it by; passed straight back. */
  readonly id: string;
  /** One coefficient per activity. Missing entries count as zero. */
  readonly coefficients: readonly number[];
  readonly limit: number;
}

/** What to make as large as possible, most important first. */
export interface Objective {
  readonly id: string;
  readonly coefficients: readonly number[];
}

export interface Program {
  /** How many activities there are; every coefficient array is read this wide. */
  readonly activities: number;
  readonly limits: readonly Limit[];
  /** In strict order of precedence: the first is served before the second. */
  readonly objectives: readonly Objective[];
}

export interface Solution {
  /** How hard each activity runs. */
  readonly levels: readonly number[];
  /** What each objective reached, in its own units, in the order given. */
  readonly values: readonly number[];
  /** Limits pressed right up against — the ones that stopped the answer. */
  readonly binding: readonly string[];
  /**
   * Per limit and per objective: how much more of that objective one further
   * unit of this limit would have bought. Zero wherever the limit is not
   * pressed against, which is the same thing said twice and a useful check.
   */
  readonly opportunity: readonly (readonly number[])[];
  /**
   * True when some activity could have run without bound. It cannot happen in
   * an economy where everything costs hands, but a solver that loops instead of
   * saying so is worse than one that says so.
   */
  readonly unbounded: boolean;
  /** How many pivots it took — measured, so nobody has to guess. */
  readonly steps: number;
}

/**
 * Anything smaller than this is nothing. A tableau accumulates rounding, and a
 * reduced cost of 1e-17 is not an improvement worth a pivot; treating it as one
 * is how a solver spins forever. It guards the arithmetic and never a claim
 * about the model — the tests assert mechanics, not tolerances (E26).
 */
const NOTHING = 1e-9;

/** A ceiling on pivots, so a mistake in here shows up as an answer, not a hang. */
const STEP_LIMIT = 10_000;

export function solve(program: Program): Solution {
  const n = program.activities;
  const m = program.limits.length;
  const k = program.objectives.length;
  // Activities first, then one slack per limit: column `n + i` is what limit
  // `i` has left over. Slacks are what makes "do nothing" a lawful start.
  const width = n + m;

  // rows[i][j] — the tableau, with the remaining right-hand side kept apart so
  // that the pivot arithmetic reads the same for both.
  const rows: Float64Array[] = [];
  const rhs = new Float64Array(m);
  for (let i = 0; i < m; i += 1) {
    const limit = program.limits[i]!;
    const row = new Float64Array(width);
    for (let j = 0; j < n; j += 1) row[j] = limit.coefficients[j] ?? 0;
    row[n + i] = 1;
    rows.push(row);
    // A negative limit would mean doing nothing is already unlawful, which
    // cannot arise here: capacities and stocks are never below zero.
    rhs[i] = Math.max(0, limit.limit);
  }

  // One reduced-cost row per objective, and its running value. With the slack
  // basis nothing is in the basis that any objective pays for, so the reduced
  // costs start out as the plain coefficients.
  const reduced: Float64Array[] = [];
  const values = new Float64Array(k);
  for (let r = 0; r < k; r += 1) {
    const objective = program.objectives[r]!;
    const row = new Float64Array(width);
    for (let j = 0; j < n; j += 1) row[j] = objective.coefficients[j] ?? 0;
    reduced.push(row);
  }

  const basis = new Int32Array(m);
  for (let i = 0; i < m; i += 1) basis[i] = n + i;

  let steps = 0;
  let unbounded = false;

  for (let r = 0; r < k && !unbounded; r += 1) {
    for (;;) {
      if (steps >= STEP_LIMIT) break;
      // **Bland's rule: the lowest eligible column wins.** It is not the
      // quickest choice, but it is the one that cannot cycle — and cycling is a
      // real risk here, because many of our limits are pressed against at the
      // same moment and ties are the rule rather than the exception. At this
      // size the speed it costs does not show.
      let enter = -1;
      for (let j = 0; j < width; j += 1) {
        if (reduced[r]![j]! <= NOTHING) continue;
        // Only within the ground already won: a column that any higher rank
        // pays attention to would buy this rank something at that one's
        // expense, and the ranks are an order, not a trade.
        let free = true;
        for (let q = 0; q < r; q += 1) {
          if (Math.abs(reduced[q]![j]!) > NOTHING) {
            free = false;
            break;
          }
        }
        if (free) {
          enter = j;
          break;
        }
      }
      if (enter < 0) break;

      // How far the entering column can go before some limit is reached: the
      // smallest ratio wins, and among equal ratios the lowest-numbered basic
      // column, which is the other half of Bland's rule.
      let leave = -1;
      let best = Infinity;
      for (let i = 0; i < m; i += 1) {
        const a = rows[i]![enter]!;
        if (a <= NOTHING) continue;
        const ratio = rhs[i]! / a;
        if (
          ratio < best - NOTHING ||
          (ratio < best + NOTHING && (leave < 0 || basis[i]! < basis[leave]!))
        ) {
          best = ratio;
          leave = i;
        }
      }
      if (leave < 0) {
        unbounded = true;
        break;
      }

      pivot(rows, rhs, reduced, values, basis, leave, enter, width, k);
      steps += 1;
    }
  }

  const levels = new Array<number>(n).fill(0);
  for (let i = 0; i < m; i += 1) {
    const column = basis[i]!;
    if (column < n) levels[column] = rhs[i]!;
  }

  const binding: string[] = [];
  const opportunity: number[][] = [];
  for (let i = 0; i < m; i += 1) {
    const slack = slackOf(basis, rhs, n + i, m);
    if (slack <= NOTHING) binding.push(program.limits[i]!.id);
    // The reduced cost of a slack is the negative of what one more unit of its
    // limit would be worth: the slack buys nothing itself, so whatever the
    // tableau still charges for it is what the limit is holding back.
    const perObjective: number[] = [];
    for (let r = 0; r < k; r += 1) perObjective.push(Math.max(0, -reduced[r]![n + i]!));
    opportunity.push(perObjective);
  }

  return {
    levels,
    values: [...values],
    binding,
    opportunity,
    unbounded,
    steps,
  };
}

/** What a slack still holds, whether or not it is in the basis. */
function slackOf(
  basis: Int32Array,
  rhs: Float64Array,
  column: number,
  m: number,
): number {
  for (let i = 0; i < m; i += 1) if (basis[i] === column) return rhs[i]!;
  return 0;
}

function pivot(
  rows: Float64Array[],
  rhs: Float64Array,
  reduced: Float64Array[],
  values: Float64Array,
  basis: Int32Array,
  leave: number,
  enter: number,
  width: number,
  k: number,
): void {
  const pivotRow = rows[leave]!;
  const p = pivotRow[enter]!;
  for (let j = 0; j < width; j += 1) pivotRow[j] = pivotRow[j]! / p;
  rhs[leave] = rhs[leave]! / p;
  // Exactly one, not nearly one: the column that just entered is the basis of
  // this row, and letting rounding leave a smear there is how a tableau drifts.
  pivotRow[enter] = 1;

  for (let i = 0; i < rows.length; i += 1) {
    if (i === leave) continue;
    const row = rows[i]!;
    const factor = row[enter]!;
    if (factor === 0) continue;
    for (let j = 0; j < width; j += 1) row[j] = row[j]! - factor * pivotRow[j]!;
    rhs[i] = rhs[i]! - factor * rhs[leave]!;
    row[enter] = 0;
  }

  for (let r = 0; r < k; r += 1) {
    const row = reduced[r]!;
    const factor = row[enter]!;
    if (factor === 0) continue;
    values[r] = values[r]! + factor * rhs[leave]!;
    for (let j = 0; j < width; j += 1) row[j] = row[j]! - factor * pivotRow[j]!;
    row[enter] = 0;
  }

  basis[leave] = enter;
}
