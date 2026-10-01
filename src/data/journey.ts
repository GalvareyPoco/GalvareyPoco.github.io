import type { Lang, Localized } from "../i18n";

// Galvarey's path, in order. Each chapter points at a place on the globe; the globe draws the route up to the
// chapter you're reading.
type Place = { id: string; city: string; country: Localized; location: [number, number]; flag: string };

const places: Record<string, Place> = {
  smi: {
    id: "smi",
    city: "San Miguel",
    country: { en: "Misiones, Paraguay", es: "Misiones, Paraguay", fr: "Misiones, Paraguay" },
    location: [-26.53, -57.04],
    flag: "🇵🇾",
  },
  scl: {
    id: "scl",
    city: "La Granja",
    country: { en: "Santiago, Chile", es: "Santiago, Chile", fr: "Santiago, Chili" },
    location: [-33.539, -70.625],
    flag: "🇨🇱",
  },
  gva: {
    id: "gva",
    city: "Genève",
    country: { en: "Switzerland", es: "Suiza", fr: "Suisse" },
    location: [46.2044, 6.1432],
    flag: "🇨🇭",
  },
  asu: {
    id: "asu",
    city: "Asunción",
    country: { en: "Paraguay", es: "Paraguay", fr: "Paraguay" },
    location: [-25.2637, -57.5759],
    flag: "🇵🇾",
  },
};

// `where` replaces the "city, country" line when the exact town doesn't matter.
type Chapter = { place: keyof typeof places; title?: Localized; where?: Localized; span: Localized; text: Localized };

const chapters: Chapter[] = [
  {
    place: "smi",
    span: { en: "Where it started", es: "Donde empezó todo", fr: "Là où tout a commencé" },
    text: {
      en: "I grew up in San Miguel, Misiones, a small town known as Paraguay's wool capital.",
      es: "Crecí en San Miguel, Misiones, un pueblo conocido como la capital de la lana del Paraguay.",
      fr: "J'ai grandi à San Miguel, dans les Misiones, une petite ville connue comme la capitale de la laine du Paraguay.",
    },
  },
  {
    place: "scl",
    span: { en: "1.5 years", es: "1 año y medio", fr: "1 an et demi" },
    text: {
      en: "First move abroad: a year and a half in La Granja, on the south side of Santiago, at the foot of the Andes.",
      es: "Primera mudanza al exterior: un año y medio en La Granja, en el sur de Santiago, al pie de la cordillera.",
      fr: "Premier départ à l'étranger : un an et demi à La Granja, au sud de Santiago, au pied de la cordillère des Andes.",
    },
  },
  {
    place: "smi",
    title: { en: "Back in Paraguay", es: "De vuelta en Paraguay", fr: "Retour au Paraguay" },
    where: { en: "Paraguay", es: "Paraguay", fr: "Paraguay" },
    span: { en: "3 months", es: "3 meses", fr: "3 mois" },
    text: {
      en: "Three months back home, just long enough to pack again.",
      es: "Tres meses de vuelta en casa, lo justo para volver a armar las valijas.",
      fr: "Trois mois à la maison, juste le temps de refaire les valises.",
    },
  },
  {
    place: "gva",
    span: { en: "5 years", es: "5 años", fr: "5 ans" },
    text: {
      en: "Five years in Geneva, where I went to school and learned French. It's why I can work in three languages.",
      es: "Cinco años en Ginebra, donde fui a la escuela y aprendí francés. Por eso puedo trabajar en tres idiomas.",
      fr: "Cinq ans à Genève, où je suis allé à l'école et où j'ai appris le français. C'est pour ça que je travaille en trois langues.",
    },
  },
  {
    place: "smi",
    title: { en: "Back to San Miguel", es: "De vuelta a San Miguel", fr: "Retour à San Miguel" },
    span: { en: "Home again", es: "Otra vez en casa", fr: "De nouveau chez moi" },
    text: {
      en: "Back to where it started, with a new language and a lot of ideas.",
      es: "De vuelta a donde empezó todo, con un idioma nuevo y muchas ideas.",
      fr: "Retour aux sources, avec une nouvelle langue et plein d'idées.",
    },
  },
  {
    place: "asu",
    span: { en: "Today", es: "Hoy", fr: "Aujourd'hui" },
    text: {
      en: "Where I live and work today: building products, running my own servers and sharing tereré on hot afternoons.",
      es: "Donde vivo y trabajo hoy: construyendo productos, corriendo mis propios servidores y compartiendo tereré en las tardes de calor.",
      fr: "Là où je vis et travaille aujourd'hui : je construis des produits, je fais tourner mes propres serveurs et je partage le tereré les après-midi de chaleur.",
    },
  },
];

/** Great-circle distance in km. */
function km([a, b]: [number, number], [c, d]: [number, number]) {
  const r = Math.PI / 180;
  const h = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export const journeyFor = (lang: Lang) => {
  let total = 0;
  return chapters.map((c, i) => {
    const p = places[c.place];
    if (i > 0) total += km(places[chapters[i - 1].place].location, p.location);
    return {
      id: `${p.id}-${i}`,
      placeId: p.id,
      title: c.title?.[lang] ?? p.city,
      city: p.city,
      country: p.country[lang],
      location: p.location,
      flag: p.flag,
      where: c.where?.[lang] ?? (c.title ? `${p.city}, ${p.country[lang]}` : p.country[lang]),
      span: c.span[lang],
      text: c.text[lang],
      km: Math.round(total / 100) * 100,
    };
  });
};
export const placesFor = (lang: Lang) => Object.values(places).map((p) => ({ id: p.id, city: p.city, country: p.country[lang], location: p.location, flag: p.flag }));
export type JourneyStop = ReturnType<typeof journeyFor>[number];
export type JourneyPlace = ReturnType<typeof placesFor>[number];
