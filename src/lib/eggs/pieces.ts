// Picks the visible blocks on screen for the eggs that move the page around (collapse, black hole).

const PIECES = "h1, h2, h3, h4, p, a, button, img, li, .card, [data-chip], canvas, svg, kbd";

/** The biggest blocks on screen that aren't inside another chosen block, so each piece moves as one. */
export function visiblePieces(max = 80, selector = PIECES): HTMLElement[] {
  const W = innerWidth;
  const H = innerHeight;
  const chosen: HTMLElement[] = [];
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    if (chosen.length >= max || chosen.some((c) => c.contains(el)) || el.closest("[data-egg-ui]")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
    if (r.width * r.height > W * H * 0.3) continue;
    if (getComputedStyle(el).visibility === "hidden") continue;
    // Skip things covered by something else (the pinned hero sits behind the sections that scroll over it).
    const x = Math.min(W - 1, Math.max(0, r.left + r.width / 2));
    const y = Math.min(H - 1, Math.max(0, r.top + Math.min(r.height / 2, 20)));
    const top = document.elementFromPoint(x, y);
    if (!top || !(el.contains(top) || top.contains(el))) continue;
    chosen.push(el);
  }
  return chosen;
}

/** Remembers an element's inline style so an egg can move it and put it back exactly. */
export function hold(el: HTMLElement) {
  const style = el.getAttribute("style");
  // Transforms don't apply to inline boxes.
  if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
  return () => (style === null ? el.removeAttribute("style") : el.setAttribute("style", style));
}
