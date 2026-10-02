// "Secret level": a fake hacking sequence types itself out, flashes ACCESS GRANTED and unlocks a hidden gold theme
// that stays on (the theme button cycles back to the normal ones). Click or Esc skips to the end.
import { toast } from "./toast";
import { note } from "./chip";
import { setTheme } from "../theme";
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

  setTheme("gold");
  removeEventListener("keydown", onKey);
  box.classList.remove("is-in");
  await new Promise((r) => setTimeout(r, 400));
  box.remove();
  toast(t.unlocked, 3200);
}
