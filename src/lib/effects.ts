// Page-wide effects wired up once by the layout: scroll reveal, text scramble, cursor spotlight,
// scroll progress, theme button and the matrix-rain easter egg (Konami code or `matrix` in the terminal).
import { nextTheme } from "./theme";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(pointer: fine)").matches;
const GLYPHS = "アカサタナハマヤラワ0123456789<>/{}[]#$%&*+=";
const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&";

/**
 * Decrypt-style text reveal. The real text stays in the flow (invisible) and the noise is drawn on top of it,
 * so the element never changes size and nothing around it moves. Screen readers get the real text via aria-label.
 */
export function scramble(el: HTMLElement, duration = 900) {
  const final = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = final;
  if (reduced()) {
    el.textContent = final;
    return;
  }
  el.setAttribute("aria-label", final);
  el.style.position = "relative";
  el.innerHTML = "";
  const ghost = document.createElement("span");
  ghost.textContent = final;
  ghost.style.visibility = "hidden";
  ghost.setAttribute("aria-hidden", "true");
  const live = document.createElement("span");
  live.setAttribute("aria-hidden", "true");
  live.style.cssText = "position:absolute;inset:0;overflow:hidden;white-space:inherit";
  el.append(ghost, live);
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const shown = Math.floor(final.length * p);
    let out = final.slice(0, shown);
    for (let i = shown; i < final.length; i++) out += /\s/.test(final[i]) ? final[i] : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
    live.textContent = out;
    if (p < 1) requestAnimationFrame(step);
    else {
      el.textContent = final;
      el.removeAttribute("aria-label");
    }
  };
  requestAnimationFrame(step);
}

/** "10+" counts up from 0, keeping any prefix/suffix ("USD 30,000", "3"). */
function countUp(el: HTMLElement, duration = 1400) {
  const text = el.dataset.count ?? el.textContent ?? "";
  const m = /^(\D*)([\d,]+)(.*)$/.exec(text);
  if (!m || reduced()) return;
  const [, pre, num, post] = m;
  const target = Number(num.replace(/,/g, ""));
  const fmt = new Intl.NumberFormat("en-US");
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + (num.includes(",") ? fmt.format(Math.round(target * eased)) : Math.round(target * eased)) + post;
    if (p < 1) requestAnimationFrame(step);
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
        if (el.hasAttribute("data-count")) countUp(el);
        el.querySelectorAll<HTMLElement>("[data-count]").forEach((s) => countUp(s));
        io.unobserve(el);
      }
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal, [data-scramble]:not(.reveal [data-scramble]), [data-count]:not(.reveal [data-count])").forEach((el) => io.observe(el));
}

function spotlight() {
  if (!finePointer()) return;
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

/** 3D tilt with a glare highlight on [data-tilt] cards (React Bits' TiltedCard idea). Delegated, so React-rendered cards work too. */
function tilt() {
  if (!finePointer() || reduced()) return;
  let current: HTMLElement | null = null;
  const reset = (el: HTMLElement) => {
    el.style.transform = "";
    el.style.removeProperty("--glare");
  };
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = (e.target as HTMLElement).closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const max = Number(el.dataset.tilt) || 6;
      el.style.transition = "transform .15s ease-out";
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
      el.style.setProperty("--glare", "1");
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => current && reset(current));
}

/** Buttons that lean toward the pointer (React Bits' Magnet). */
function magnet() {
  if (!finePointer() || reduced()) return;
  const els = [...document.querySelectorAll<HTMLElement>("[data-magnet]")];
  if (!els.length) return;
  addEventListener(
    "pointermove",
    (e) => {
      for (const el of els) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
        el.style.transition = near ? "transform .2s ease-out" : "transform .5s ease";
        el.style.transform = near ? `translate(${dx * 0.25}px, ${dy * 0.35}px)` : "";
      }
    },
    { passive: true },
  );
}

/** Little sparks on every click (React Bits' ClickSpark). */
function clickSpark() {
  if (reduced()) return;
  addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("canvas, input, .intro-root")) return;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "60");
    svg.setAttribute("height", "60");
    svg.style.cssText = `position:fixed;left:${e.clientX - 30}px;top:${e.clientY - 30}px;pointer-events:none;z-index:120;overflow:visible`;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(30 + Math.cos(a) * 8));
      line.setAttribute("y1", String(30 + Math.sin(a) * 8));
      line.setAttribute("x2", String(30 + Math.cos(a) * 16));
      line.setAttribute("y2", String(30 + Math.sin(a) * 16));
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-linecap", "round");
      line.animate(
        [
          { transform: "translate(0,0)", opacity: 1 },
          { transform: `translate(${Math.cos(a) * 14}px,${Math.sin(a) * 14}px)`, opacity: 0 },
        ],
        { duration: 450, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
      );
      svg.append(line);
    }
    document.body.append(svg);
    setTimeout(() => svg.remove(), 500);
  });
}

/** Crosshair brackets that follow the pointer and lock onto links and buttons (React Bits' TargetCursor). */
function targetCursor() {
  if (!finePointer() || reduced()) return;
  const box = document.createElement("div");
  box.className = "target-cursor";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = "<i></i><i></i><i></i><i></i>";
  document.body.append(box);
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let tx = x;
  let ty = y;
  let w = 22;
  let h = 22;
  let tw = w;
  let th = h;
  let visible = false;
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      const t = (e.target as HTMLElement).closest?.<HTMLElement>("a, button, input, [data-cursor]");
      if (t && !t.closest(".intro-root")) {
        const r = t.getBoundingClientRect();
        tx = r.left + r.width / 2;
        ty = r.top + r.height / 2;
        tw = r.width + 12;
        th = r.height + 12;
        box.classList.add("is-locked");
      } else {
        tx = e.clientX;
        ty = e.clientY;
        tw = th = 22;
        box.classList.remove("is-locked");
      }
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        box.style.opacity = "1";
      }
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    visible = false;
    box.style.opacity = "0";
  });
  const frame = () => {
    x += (tx - x) * 0.25;
    y += (ty - y) * 0.25;
    w += (tw - w) * 0.2;
    h += (th - h) * 0.2;
    box.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px)`;
    box.style.width = `${w}px`;
    box.style.height = `${h}px`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Experience timeline: the line fills and the dots light up as you scroll past them. */
function timeline() {
  const line = document.querySelector<HTMLElement>("[data-timeline]");
  const fill = document.querySelector<HTMLElement>("[data-timeline-fill]");
  if (!line || !fill) return;
  const dots = [...line.querySelectorAll<HTMLElement>("[data-timeline-dot]")];
  let queued = false;
  const update = () => {
    queued = false;
    const r = line.getBoundingClientRect();
    const mid = innerHeight * 0.6;
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    fill.style.transform = `scaleY(${p})`;
    for (const d of dots) d.classList.toggle("is-lit", d.getBoundingClientRect().top < mid);
  };
  addEventListener("scroll", () => !queued && (queued = true) && requestAnimationFrame(update), { passive: true });
  update();
}

/** Paragraph words brighten as they scroll into view (React Bits' ScrollReveal). */
function wordReveal() {
  const els = [...document.querySelectorAll<HTMLElement>("[data-words]")];
  if (!els.length || reduced()) return;
  const all: { el: HTMLElement; words: HTMLElement[] }[] = els.map((el) => {
    const words = (el.textContent ?? "").split(/(\s+)/).map((w) => {
      if (/^\s+$/.test(w)) return document.createTextNode(w);
      const s = document.createElement("span");
      s.textContent = w;
      s.className = "word";
      return s;
    });
    el.replaceChildren(...words);
    return { el, words: words.filter((n): n is HTMLElement => n instanceof HTMLElement) };
  });
  let queued = false;
  const update = () => {
    queued = false;
    for (const { el, words } of all) {
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    }
  };
  addEventListener("scroll", () => !queued && (queued = true) && requestAnimationFrame(update), { passive: true });
  update();
}

/** Rotating words (React Bits' RotatingText): cycles through the JSON list in data-rotate. */
function rotate() {
  document.querySelectorAll<HTMLElement>("[data-rotate]").forEach((el) => {
    const words: string[] = JSON.parse(el.dataset.rotate || "[]");
    if (words.length < 2 || reduced()) return;
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      el.animate([{ opacity: 1, transform: "none", filter: "blur(0)" }, { opacity: 0, transform: "translateY(-40%)", filter: "blur(6px)" }], { duration: 250, easing: "ease-in" }).onfinish = () => {
        el.textContent = words[i];
        el.animate([{ opacity: 0, transform: "translateY(40%)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 350, easing: "cubic-bezier(.2,.8,.2,1)" });
      };
    }, 2600);
  });
}

/** Interactive dot grid behind the hero (React Bits' DotGrid): dots swell and light up around the pointer. */
function dotGrid() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-dotgrid]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  const gap = 28;
  let w = 0;
  let h = 0;
  let px = -999;
  let py = -999;
  let running = false;
  let color = "#34d399";
  const resize = () => {
    const dpr = Math.min(devicePixelRatio, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    color = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || color;
    draw(performance.now());
  };
  const draw = (now: number) => {
    ctx.clearRect(0, 0, w, h);
    const t = now / 1000;
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        const d = Math.hypot(x - px, y - py);
        const near = Math.max(0, 1 - d / 160);
        const wave = reduced() ? 0 : (Math.sin(x * 0.02 + y * 0.015 - t * 1.2) + 1) / 2;
        const r = 1 + near * 2.4 + wave * 0.4;
        ctx.globalAlpha = 0.12 + near * 0.75 + wave * 0.08;
        ctx.fillStyle = near > 0.05 ? color : "#94a3b8";
        // Dots near the pointer are pushed away a little.
        const push = near * 10;
        const ang = Math.atan2(y - py, x - px);
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * push, y + Math.sin(ang) * push, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };
  const loop = (now: number) => {
    if (!running) return;
    // Nothing to see behind the intro overlay.
    if (!document.documentElement.hasAttribute("data-intro")) draw(now);
    requestAnimationFrame(loop);
  };
  const host = canvas.parentElement!;
  host.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    },
    { passive: true },
  );
  host.addEventListener("pointerleave", () => {
    px = py = -999;
  });
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting && !reduced();
    if (running && !was) requestAnimationFrame(loop);
  }).observe(canvas);
  addEventListener("resize", resize);
  addEventListener("themechange", resize);
  resize();
}

export function initEffects() {
  // The hero name decrypts again once the intro curtain lifts.
  addEventListener("intro:done", () => document.querySelectorAll<HTMLElement>("#top [data-scramble]").forEach((el) => scramble(el, 1200)));
  wordReveal();
  reveal();
  spotlight();
  progress();
  themeButton();
  konami();
  tilt();
  magnet();
  clickSpark();
  targetCursor();
  timeline();
  rotate();
  dotGrid();
}
