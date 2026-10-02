// A small tereré guampa (a straight leather-wrapped cup with a steel bombilla), used instead of the 🧉 emoji,
// which shows a gourd for hot mate.
const scales = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 4 }, (_, c) => `<rect x="${8.2 + c * 3.1 - (r % 2) * 1.5}" y="${11.6 + r * 2.7}" width="2.6" height="2" rx=".8"/>`).join(""),
).join("");

export const GUAMPA_SVG = `<svg viewBox="0 0 24 32" width="1em" height="1.33em" aria-hidden="true" style="display:inline-block;vertical-align:-0.3em">
  <defs><linearGradient id="gq-shade" x1="0" x2="1"><stop offset="0" stop-opacity=".6"/><stop offset=".35" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-opacity="0"/><stop offset="1" stop-opacity=".65"/></linearGradient></defs>
  <path d="M10.6 11 L7.4 1.2" stroke="#e5e7eb" stroke-width="1.6" stroke-linecap="round"/>
  <rect x="4" y="10" width="16" height="21" rx="2" fill="#2a1a10"/>
  <g fill="#7a5034">${scales}</g>
  <path d="M4 10 h3.6 v21 h-1.6 a2 2 0 0 1-2-2z" fill="#24160d"/>
  <path d="M8.4 11 v19" stroke="#c9b08a" stroke-width=".5" stroke-dasharray="1 .8"/>
  <rect x="4" y="10" width="16" height="21" rx="2" fill="url(#gq-shade)"/>
  <ellipse cx="12" cy="10" rx="8" ry="1.9" fill="#1a2e05" stroke="#2a1a10" stroke-width=".8"/>
  <path d="M12.5 10.6 C14 8.6 17 8.4 19 9.8 C17 11 14.5 11.2 12.5 10.6z" fill="#65a30d"/>
</svg>`;
