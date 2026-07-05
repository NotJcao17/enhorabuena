"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type StoreSection = "betterware" | "tienda";

interface ThemeContextType {
  section: StoreSection;
  setSection: (section: StoreSection) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<StoreSection>("betterware");

  useEffect(() => {
    // Aplicamos clases al body para usar con variables CSS o global classes
    if (section === "betterware") {
      document.body.classList.remove("theme-tienda");
      document.body.classList.add("theme-betterware");
    } else {
      document.body.classList.remove("theme-betterware");
      document.body.classList.add("theme-tienda");
    }
  }, [section]);

  return (
    <ThemeContext.Provider value={{ section, setSection }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
