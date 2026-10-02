import { useMemo, useState } from "react";

export type ProjectCard = {
  id: string;
  title: string;
  summary: string;
  category: string;
  categoryLabel: string;
  platforms: string[];
  stack: string[];
  url?: string;
  links: { label: string; url: string }[];
  collaborators: { label: string; url?: string }[];
  featured: boolean;
  highlights: string[];
};

export type ProjectGridLabels = { all: string; filter: string; more: string; less: string; with: string };

const ALL = "__all__";

export default function ProjectGrid({ projects, labels }: { projects: ProjectCard[]; labels: ProjectGridLabels }) {
  const labelFor = (category: string) =>
    category === ALL ? labels.all : (projects.find((p) => p.category === category)?.categoryLabel ?? category);
  const categories = useMemo(() => [ALL, ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const [active, setActive] = useState(ALL);
  const [open, setOpen] = useState<string | null>(null);
  const shown = active === ALL ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label={labels.filter}>
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs transition ${
              active === c
                ? "border-accent bg-accent text-ink-950"
                : "border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {labelFor(c)}
            <span className="ml-1.5 opacity-60">
              {c === ALL ? projects.length : projects.filter((p) => p.category === c).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {shown.map((p) => {
          const expanded = open === p.id;
          return (
            <article
              key={p.id}
              data-tilt="4"
              className={`spotlight group flex flex-col rounded-2xl border bg-ink-900/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 ${
                p.featured ? "border-white/12" : "border-white/8"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-accent">
                    {p.categoryLabel}
                    {p.platforms.length > 0 && <span className="text-slate-500"> · {p.platforms.join(" / ")}</span>}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-white">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener" className="after:absolute after:inset-0 after:content-['']">
                        {p.title}
                      </a>
                    ) : (
                      p.title
                    )}
                  </h3>
                </div>
                {p.url && (
                  <span aria-hidden className="text-xl text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent">
                    ↗
                  </span>
                )}
              </div>

              <p className="mt-3 text-slate-400">{p.summary}</p>

              {expanded && (
                <>
                  <ul className="mt-4 space-y-2 text-sm text-slate-400">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="text-accent">▹</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {/* The people this was built with, tagged like mentions */}
                  {p.collaborators.length > 0 && (
                    <ul className="relative z-10 mt-4 flex flex-wrap gap-2" aria-label={labels.with}>
                      {p.collaborators.map((c) => {
                        const tag = (
                          <>
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">{c.label[0]}</span>@{c.label}
                          </>
                        );
                        const cls = "inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 py-0.5 pr-2.5 pl-0.5 font-mono text-xs text-slate-200";
                        return (
                          <li key={c.label}>
                            {c.url ? (
                              <a href={c.url} target="_blank" rel="noopener" className={`${cls} transition hover:border-accent hover:text-white`}>
                                {tag}
                              </a>
                            ) : (
                              <span className={cls}>{tag}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                    {s}
                  </li>
                ))}
              </ul>

              <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs">
                <button
                  onClick={() => setOpen(expanded ? null : p.id)}
                  aria-expanded={expanded}
                  className="font-mono text-accent hover:underline"
                >
                  {expanded ? labels.less : labels.more}
                </button>
                {p.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener" className="text-slate-400 hover:text-white">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
