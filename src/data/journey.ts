import type { Lang, Localized } from "../i18n";

// Places Galvarey has lived, shown on the globe. Order is not a timeline: home first.
type Stop = {
  id: string;
  city: string;
  country: Localized;
  location: [number, number];
  span: Localized;
  text: Localized;
  flag: string;
};

const stops: Stop[] = [
  {
    id: "asu",
    city: "Asunción",
    country: { en: "Paraguay", es: "Paraguay", fr: "Paraguay" },
    location: [-25.2637, -57.5759],
    span: { en: "Home, today", es: "Mi casa, hoy", fr: "Chez moi, aujourd'hui" },
    text: {
      en: "Where I live and work today: building products, running my own servers and sharing tereré on hot afternoons.",
      es: "Donde vivo y trabajo hoy: construyendo productos, corriendo mis propios servidores y compartiendo tereré en las tardes de calor.",
      fr: "Là où je vis et travaille aujourd'hui : je construis des produits, je fais tourner mes propres serveurs et je partage le tereré les après-midi de chaleur.",
    },
    flag: "🇵🇾",
  },
  {
    id: "gva",
    city: "Genève",
    country: { en: "Switzerland", es: "Suiza", fr: "Suisse" },
    location: [46.2044, 6.1432],
    span: { en: "5 years", es: "5 años", fr: "5 ans" },
    text: {
      en: "Five years in Geneva, where I went to school and learned French. It's why I can work in three languages.",
      es: "Cinco años en Ginebra, donde fui a la escuela y aprendí francés. Por eso puedo trabajar en tres idiomas.",
      fr: "Cinq ans à Genève, où je suis allé à l'école et où j'ai appris le français. C'est pour ça que je travaille en trois langues.",
    },
    flag: "🇨🇭",
  },
  {
    id: "scl",
    city: "La Granja",
    country: { en: "Santiago, Chile", es: "Santiago, Chile", fr: "Santiago, Chili" },
    location: [-33.539, -70.625],
    span: { en: "1.5 years", es: "1 año y medio", fr: "1 an et demi" },
    text: {
      en: "A year and a half in La Granja, on the south side of Santiago, at the foot of the Andes.",
      es: "Un año y medio en La Granja, en el sur de Santiago, al pie de la cordillera.",
      fr: "Un an et demi à La Granja, au sud de Santiago, au pied de la cordillère des Andes.",
    },
    flag: "🇨🇱",
  },
];

export const journeyFor = (lang: Lang) =>
  stops.map((s) => ({ id: s.id, city: s.city, country: s.country[lang], location: s.location, span: s.span[lang], text: s.text[lang], flag: s.flag }));
export type JourneyStop = ReturnType<typeof journeyFor>[number];
