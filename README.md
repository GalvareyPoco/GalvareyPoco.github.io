# Portfolio site

Galvarey's portfolio, built with [Astro](https://astro.build), Tailwind CSS and a couple of React islands. Deployed to GitHub Pages at https://galvareypoco.github.io/.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # type-check + static build into dist/
```

## Edit the content

The site is in English (`/`), Spanish (`/es/`) and French (`/fr/`). Every text lives in data files, with one entry per language where it differs:

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

- **Terere intro** (`src/components/TerereIntro.tsx`): plays on the first visit only (remembered in `localStorage` as `terere-v1`), skippable with the button or Esc, never shown with reduced motion. `terere` in the terminal replays it.
- **3D lanyard badge** (`src/components/lanyard/`): three.js + Rapier physics, adapted from React Bits' Lanyard. Downloads lazily after the intro; reduced motion or no WebGL gets a static badge. The photo is `public/galvarey.jpg`.
- **Terminal** (`src/components/Terminal.tsx`): type `help`. Commands can switch the color theme (`src/lib/theme.ts`, CSS in `global.css`).
- **Effects** (`src/lib/effects.ts`): scroll reveal, text decrypt, cursor spotlight, scroll progress and the Konami-code matrix rain.

## Deploy

`.github/workflows/deploy.yml` builds on every PR and deploys to Pages on pushes to `main`.

Using a custom domain? Set `site` to it in `astro.config.mjs` and add `public/CNAME`.
