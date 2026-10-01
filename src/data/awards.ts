import type { Lang, Localized } from "../i18n";

// Prizes won with Happy Living, where Galvarey is CTO. Each one is backed by a public source.
type Award = {
  name: string;
  year: string;
  org: string;
  prize: string;
  place: Localized;
  project: string;
  projectUrl: string;
  detail: Localized;
  source: { label: string; url: string };
};

const awards: Award[] = [
  {
    name: "Moonshot",
    year: "2025",
    org: "ueno bank · itti",
    prize: "USD 30,000",
    place: { en: "1st place", es: "1.er puesto", fr: "1re place" },
    project: "Happy Living",
    projectUrl: "https://happyliving.lat",
    detail: {
      en: "Took the top prize among the 10 winning startups of Paraguay's Moonshot program, after four months of incubation, plus a trip to Silicon Valley for the winning teams.",
      es: "Primer premio entre las 10 startups ganadoras del programa Moonshot de Paraguay, tras cuatro meses de incubación, con viaje a Silicon Valley para los equipos ganadores.",
      fr: "Premier prix parmi les 10 startups lauréates du programme paraguayen Moonshot, après quatre mois d'incubation, avec un voyage dans la Silicon Valley pour les équipes gagnantes.",
    },
    source: { label: "moonshot.ueno.com.py", url: "https://moonshot.ueno.com.py/equipos-ganadores/" },
  },
  {
    name: "InnovandoPY",
    year: "2025",
    org: "MITIC Paraguay",
    prize: "USD 20,000",
    place: { en: "Seed capital winner", es: "Ganador de capital semilla", fr: "Lauréat du capital d'amorçage" },
    project: "Happy Living",
    projectUrl: "https://happyliving.lat",
    detail: {
      en: "One of seven startups awarded seed capital at the 9th InnovandoPY Demo Day, the national startup program run by Paraguay's ICT ministry.",
      es: "Una de las siete startups que recibieron capital semilla en el Demo Day de la 9.ª edición de InnovandoPY, el programa nacional de startups del MITIC.",
      fr: "L'une des sept startups ayant reçu un capital d'amorçage lors du Demo Day de la 9e édition d'InnovandoPY, le programme national de startups du ministère paraguayen des TIC.",
    },
    source: {
      label: "ultimahora.com",
      url: "https://www.ultimahora.com/innovandopy-otorga-usd-140-000-en-capital-semilla-a-siete-startups-paraguayas",
    },
  },
];

export const awardsFor = (lang: Lang) =>
  awards.map((a) => ({ ...a, place: a.place[lang], detail: a.detail[lang] }));

/** One line per award, for the terminal's `awards` command. */
export const awardLines = (lang: Lang) =>
  awardsFor(lang).map((a) => `${a.name} ${a.year} · ${a.place} · ${a.prize} · ${a.project}`);
