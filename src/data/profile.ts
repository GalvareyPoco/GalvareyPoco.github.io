import type { Lang, Localized } from "../i18n";

// Language-independent profile info, sourced from the GitHub profile README and LinkedIn.
export const profile = {
  name: "Galvarey",
  fullName: "Guillermo Alvarez",
  handle: "GalvareyPoco",
  avatar: "https://avatars.githubusercontent.com/u/61221866",
  // Same photo, self-hosted so the 3D badge can draw it on a canvas. Path is relative to the site root.
  photo: "galvarey.jpg",
  available: true,
  ventures: [
    { label: "ITTI", url: "https://www.itti.digital" },
    { label: "Rebuscate", url: "https://rebuscate.com" },
    { label: "Happy Living", url: "https://happyliving.lat" },
    { label: "Impossible Games", url: "https://impossiblegames.fun" },
  ],
  socials: [
    { label: "GitHub", url: "https://github.com/GalvareyPoco" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/galvareypoco" },
    { label: "GitLab", url: "https://gitlab.com/GalvareyPoco" },
    { label: "X / Twitter", url: "https://twitter.com/GalvareyPoco" },
    { label: "Buy me a coffee", url: "https://www.buymeacoffee.com/galvareypo5" },
  ],
  // TODO: add a public contact email if you want a "mailto" button.
  email: "",
} as const;

type ProfileText = {
  title: string;
  /** Rotating words under the name in the hero. */
  roles: string[];
  location: string;
  about: string[];
  highlights: { value: string; label: string }[];
  languages: string[];
  focus: string[];
  learning: string[];
};

// Everything on the page that is prose, in each language.
const text: Localized<ProfileText> = {
  en: {
    title: "Sr. Software Engineer",
    roles: ["Sr. Software Engineer", "CTO at Happy Living", "Co-founder of Rebuscate", "Game Developer", "Maker & tinkerer"],
    location: "Asunción, Paraguay · Remote",
    about: [
      "I'm a Sr. Software Engineer working remotely from Asunción, Paraguay. I specialize in React Native, POS devices and EMV payments, and video game development, and I enjoy taking products from a blank repo all the way to production.",
      "Today I build POS applications at ITTI. I'm also CTO of Happy Living, co-founder and CTO of Rebuscate, and I make games with Impossible Games, designing and building the infrastructure behind all of them. I also work on AI: orchestrating AI workflows and running our own embedding service for image and text search.",
      "I've been working in tech since 2014, from IT support and teaching computer science to leading engineering, and I hold a degree in Computer Engineering from UTCD.",
      "Away from the keyboard I tinker with electronics, design parts in Fusion 360 and Blender, and print them on FDM and resin printers. I also do penetration testing, which keeps the security side of my work sharp.",
      "Lately I'm digging into machine learning, big data, payment processing and game design. Fun fact: I like turtles. 🐢",
    ],
    highlights: [
      { value: "10+", label: "years in tech" },
      { value: "4", label: "products I'm building now" },
      { value: "3", label: "languages: ES · EN · FR" },
    ],
    languages: ["Spanish (native)", "English (professional)", "French (professional)"],
    focus: ["React Native", "EMV / POS", "Game dev", "Go & Node backends", "Infrastructure building", "AI orchestration & embeddings", "Pentesting", "CAD & 3D printing"],
    learning: ["Machine learning", "Big data", "Payment processing", "Game design & graphics programming"],
  },
  es: {
    title: "Ingeniero de Software Sr.",
    roles: ["Ingeniero de Software Sr.", "CTO de Happy Living", "Cofundador de Rebuscate", "Desarrollador de videojuegos", "Maker y experimentador"],
    location: "Asunción, Paraguay · Remoto",
    about: [
      "Soy Ingeniero de Software Sr. y trabajo de forma remota desde Asunción, Paraguay. Me especializo en React Native, dispositivos POS y pagos EMV, y desarrollo de videojuegos, y disfruto llevar productos desde un repositorio vacío hasta producción.",
      "Hoy desarrollo aplicaciones POS en ITTI. También soy CTO de Happy Living, cofundador y CTO de Rebuscate, y hago videojuegos con Impossible Games, diseñando y construyendo la infraestructura detrás de todos ellos. También trabajo con IA: orquestación de flujos de IA y nuestro propio servicio de embeddings para búsqueda por imagen y texto.",
      "Trabajo en tecnología desde 2014: pasé por soporte técnico y docencia de informática hasta liderar equipos de ingeniería, y soy Ingeniero en Informática por la UTCD.",
      "Lejos del teclado experimento con electrónica, diseño piezas en Fusion 360 y Blender, y las imprimo en impresoras FDM y de resina. También hago pruebas de penetración, lo que mantiene afilado el lado de seguridad de mi trabajo.",
      "Últimamente estoy explorando machine learning, big data, procesamiento de pagos y diseño de videojuegos. Dato curioso: me gustan las tortugas. 🐢",
    ],
    highlights: [
      { value: "10+", label: "años en tecnología" },
      { value: "4", label: "productos que estoy construyendo" },
      { value: "3", label: "idiomas: ES · EN · FR" },
    ],
    languages: ["Español (nativo)", "Inglés (profesional)", "Francés (profesional)"],
    focus: ["React Native", "EMV / POS", "Videojuegos", "Backends en Go y Node", "Construcción de infraestructura", "Orquestación de IA y embeddings", "Pentesting", "CAD e impresión 3D"],
    learning: ["Machine learning", "Big data", "Procesamiento de pagos", "Diseño de videojuegos y programación gráfica"],
  },
  fr: {
    title: "Ingénieur logiciel senior",
    roles: ["Ingénieur logiciel senior", "CTO chez Happy Living", "Cofondateur de Rebuscate", "Développeur de jeux vidéo", "Maker et bricoleur"],
    location: "Asunción, Paraguay · En télétravail",
    about: [
      "Je suis ingénieur logiciel senior et je travaille à distance depuis Asunción, au Paraguay. Je suis spécialisé en React Native, en terminaux POS et paiements EMV, et en développement de jeux vidéo, et j'aime mener un produit d'un dépôt vide jusqu'à la production.",
      "Aujourd'hui, je développe des applications POS chez ITTI. Je suis aussi CTO de Happy Living, cofondateur et CTO de Rebuscate, et je crée des jeux avec Impossible Games, en concevant et en construisant l'infrastructure qui les fait tourner. Je travaille aussi sur l'IA : orchestration de workflows IA et notre propre service d'embeddings pour la recherche par image et par texte.",
      "Je travaille dans la tech depuis 2014, du support informatique et de l'enseignement de l'informatique jusqu'à la direction technique, et je suis ingénieur en informatique diplômé de l'UTCD.",
      "Loin du clavier, je bricole de l'électronique, je conçois des pièces dans Fusion 360 et Blender, et je les imprime sur des imprimantes FDM et résine. Je fais aussi des tests d'intrusion, ce qui garde mon regard sécurité bien aiguisé.",
      "En ce moment, je m'intéresse au machine learning, au big data, au traitement des paiements et au game design. Anecdote : j'adore les tortues. 🐢",
    ],
    highlights: [
      { value: "10+", label: "ans dans la tech" },
      { value: "4", label: "produits en cours de développement" },
      { value: "3", label: "langues : ES · EN · FR" },
    ],
    languages: ["Espagnol (langue maternelle)", "Anglais (niveau professionnel)", "Français (niveau professionnel)"],
    focus: ["React Native", "EMV / POS", "Jeu vidéo", "Backends Go et Node", "Conception d'infrastructure", "Orchestration IA et embeddings", "Pentest", "CAO et impression 3D"],
    learning: ["Machine learning", "Big data", "Traitement des paiements", "Game design et programmation graphique"],
  },
};

export const profileText = (lang: Lang): ProfileText => text[lang];
