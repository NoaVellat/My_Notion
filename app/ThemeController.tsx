"use client";

import { useEffect } from "react";
import { useTheme } from "./ThemeProvider";

// Applique les variables CSS du thème courant (couleurs + police) sur <html>.
// Tout le reste de l'UI lit ces variables.
export default function ThemeController() {
  const theme = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.css.accent);
    root.style.setProperty("--accent-2", theme.css.accent2);
    root.style.setProperty("--text", theme.css.text);
    root.style.setProperty("--text-muted", theme.css.textMuted);
    root.style.setProperty("--surface", theme.css.surface);
    root.style.setProperty("--surface-border", theme.css.surfaceBorder);
    root.style.setProperty("--font-current", `var(${theme.fontVar})`);
  }, [theme]);

  return null;
}
