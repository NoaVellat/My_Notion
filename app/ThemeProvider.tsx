"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { THEMES, getThemeForPath, type Theme } from "./themes";

// Source unique du thème courant, partagée par le fond et toute l'UI.
const ThemeContext = createContext<Theme>(THEMES[0]);
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1er rendu : thème déterministe (identique serveur/client, pas de clignotement)
  const [theme, setTheme] = useState<Theme>(() => getThemeForPath(pathname));
  const indexRef = useRef(THEMES.indexOf(getThemeForPath(pathname)));
  const firstRender = useRef(true);

  useEffect(() => {
    // On garde le thème initial pour la toute première page affichée
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // À chaque navigation : un thème tiré au hasard, toujours différent du précédent
    let next = indexRef.current;
    while (next === indexRef.current) {
      next = Math.floor(Math.random() * THEMES.length);
    }
    indexRef.current = next;
    setTheme(THEMES[next]);
  }, [pathname]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
