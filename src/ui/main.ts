import { mount } from "svelte";
import App from "./App.svelte";
import { watchProtocolGrip } from "./protocol.ts";
import "./app.css";

const target = document.getElementById("app");
if (target === null) throw new Error("index.html carries #app");

mount(App, { target });

// The one grip without a surface: `#protokoll` on the address hands out the
// play log. It listens from here, so it answers in mid-run too.
watchProtocolGrip();
