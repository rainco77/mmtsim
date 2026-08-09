/// <reference types="vite/client" />
/// <reference types="@sveltejs/vite-plugin-svelte" />

declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component;
  export default component;
}
