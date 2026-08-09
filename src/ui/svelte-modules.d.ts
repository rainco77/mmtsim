/**
 * Lets `tsc --noEmit` follow imports of Svelte components; the real checking
 * of component internals is the Svelte compiler's job at build time.
 */
declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component<Record<string, unknown>>;
  export default component;
}
