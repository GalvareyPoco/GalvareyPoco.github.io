// "8-bit mode": the whole site turns into a retro game, with a pixel font, square corners, hard shadows,
// pixelated photos and a chiptune jingle. Running it again switches it off.
import { toast } from "./toast";
import { tune } from "./chip";
import type { EggStrings } from "./strings";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";

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

export default async function eightbit(t: EggStrings) {
  const html = document.documentElement;
  if (html.classList.contains("eightbit")) {
    html.classList.remove("eightbit");
    tune([[784, 1], [659, 1], [523, 1], [392, 2]], 0.08);
    toast(t.eightOff);
    return;
  }
  if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.append(link);
  }
  pixelFilter();
  await document.fonts?.load("16px 'Press Start 2P'").catch(() => null);
  html.classList.add("eightbit");
  tune([[523, 1], [659, 1], [784, 1], [1047, 1], [0, 1], [784, 1], [1047, 3]], 0.09);
  toast(t.eightOn, 3200);
}
