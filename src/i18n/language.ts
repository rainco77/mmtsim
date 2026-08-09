import { writable } from "svelte/store";

/** The languages the first stage carries — both from the start (T6, T9). */
export type Language = "de" | "en";

/** The chosen language, reactive: switching re-renders every message. */
export const language = writable<Language>("de");
