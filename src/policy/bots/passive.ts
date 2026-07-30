import type { Policy } from "../policy.ts";

/** Does nothing. The baseline every other strategy must beat (T4). */
export class PassivePolicy implements Policy {
  readonly id = "passive";
  decide(): readonly [] {
    return [];
  }
}
