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

## Deploy

`.github/workflows/deploy.yml` builds on every PR and deploys to Pages on pushes to `main`.

Using a custom domain? Set `site` to it in `astro.config.mjs` and add `public/CNAME`.
