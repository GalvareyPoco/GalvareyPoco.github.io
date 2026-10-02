// Konami code easter eggs. Each egg is its own module, only downloaded the first time it runs.
// The Konami code plays them one after another; the ⌘K menu (an "egg" event) runs a specific one.
import { EGGS, eggStrings, fill, type Egg, type EggStrings } from "./strings";
import { toast } from "./toast";

const load: Record<Egg, () => Promise<{ default: (t: EggStrings) => Promise<void> | void }>> = {
  collapse: () => import("./collapse"),
  breach: () => import("./breach"),
  invaders: () => import("./invaders"),
  eightbit: () => import("./eightbit"),
  flood: () => import("./flood"),
  matrix: () => import("./matrix").then((m) => ({ default: () => m.default() })),
};

const NEXT_KEY = "egg-next";
let running = false;

export const strings = () => eggStrings(document.documentElement.lang || "en");

export async function playEgg(name: Egg) {
  if (running) return;
  running = true;
  try {
    const egg = await load[name]();
    await egg.default(strings());
  } finally {
    running = false;
  }
}

export function initEggs() {
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let i = 0;
  addEventListener("keydown", (e) => {
    i = e.key === code[i] ? i + 1 : e.key === code[0] ? 1 : 0;
    if (i < code.length) return;
    i = 0;
    if (running) return;
    let n = 0;
    try {
      n = Number(sessionStorage.getItem(NEXT_KEY)) || 0;
      sessionStorage.setItem(NEXT_KEY, String((n + 1) % EGGS.length));
    } catch {}
    const name = EGGS[n % EGGS.length];
    const t = strings();
    toast(fill(t.found, { n: (n % EGGS.length) + 1, total: EGGS.length, name: t.names[name] }));
    void playEgg(name);
  });
  addEventListener("egg", (e) => {
    const name = (e as CustomEvent<string>).detail as Egg;
    if (EGGS.includes(name)) void playEgg(name);
  });
  // The terminal's `matrix` command.
  addEventListener("matrix", () => void playEgg("matrix"));
}
