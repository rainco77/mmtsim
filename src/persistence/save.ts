import type { GameState } from "../sim/index.ts";

/**
 * Saves (T7). Only the three things that are cheap now and expensive later are
 * fixed here — there is deliberately no save management, because whether the
 * game needs one at all is open.
 *
 * 1. The state is a plain serialisable value; the content is not in it.
 * 2. An envelope around it, from the start.
 * 3. Saving goes through an interface, asynchronous from the start.
 */

export const SCHEMA_VERSION = 1;

export interface SaveMeta {
  readonly name: string;
  readonly savedAt: string;
  readonly tick: number;
  readonly population: number;
}

export interface Snapshot {
  readonly schemaVersion: number;
  readonly gameVersion: string;
  readonly meta: SaveMeta;
  readonly state: GameState;
}

/**
 * Asynchronous although `localStorage` is not: otherwise a later move to
 * IndexedDB or a server would need a change at every call site. With an id from
 * the start, so several slots are free later instead of a conversion.
 */
export interface SaveStore {
  save(id: string, snapshot: Snapshot): Promise<void>;
  load(id: string): Promise<Snapshot | null>;
  list(): Promise<readonly SaveMeta[]>;
  delete(id: string): Promise<void>;
}

export class UnsupportedSaveVersion extends Error {
  readonly found: number;

  constructor(found: number) {
    super(
      `Save was written by a newer version (schema ${found}, this build reads ${SCHEMA_VERSION}).`,
    );
    this.found = found;
    this.name = "UnsupportedSaveVersion";
  }
}

/** One function per version step; run in order when loading. */
export type Migration = (raw: unknown) => unknown;

const MIGRATIONS: ReadonlyMap<number, Migration> = new Map();

export function migrate(raw: Snapshot): Snapshot {
  if (raw.schemaVersion > SCHEMA_VERSION)
    throw new UnsupportedSaveVersion(raw.schemaVersion);
  let current: unknown = raw;
  for (let version = raw.schemaVersion; version < SCHEMA_VERSION; version += 1) {
    const step = MIGRATIONS.get(version);
    if (step === undefined) {
      throw new Error(`No migration from schema ${version} to ${version + 1}.`);
    }
    current = step(current);
  }
  return current as Snapshot;
}

/** Nothing is overwritten or rotated: saving happens deliberately and by name. */
export class MemorySaveStore implements SaveStore {
  readonly #entries = new Map<string, Snapshot>();

  save(id: string, snapshot: Snapshot): Promise<void> {
    this.#entries.set(id, snapshot);
    return Promise.resolve();
  }

  load(id: string): Promise<Snapshot | null> {
    const found = this.#entries.get(id);
    return Promise.resolve(found === undefined ? null : migrate(found));
  }

  list(): Promise<readonly SaveMeta[]> {
    return Promise.resolve([...this.#entries.values()].map((entry) => entry.meta));
  }

  delete(id: string): Promise<void> {
    this.#entries.delete(id);
    return Promise.resolve();
  }
}

export function makeSnapshot(
  state: GameState,
  name: string,
  gameVersion: string,
  now: string,
  population: number,
): Snapshot {
  return {
    schemaVersion: SCHEMA_VERSION,
    gameVersion,
    meta: { name, savedAt: now, tick: state.tick, population },
    state,
  };
}
