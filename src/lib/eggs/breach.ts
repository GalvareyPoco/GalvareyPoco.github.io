// "Secret level": a fake hacking sequence types itself out and flashes ACCESS GRANTED. When the terminal closes,
// the page glitches and every heading and line of text on screen decrypts itself again. Click or Esc skips ahead.
import { toast } from "./toast";
import { note } from "./chip";
import { scramble } from "../effects";
import type { EggStrings } from "./strings";

const wait = (ms: number, skip: { on: boolean }) => (skip.on ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));

export default async function breach(t: EggStrings) {
  const box = document.createElement("div");
  box.dataset.eggUi = "";
  box.className = "egg-breach";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", t.granted);
  const log = document.createElement("pre");
  box.append(log);
  document.body.append(box);
  requestAnimationFrame(() => box.classList.add("is-in"));

  const skip = { on: false };
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && (skip.on = true);
  box.addEventListener("click", () => (skip.on = true));
  addEventListener("keydown", onKey);

  const type = async (text: string, cls = "") => {
    const line = document.createElement("div");
    if (cls) line.className = cls;
    log.append(line);
    for (const ch of text) {
      line.textContent += ch;
      if (!skip.on && ch !== " ") note(1800 + Math.random() * 600, 0.015, { vol: 0.015 });
      await wait(14, skip);
    }
    return line;
  };
  const hex = () => Array.from({ length: 8 }, () => ((Math.random() * 0xffff) | 0).toString(16).padStart(4, "0")).join(" ");

  for (const [i, text] of t.breach.entries()) {
    await type(text, text.startsWith(">") ? "cmd" : "");
    // The firewall and decrypting steps get a progress bar.
    if (i === 2 || i === 3) {
      const bar = await type("[" + "░".repeat(24) + "]   0%", "dim");
      for (let p = 1; p <= 24; p++) {
        bar.textContent = `[${"█".repeat(p)}${"░".repeat(24 - p)}] ${String(Math.round((p / 24) * 100)).padStart(3)}%`;
        await wait(30 + Math.random() * 50, skip);
      }
      for (let k = 0; k < 2; k++) await type(hex(), "dim");
    }
    await wait(180, skip);
  }

  const granted = document.createElement("p");
  granted.className = "egg-granted";
  granted.textContent = t.granted;
  box.append(granted);
  [523, 659, 784, 1047].forEach((f, k) => note(f, 0.12, { at: k * 0.09, vol: 0.05 }));
  await new Promise((r) => setTimeout(r, 1500));

  removeEventListener("keydown", onKey);
  box.classList.remove("is-in");
  await new Promise((r) => setTimeout(r, 400));
  box.remove();

  // The "hacked" page: a glitch pass, then all plain text on screen decrypts.
  const html = document.documentElement;
  html.classList.add("egg-hacked");
  const H = innerHeight;
  for (const el of document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, li, a, button, span")) {
    // Plain text only, and nothing React renders or other effects keep rewriting.
    if (el.children.length || !el.textContent?.trim() || el.closest("[data-egg-ui], astro-island, [data-rotate]")) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H || !r.width) continue;
    scramble(el, 900 + Math.random() * 900);
  }
  toast(t.unlocked, 3200);
  await new Promise((r) => setTimeout(r, 1900));
  html.classList.remove("egg-hacked");
}
