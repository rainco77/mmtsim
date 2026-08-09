import { mount } from "svelte";
import App from "./App.svelte";

const target = document.getElementById("app");
if (target === null) throw new Error("index.html carries #app");

mount(App, { target });
