// Dodge field (React Bits' DodgeField idea): an element slides away when the pointer comes close, once per
// approach. After a few dodges it gives up and glides home, and can be clicked like normal.

export type DodgeOptions = {
  /** How close (px, from the element's edge) the pointer can get before it dodges. */
  radius?: number;
  /** How far each dodge moves it. */
  reach?: number;
  /** Dodges before it gives up. */
  tries?: number;
  /** After giving up, start dodging again after this many ms (0 = never). */
  rearm?: number;
  /** Called when it gives up and glides home. */
  onYield?: () => void;
};

export function dodge(el: HTMLElement, { radius = 60, reach = 90, tries = 4, rearm = 8000, onYield }: DodgeOptions = {}) {
  let ox = 0;
  let oy = 0;
  let count = 0;
  let armed = true;
  let yielded = false;
  let timer = 0;
  const limit = reach * 2.2;
  el.style.transition = "transform .35s cubic-bezier(.2,.9,.3,1.25)";
  el.style.willChange = "transform";

  const place = () => (el.style.transform = `translate(${ox}px, ${oy}px)`);

  const giveUp = () => {
    yielded = true;
    el.dataset.dodgeYielded = "";
    el.style.transition = "transform .9s cubic-bezier(.3,1.3,.5,1)";
    ox = oy = 0;
    place();
    onYield?.();
    if (rearm)
      timer = window.setTimeout(() => {
        yielded = false;
        count = 0;
        delete el.dataset.dodgeYielded;
        el.style.transition = "transform .35s cubic-bezier(.2,.9,.3,1.25)";
      }, rearm);
  };

  /** Returns true if it dodged. */
  const check = (px: number, py: number) => {
    if (yielded) return false;
    const r = el.getBoundingClientRect();
    // Distance from the pointer to the element's box (0 when inside it).
    const dx = Math.max(r.left - px, 0, px - r.right);
    const dy = Math.max(r.top - py, 0, py - r.bottom);
    const d = Math.hypot(dx, dy);
    if (!armed) {
      if (d > radius * 2) armed = true;
      return false;
    }
    if (d > radius) return false;
    armed = false;
    count++;
    // Flee straight away from the pointer; if that runs out of room, swerve sideways instead.
    let ax = r.left + r.width / 2 - px;
    let ay = r.top + r.height / 2 - py;
    const len = Math.hypot(ax, ay) || 1;
    ax /= len;
    ay /= len;
    let nx = ox + ax * reach;
    let ny = oy + ay * reach;
    // Too far from home, or off screen.
    const off = (x: number, y: number) =>
      Math.hypot(x, y) > limit || r.left - ox + x < 8 || r.right - ox + x > innerWidth - 8 || r.top - oy + y < 8 || r.bottom - oy + y > innerHeight - 8;
    if (off(nx, ny)) {
      const side = Math.random() < 0.5 ? 1 : -1;
      nx = ox - ay * reach * side;
      ny = oy + ax * reach * side;
      if (off(nx, ny)) {
        nx = ox * 0.3;
        ny = oy * 0.3;
      }
    }
    ox = nx;
    oy = ny;
    place();
    if (count >= tries) window.setTimeout(giveUp, 450);
    return true;
  };

  const move = (e: PointerEvent) => check(e.clientX, e.clientY);
  addEventListener("pointermove", move, { passive: true });
  return {
    check,
    get yielded() {
      return yielded;
    },
    stop() {
      removeEventListener("pointermove", move);
      clearTimeout(timer);
      el.style.transition = "transform .6s ease";
      el.style.transform = "";
      delete el.dataset.dodgeYielded;
    },
  };
}

/** Wires up every [data-dodge] element on the page (mouse and trackpad only; on touch there is no hover to dodge). */
export function dodgeField() {
  if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll<HTMLElement>("[data-dodge]").forEach((el) => {
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    dodge(el, { radius: Number(el.dataset.dodge) || 50, reach: 70, tries: 3 });
  });
}
