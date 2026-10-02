// "Do a barrel roll": the whole page does one full spin, like the old Google search trick.
import { note } from "./chip";

export default async function barrel() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const body = document.body;
  // Spin around the middle of what's on screen, not the middle of the whole (very tall) page.
  body.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
  body.classList.add("egg-barrel");
  [392, 494, 587, 784].forEach((f, i) => note(f, 0.1, { at: i * 0.12, vol: 0.04 }));
  await new Promise((r) => setTimeout(r, 1500));
  body.classList.remove("egg-barrel");
  body.style.transformOrigin = "";
}
