import fs from "node:fs";
const hist = [
  [1, 1, 1, 1, 1, 0.35],
  [1, 1, 1, 1, 1, 0.3],
  [1, 1, 1, 1, 1, 0.22],
  [1, 1, 1, 1, 0.95, 0.1],
  [1, 1, 1, 1, 0.9, 0],
  [1, 1, 1, 1, 0.88, 0],
  [1, 1, 1, 1, 0.7, 0],
  [1, 1, 1, 0.8, 0.2, 0],
  [1, 1, 1, 1, 0.55, 0],
  [1, 1, 1, 1, 0.72, 0],
  [1, 1, 1, 1, 0.78, 0],
  [1, 1, 1, 1, 0.8, 0],
  [1, 1, 1, 1, 0.76, 0],
  [1, 1, 1, 1, 0.74, 0],
  [1, 1, 1, 1, 0.7, 0],
  [1, 1, 1, 1, 0.68, 0],
  [1, 1, 1, 1, 0.66, 0],
  [1, 1, 1, 1, 0.66, 0],
  [1, 1, 1, 1, 0.64, 0],
  [1, 1, 1, 1, 0.62, 0],
]; // Tick 77 .. 96
const col = (v) => (v >= 0.999 ? "#cddac9" : v > 0 ? "#ecd7d1" : "#e2e5df");
const mode = process.argv[3] ?? "down";
const p = process.argv[2];
let s;
if (mode === "down") {
  // Spalten liegen unter den Segmenten des Bands, Zeit laeuft nach unten
  const W = 600,
    gap = 3,
    n = 6,
    cw = (W - gap * (n - 1)) / n;
  const rows = hist.length,
    rh = 4.2,
    H = rows * rh;
  s = `<svg class="raster" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
  for (let r = 0; r < rows; r++) {
    const tick = hist[rows - 1 - r];
    for (let c = 0; c < n; c++)
      s += `<rect x="${((cw + gap) * c).toFixed(1)}" y="${(r * rh).toFixed(1)}" width="${cw.toFixed(1)}" height="${(rh - 0.6).toFixed(1)}" fill="${col(tick[c])}"/>`;
  }
  s += "</svg>";
} else {
  // Zeilen liegen neben den Raengen, Zeit laeuft nach rechts, juengster Tick rechts
  const H = 6 * 22,
    rh = 22,
    W = 400,
    cw = W / hist.length;
  s = `<svg class="raster" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
  for (let r = 0; r < 6; r++)
    for (let t = 0; t < hist.length; t++)
      s += `<rect x="${(cw * t).toFixed(1)}" y="${(r * rh).toFixed(1)}" width="${(cw - 1).toFixed(1)}" height="${(rh - 3).toFixed(1)}" fill="${col(hist[t][r])}"/>`;
  s += "</svg>";
}
fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace("<!--RASTER-->", s));
console.log("ok");
