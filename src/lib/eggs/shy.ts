// "Shy buttons": every link and button on screen dodges the pointer (or finger). Each one gives up after a few
// dodges; click three that gave up to win. Clicks don't navigate while the egg runs. Ends after 25 seconds.
import { dodge } from "../dodge";
import { visiblePieces, hold } from "./pieces";
import { toast } from "./toast";
import { note } from "./chip";
import { fill, type EggStrings } from "./strings";

const GOAL = 3;
const TIME = 25000;

export default async function shy(t: EggStrings) {
  // [data-dodge] elements already dodge on their own.
  const els = visiblePieces(40, "a, button, [data-chip]").filter((el) => !el.closest("[data-dodge]"));
  if (!els.length) return;
  const restores = els.map(hold);
  const dodgers = els.map((el) => dodge(el, { radius: 40, reach: 80, tries: 3, rearm: 0 }));
  let caught = 0;
  toast(fill(t.shyStart, { n: GOAL }), 3000);

  await new Promise<void>((done) => {
    const finish = (won: boolean) => {
      clearTimeout(timer);
      removeEventListener("click", onClick, true);
      removeEventListener("pointerdown", onDown, true);
      dodgers.forEach((d) => d.stop());
      setTimeout(() => restores.forEach((r) => r()), 650);
      toast(won ? t.shyWin : t.shyLose, 3000);
      if (won) [523, 659, 784, 1047].forEach((f, i) => note(f, 0.12, { at: i * 0.08 }));
      done();
    };
    // Touch has no hover, so a tap on a shy button makes it dodge instead of clicking.
    const onDown = (e: PointerEvent) => {
      const i = els.findIndex((el) => el.contains(e.target as Node));
      if (i >= 0 && !dodgers[i].yielded && dodgers[i].check(e.clientX, e.clientY)) note(880, 0.05, { slide: 1320, vol: 0.03 });
    };
    const onClick = (e: MouseEvent) => {
      const i = els.findIndex((el) => el.contains(e.target as Node));
      if (i < 0) return;
      e.preventDefault();
      e.stopPropagation();
      if (!dodgers[i].yielded || els[i].dataset.caught) return;
      els[i].dataset.caught = "";
      caught++;
      note(1320, 0.08, { vol: 0.04 });
      if (caught >= GOAL) finish(true);
      else toast(fill(t.shyCaught, { n: GOAL - caught }), 1500);
    };
    addEventListener("pointerdown", onDown, true);
    addEventListener("click", onClick, true);
    const timer = setTimeout(() => finish(false), TIME);
  });
  els.forEach((el) => delete el.dataset.caught);
}
