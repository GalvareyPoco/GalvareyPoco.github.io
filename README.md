# Portfolio site

Galvarey's portfolio, built with [Astro](https://astro.build), Tailwind CSS and a couple of React islands. Deployed to GitHub Pages at https://galvareypoco.github.io/.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # type-check + static build into dist/
```

## Edit the content

Everything on the page comes from files, no component changes needed:

| What | Where |
|---|---|
| Name, bio, links, stats, languages | `src/data/profile.ts` |
| Skills | `src/data/skills.ts` |
| Work experience | `src/content/experience.json` (roles with `highlights` get a full card; the rest go under "Earlier") |
| Education | `src/content/education.json` |
| Projects | one Markdown file per project in `src/content/projects/` (frontmatter = card, `- ` bullets = "what I did") |

## Deploy

`.github/workflows/deploy.yml` builds on every PR and deploys to Pages on pushes to `main`.

Using a custom domain? Set `site` to it in `astro.config.mjs` and add `public/CNAME`.
