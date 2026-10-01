import { useEffect, useMemo, useRef, useState } from "react";
import { setTheme, themes } from "../lib/theme";

// ⌘K / Ctrl+K / "/" command menu: jump to sections, switch theme or language, and trigger the easter eggs.

export type PaletteLabels = {
  placeholder: string;
  go: string;
  theme: string;
  lang: string;
  actions: string;
  replay: string;
  matrix: string;
  drop: string;
  copy: string;
  copied: string;
  empty: string;
  hint: string;
  title: string;
};

type Item = { group: string; label: string; icon: string; keywords?: string; run: () => void | string };

export default function CommandPalette({
  labels,
  sections,
  languages,
  links,
}: {
  labels: PaletteLabels;
  sections: { id: string; label: string; n: string }[];
  languages: { code: string; label: string; href: string; current: boolean }[];
  links: { label: string; url: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastFocus = useRef<Element | null>(null);

  const items = useMemo<Item[]>(
    () => [
      ...sections.map((s) => ({
        group: labels.go,
        label: s.label,
        icon: s.n,
        keywords: s.id,
        run: () => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }),
      })),
      ...themes.map((t) => ({ group: labels.theme, label: t, icon: "◐", keywords: "theme color", run: () => setTheme(t) })),
      ...languages.filter((l) => !l.current).map((l) => ({ group: labels.lang, label: l.label, icon: l.code.toUpperCase(), keywords: "language idioma langue", run: () => location.assign(l.href) })),
      { group: labels.actions, label: labels.replay, icon: "🧉", keywords: "terere intro", run: () => dispatchEvent(new Event("terere:replay")) },
      { group: labels.actions, label: labels.matrix, icon: "⌁", keywords: "matrix rain easter egg", run: () => dispatchEvent(new Event("matrix")) },
      {
        group: labels.actions,
        label: labels.drop,
        icon: "⬇",
        keywords: "skills gravity physics",
        run: () => {
          document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => dispatchEvent(new Event("skills:gravity")), 600);
        },
      },
      {
        group: labels.actions,
        label: labels.copy,
        icon: "⧉",
        keywords: "share url",
        run: () => {
          void navigator.clipboard?.writeText(location.origin + location.pathname);
          return labels.copied;
        },
      },
      ...links.map((l) => ({ group: "Links", label: l.label, icon: "↗", keywords: "social", run: () => void window.open(l.url, "_blank", "noopener") })),
    ],
    [labels, sections, languages, links],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!q) return items;
    // Loose match: the typed letters only have to appear in order ("thm" finds "theme").
    const fuzzy = (text: string) => {
      let at = 0;
      for (const ch of q) {
        at = text.indexOf(ch, at);
        if (at < 0) return false;
        at++;
      }
      return true;
    };
    const hay = (i: Item) => `${i.label} ${i.group} ${i.keywords ?? ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const exact = items.filter((i) => hay(i).includes(q));
    return exact.length ? exact : items.filter((i) => fuzzy(hay(i)));
  }, [items, query]);

  const show = () => {
    lastFocus.current = document.activeElement;
    setQuery("");
    setIndex(0);
    setFlash("");
    setOpen(true);
  };
  const hide = () => {
    setOpen(false);
    (lastFocus.current as HTMLElement | null)?.focus?.();
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest?.("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        if (document.documentElement.hasAttribute("data-intro")) return;
        e.preventDefault();
        setOpen((o) => {
          if (!o) show();
          return !o;
        });
      }
    };
    const openEvt = () => show();
    addEventListener("keydown", key);
    addEventListener("palette:open", openEvt);
    return () => {
      removeEventListener("keydown", key);
      removeEventListener("palette:open", openEvt);
    };
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const run = (item: Item | undefined) => {
    if (!item) return;
    const msg = item.run();
    if (typeof msg === "string") {
      setFlash(msg);
      setTimeout(hide, 700);
    } else hide();
  };

  if (!open) return null;

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm" onPointerDown={(e) => e.target === e.currentTarget && hide()}>
      <div role="dialog" aria-modal="true" aria-label={labels.title} className="w-full max-w-lg animate-[fadeUp_.18s_ease] overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl shadow-black">
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <span className="font-mono text-accent">❯</span>
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") run(filtered[index]);
              else if (e.key === "Escape") hide();
            }}
            placeholder={labels.placeholder}
            className="h-14 flex-1 bg-transparent font-mono text-sm text-white placeholder:text-slate-500 focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={`palette-${index}`}
          />
          <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">esc</kbd>
        </div>
        <ul ref={listRef} id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-6 text-center font-mono text-sm text-slate-500">{labels.empty}</li>}
          {filtered.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={`${item.group}-${item.label}`} role="presentation">
                {header && <p className="px-3 pt-3 pb-1 font-mono text-[10px] tracking-widest text-slate-500 uppercase">{header}</p>}
                <button
                  id={`palette-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={i === index}
                  onPointerMove={() => setIndex(i)}
                  onClick={() => run(item)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${i === index ? "bg-accent/15 text-white" : "text-slate-300"}`}
                >
                  <span className="grid h-6 w-8 shrink-0 place-items-center rounded border border-white/10 font-mono text-[10px] text-accent">{item.icon}</span>
                  <span className="flex-1 capitalize">{item.label}</span>
                  {i === index && <span className="font-mono text-[10px] text-slate-500">↵</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-white/10 px-4 py-2 font-mono text-[10px] text-slate-500">{flash ? <span className="text-accent">{flash}</span> : labels.hint}</p>
      </div>
    </div>
  );
}
