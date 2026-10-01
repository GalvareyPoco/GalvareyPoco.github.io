// Core profile info, sourced from the GitHub profile README.
export const profile = {
  name: "Galvarey",
  handle: "GalvareyPoco",
  title: "Full-Stack Developer",
  tagline: "Mobile, payments & games. Shipping real products end to end.",
  location: "Asunción, Paraguay · Remote",
  avatar: "https://avatars.githubusercontent.com/u/61221866",
  available: true,
  about: [
    "I'm a full-stack developer working remotely from Asunción, Paraguay. I specialize in React Native, EMV payment terminals and video game development, and I enjoy taking products from a blank repo all the way to production.",
    "Today I build POS applications at ITTI. I'm also CTO at Happy Living, co-founder and CTO of Rebuscate, and I make games with Impossible Games, self-hosting most of the tooling behind them.",
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
  focus: ["React Native", "EMV / POS", "Game dev", "Go & Node backends", "Self-hosted infrastructure", "AI search & embeddings", "Pentesting", "CAD & 3D printing"],
  learning: ["Machine Learning", "Big Data", "Payment processing", "Game design & graphics programming"],
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
