// Page-wide effects wired up once by the layout: scroll reveal, text scramble, cursor spotlight,
// scroll progress, theme button and the matrix-rain easter egg (Konami code or `matrix` in the terminal).
import { nextTheme } from "./theme";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const GLYPHS = "アカサタナハマヤラワ0123456789<>/{}[]#$%&*+=";

/** Decrypt-style text reveal; the final text is set as aria-label so screen readers never hear the noise. */
export function scramble(el: HTMLElement, duration = 900) {
  const final = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = final;
  if (reduced()) {
    el.textContent = final;
    return;
  }
  el.setAttribute("aria-label", final);
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const shown = Math.floor(final.length * p);
    let out = final.slice(0, shown);
    for (let i = shown; i < final.length; i++) out += final[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step);
    else el.removeAttribute("aria-label");
  };
  requestAnimationFrame(step);
}

function reveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add("is-visible");
        if (el.hasAttribute("data-scramble")) scramble(el);
        el.querySelectorAll<HTMLElement>("[data-scramble]").forEach((s) => scramble(s));
        io.unobserve(el);
      }
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal, [data-scramble]:not(.reveal [data-scramble])").forEach((el) => io.observe(el));
}

function spotlight() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = (e.target as HTMLElement).closest?.<HTMLElement>(".spotlight");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}

function progress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener(
    "scroll",
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

function themeButton() {
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((b) => {
    const label = b.querySelector("[data-theme-name]");
    const sync = () => label && (label.textContent = document.documentElement.dataset.theme || "matrix");
    sync();
    b.addEventListener("click", () => {
      nextTheme();
    });
    addEventListener("themechange", sync);
  });
}

export function matrixRain(ms = 6000) {
  if (reduced() || document.getElementById("matrix-rain")) return;
  const c = document.createElement("canvas");
  c.id = "matrix-rain";
  c.setAttribute("aria-hidden", "true");
  c.style.cssText = "position:fixed;inset:0;z-index:90;pointer-events:none;transition:opacity .8s;opacity:.85";
  document.body.append(c);
  const ctx = c.getContext("2d")!;
  const dpr = Math.min(devicePixelRatio, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const size = 16;
  const cols = Math.ceil(innerWidth / size);
  const drops = Array.from({ length: cols }, () => Math.random() * -50);
  const color = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#34d399";
  const end = performance.now() + ms;
  let last = 0;
  const frame = (now: number) => {
    if (now - last > 45) {
      last = now;
      ctx.fillStyle = "rgba(7,9,15,0.12)";
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      ctx.fillStyle = color;
      ctx.font = `${size}px 'JetBrains Mono', monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * size, y * size);
        drops[i] = y * size > innerHeight && Math.random() > 0.97 ? 0 : y + 1;
      });
    }
    if (now < end) requestAnimationFrame(frame);
    else {
      c.style.opacity = "0";
      setTimeout(() => c.remove(), 800);
    }
  };
  requestAnimationFrame(frame);
}

function konami() {
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let i = 0;
  addEventListener("keydown", (e) => {
    i = e.key === code[i] ? i + 1 : e.key === code[0] ? 1 : 0;
    if (i === code.length) {
      i = 0;
      matrixRain();
    }
  });
  addEventListener("matrix", () => matrixRain());
}

export function initEffects() {
  // The hero name decrypts again once the intro curtain lifts.
  addEventListener("intro:done", () => document.querySelectorAll<HTMLElement>("#top [data-scramble]").forEach((el) => scramble(el, 1200)));
  reveal();
  spotlight();
  progress();
  themeButton();
  konami();
}
