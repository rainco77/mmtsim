import type { Action, ConfigIndex, Derived, GameState } from "../../sim/index.ts";
import type { Policy } from "../policy.ts";
import { MovingPolicy } from "./moving.ts";

/** Firewood put by for this many ticks' burning. */
const RESERVE_TICKS = 6;

/**
 * Where the store of firewood is claimed: below the ranks that keep people
 * alive and above the two that are the community's own buffer, so filling it
 * costs comfort and satiety and never a life.
 */
const RESERVE_RANK = 450;

/**
 * Moves on, keeps a woodpile, and builds whatever is on offer.
 *
 * Written out rather than clever, because a measuring stand has to say what it
 * did (T4). It is one strategy among many possible ones and makes no claim to
 * be the best: one project at a time, the pit before anything else once it can
 * be had, and settling the moment it is offered.
 */
export class BuildingPolicy implements Policy {
  readonly id = "building";
  private readonly moving = new MovingPolicy();
  /** Whether settling is taken the moment it is offered. The thorough play
   * turns this off and adds its own, later settling — filtering the eager
   * one's actions instead deadlocked it: once settling was on offer, the eager
   * play proposed nothing else, and the filter left nothing at all. */
  private readonly settlesEagerly: boolean;

  constructor(settlesEagerly = true) {
    this.settlesEagerly = settlesEagerly;
  }

  decide(state: GameState, derived: Derived, index: ConfigIndex): readonly Action[] {
    const actions: Action[] = [];

    const burn = derived.tiers.find((tier) => tier.tier === "warmth_fire")?.need ?? 0;
    const want = Math.round(burn * RESERVE_TICKS * 10) / 10;
    if (Math.abs((state.stockTargets["wood"] ?? 0) - want) > 0.5) {
      actions.push({
        type: "setStockTarget",
        stock: "wood",
        amount: want,
        rank: RESERVE_RANK,
      });
    }

    const offered = derived.projects.filter(
      (project) => project.available && !project.running,
    );
    if (this.settlesEagerly) {
      const settle = offered.find((project) => project.id === "sedentism");
      if (settle !== undefined) {
        actions.push({ type: "startProject", id: settle.id });
        return actions;
      }
    }

    // Moving answers a range gone thin and does not wait for a free hand; the
    // waiting is what makes it too late. But built things bind: whoever has
    // his pits standing or a hull at the shore does not walk away from them —
    // the trap the epoch is about, chosen here as the play's own judgement.
    const anchored =
      (derived.ownedCapacity["storage"]?.amount ?? 0) / Math.max(1, derived.heads) >= 2 ||
      (derived.ownedCapacity["water"]?.amount ?? 0) > 0;
    if (!anchored) {
      const move = this.moving.decide(state, derived, index);
      if (move.length > 0) return [...actions, ...move];
    }

    if (state.activeProjects.length > 0) return actions;

    // Judgement lives here, not in the content's availability (the interface
    // wants a progress bar on what a project still asks, so availability hangs
    // only on what runs forward): nobody sensible burns land that is still
    // rich from the last burn — a repeatable burn is started only once its
    // bonus has as good as faded.
    const worthBurning = (id: string): boolean =>
      id !== "fire_setting" || (state.rangeCarries["plants"] ?? 0) < 2;

    // Nobody sensible digs the seventh hole: another pit is worth starting
    // only while the store held is thin against the mouths it is for. Without
    // this the pit — repeatable and always high in the sorted offers — is
    // taken every time, and the rest of the tree is never reached.
    const storagePerHead =
      (derived.ownedCapacity["storage"]?.amount ?? 0) / Math.max(1, derived.heads);
    const worthDigging = (id: string): boolean =>
      id !== "storage_pit" || storagePerHead < 3;
    // As with the pits: no fifth hull while the water already reaches.
    const ownedWater = derived.ownedCapacity["water"]?.amount ?? 0;
    const worthLaunching = (id: string): boolean => id !== "boat" || ownedWater < 26;

    const pit = offered.find(
      (project) => project.id === "storage_pit" && worthDigging(project.id),
    );
    const next =
      pit ??
      offered.find(
        (project) =>
          project.id !== "range_change" &&
          worthBurning(project.id) &&
          worthDigging(project.id) &&
          worthLaunching(project.id),
      );
    if (next !== undefined) actions.push({ type: "startProject", id: next.id });
    return actions;
  }
}
