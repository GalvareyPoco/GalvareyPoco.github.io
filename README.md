# Portfolio site

Galvarey's portfolio, built with [Astro](https://astro.build), Tailwind CSS and a couple of React islands. Deployed to GitHub Pages at https://galvareypoco.github.io/.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # type-check + static build into dist/
```

## Edit the content

The site is in Spanish (`/`, the default), English (`/en/`) and French (`/fr/`). The old `/es/` URL redirects to `/`. Every text lives in data files, with one entry per language where it differs:

| What | Where |
|---|---|
| Buttons, headings and other UI labels | `src/i18n.ts` |
| Bio, title, stats, focus, languages | `src/data/profile.ts` |
| Skills | `src/data/skills.ts` (tool names are shared; plain-word items are translated in `itemText`) |
| Work experience | `src/content/experience.json` (dates as `YYYY-MM`; roles with `highlights` get a full card, the rest go under "Earlier"; `order` pins the top roles) |
| Education | `src/content/education.json` |
| Projects | `src/content/projects.json` (`summary` and `highlights` per language) |
| Awards | `src/data/awards.ts` (each one links its public source) |
| Terminal commands and intro script | `src/components/Terminal.tsx` |
| Terere intro text | `intro.*` keys in `src/i18n.ts` |

## Interactive bits

- **Terere intro** (`src/components/TerereIntro.tsx`, drawings in `src/components/terere/`): crush the yuyos in the mortero, drag the jarra to pour, hold to sip, then "another round" or "gracias". Sounds are synthesized with WebAudio (no files) and can be muted. Plays on the first visit only (remembered in `localStorage` as `terere-v1`), skippable with the button or Esc, never shown with reduced motion. `terere` in the terminal or the ⌘K menu replays it.
- **Journey** (`src/data/journey.ts`, `src/components/Journey.tsx`): the places Galvarey lived, in order; the globe draws the route as you scroll.
- **Command menu** (`src/components/CommandPalette.tsx`): ⌘K, Ctrl+K or `/` to jump to sections, switch theme or language, and run the easter eggs.
- **Falling skills** (`src/lib/gravity.ts`): "Drop them" in Skills lets the chips fall and be thrown around (matter-js, loaded on first use).
- **3D lanyard badge** (`src/components/lanyard/`): three.js + Rapier physics, adapted from React Bits' Lanyard. Downloads lazily after the intro; reduced motion or no WebGL gets a static badge. The photo is `public/galvarey.jpg`.
- **Terminal** (`src/components/Terminal.tsx`): type `help`. Commands can switch the color theme (`src/lib/theme.ts`, CSS in `global.css`; tereré is the default).
- **Effects** (`src/lib/effects.ts`): scroll reveal, text decrypt, cursor spotlight and scroll progress.
- **Easter eggs** (`src/lib/eggs/`): the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) plays them one after another: the page falls apart, a secret level, Skill Invaders, shy buttons, a black hole, 8-bit mode, party mode, a tereré flood and a barrel roll. The ⌘K menu runs any of them directly. Text lives in `strings.ts`.
- **Dodge field** (`src/lib/dodge.ts`): elements with `data-dodge` slide away from the cursor a few times, then give up.

## Deploy

`.github/workflows/deploy.yml` builds on every PR and deploys to Pages on pushes to `main`.

Using a custom domain? Set `site` to it in `astro.config.mjs` and add `public/CNAME`.
