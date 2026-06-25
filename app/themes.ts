// Système de thèmes : chaque page reçoit un thème (fond + police + couleurs UI).
// Le thème est choisi de façon déterministe à partir de l'URL, donc une même
// page garde toujours la même ambiance.

export type Theme = {
  name: string;
  // Index du style de fond utilisé par le shader (voir AnimatedBackground)
  bgStyle: number;
  // Nom de la variable CSS de la police (définie via next/font dans layout)
  fontVar: string;
  // Palette envoyée au shader (RGB normalisé 0–1) : deep -> mid -> glow
  shader: {
    deep: [number, number, number];
    mid: [number, number, number];
    glow: [number, number, number];
  };
  // Variables CSS qui habillent toute l'interface
  css: {
    accent: string;
    accent2: string;
    text: string;
    textMuted: string;
    surface: string;
    surfaceBorder: string;
  };
};

export const THEMES: Theme[] = [
  {
    name: "Indigo",
    bgStyle: 0, // volutes
    fontVar: "--font-grotesk",
    shader: {
      deep: [0.05, 0.04, 0.18],
      mid: [0.35, 0.12, 0.6],
      glow: [0.15, 0.45, 0.95],
    },
    css: {
      accent: "#818cf8",
      accent2: "#a78bfa",
      text: "#e0e7ff",
      textMuted: "#a5b4fc",
      surface: "rgba(30, 27, 75, 0.4)",
      surfaceBorder: "rgba(255, 255, 255, 0.1)",
    },
  },
  {
    name: "Emeraude",
    bgStyle: 1, // taches fluides
    fontVar: "--font-sora",
    shader: {
      deep: [0.02, 0.1, 0.08],
      mid: [0.05, 0.45, 0.3],
      glow: [0.2, 0.95, 0.7],
    },
    css: {
      accent: "#34d399",
      accent2: "#2dd4bf",
      text: "#d1fae5",
      textMuted: "#6ee7b7",
      surface: "rgba(6, 40, 30, 0.4)",
      surfaceBorder: "rgba(255, 255, 255, 0.1)",
    },
  },
  {
    name: "Coucher de soleil",
    bgStyle: 2, // ondes
    fontVar: "--font-round",
    shader: {
      deep: [0.15, 0.04, 0.06],
      mid: [0.7, 0.2, 0.15],
      glow: [0.98, 0.55, 0.25],
    },
    css: {
      accent: "#fb923c",
      accent2: "#f472b6",
      text: "#ffe8d6",
      textMuted: "#fdba74",
      surface: "rgba(55, 20, 18, 0.4)",
      surfaceBorder: "rgba(255, 255, 255, 0.12)",
    },
  },
  {
    name: "Cyber",
    bgStyle: 3, // grille technique
    fontVar: "--font-mono",
    shader: {
      deep: [0.02, 0.08, 0.12],
      mid: [0.05, 0.4, 0.5],
      glow: [0.2, 0.85, 0.95],
    },
    css: {
      accent: "#22d3ee",
      accent2: "#38bdf8",
      text: "#cffafe",
      textMuted: "#67e8f9",
      surface: "rgba(8, 30, 40, 0.4)",
      surfaceBorder: "rgba(255, 255, 255, 0.1)",
    },
  },
  {
    name: "Rose",
    bgStyle: 4, // champ d'étoiles
    fontVar: "--font-serif",
    shader: {
      deep: [0.12, 0.02, 0.12],
      mid: [0.55, 0.1, 0.5],
      glow: [0.95, 0.3, 0.75],
    },
    css: {
      accent: "#f472b6",
      accent2: "#c084fc",
      text: "#fce7f3",
      textMuted: "#f9a8d4",
      surface: "rgba(45, 10, 35, 0.42)",
      surfaceBorder: "rgba(255, 255, 255, 0.12)",
    },
  },
];

// Hash stable d'une chaîne -> entier positif
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Choisit le thème d'une page (toujours le même pour une URL donnée)
export function getThemeForPath(pathname: string): Theme {
  return THEMES[hash(pathname) % THEMES.length];
}
