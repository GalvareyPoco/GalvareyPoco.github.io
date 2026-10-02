// "8-bit mode": the whole site turns into a retro game, with pixel fonts, square corners, hard shadows,
// pixelated photos and a chiptune jingle. It stays on (with a badge to switch it off, or Esc) until you leave it.
// The pixel fonts are sized to take the same width as the normal ones, so nothing in the layout moves.
import { toast } from "./toast";
import { tune } from "./chip";
import type { EggStrings } from "./strings";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;700&display=swap";

/** SVG filter that pixelates whatever uses it (photos): sample one color per block and grow it to fill the block. */
function pixelFilter() {
  if (document.getElementById("pixelate")) return;
  const s = 6;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("style", "position:absolute;width:0;height:0");
  svg.innerHTML = `<filter id="pixelate" x="0" y="0">
    <feFlood x="${s / 2}" y="${s / 2}" height="1" width="1"/>
    <feComposite width="${s}" height="${s}"/>
    <feTile result="a"/>
    <feComposite in="SourceGraphic" in2="a" operator="in"/>
    <feMorphology operator="dilate" radius="${s / 2}"/>
  </filter>`;
  document.body.append(svg);
}

let exit: (() => void) | null = null;

export default async function eightbit(t: EggStrings) {
  const html = document.documentElement;
  if (exit) return exit();
  if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.append(link);
  }
  pixelFilter();
  await Promise.all(["16px 'Press Start 2P'", "16px 'Pixelify Sans'", "700 16px 'Pixelify Sans'"].map((f) => document.fonts?.load(f))).catch(() => null);
  html.classList.add("eightbit");
  tune([[523, 1], [659, 1], [784, 1], [1047, 1], [0, 1], [784, 1], [1047, 3]], 0.09);
  toast(t.eightOn, 3600);

  // A badge that stays on screen while the mode is on, so it's clear how to get back.
  const badge = document.createElement("button");
  badge.type = "button";
  badge.dataset.eggUi = "";
  badge.className = "egg-8bit-badge";
  badge.innerHTML = `<span>▶ ${t.eightBadge}</span><span>✕ ${t.eightExit}</span>`;
  document.body.append(badge);
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && exit?.();
  addEventListener("keydown", onKey);
  exit = () => {
    exit = null;
    removeEventListener("keydown", onKey);
    badge.removeEventListener("click", click);
    badge.remove();
    html.classList.remove("eightbit");
    tune([[784, 1], [659, 1], [523, 1], [392, 2]], 0.08);
    toast(t.eightOff);
  };
  const click = () => exit?.();
  badge.addEventListener("click", click);
}
