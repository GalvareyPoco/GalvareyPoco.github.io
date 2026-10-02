// Color themes. CSS for each lives in global.css under html[data-theme]; "terere" is the default (no attribute).
export const themes = ["terere", "matrix", "neon", "amber"] as const;
/** "gold" is a secret theme, unlocked by the "Secret level" easter egg; the theme button doesn't cycle to it. */
export type Theme = (typeof themes)[number] | "gold";
export const THEME_KEY = "theme";

export function currentTheme(): Theme {
  return (document.documentElement.dataset.theme as Theme) || "terere";
}

export function setTheme(t: Theme) {
  if (t === "terere") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
  window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
}

export function nextTheme(): Theme {
  const i = (themes as readonly Theme[]).indexOf(currentTheme());
  const t = themes[(i + 1) % themes.length];
  setTheme(t);
  return t;
}
