/** Identifiers are plain strings; content defines which ones exist (T3). */
export type StockId = string;
export type BranchId = string;
export type ProcessId = string;
export type ProjectId = string;
export type NeedTierId = string;

/** A sector is whoever holds an account and decides. */
export type SectorId = string;

/** An area type is a kind of land: wilderness, cleared land, … (E13). */
export type AreaTypeId = string;

/** A rule is a switch set by a project effect and read by the phases (E23). */
export type RuleId = string;

/** Named random streams stay independent of one another (E25). */
export type RandomStreamId = string;
