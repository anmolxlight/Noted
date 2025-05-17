
"use client"

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // This effect runs on the client after initial mount
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    } else {
      // Fallback to system preference if no theme is stored
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = systemPrefersDark ? "dark" : "light";
      setThemeState(initialTheme);
    }
  }, []); // Empty dependency array: runs once on mount to initialize from localStorage or system preference

  // Separate useEffect to manage the class on documentElement and update localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this runs only on client
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }
  }, [theme]); // Runs when theme state changes

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}
