import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ColorMode = "light" | "dark" | "system";

type ThemeContextType = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  isDarkMode: boolean;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ColorMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = "system",
  storageKey = "color-mode",
}: ThemeProviderProps) {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    // Check for stored preference
    const storedMode = localStorage.getItem(storageKey) as ColorMode | null;
    return storedMode || defaultMode;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Update the color mode and store it in localStorage
  const updateColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    localStorage.setItem(storageKey, mode);
  };

  // Toggle between light and dark modes
  const toggleColorMode = () => {
    updateColorMode(isDarkMode ? "light" : "dark");
  };

  // Determine if dark mode should be active based on the current mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveMode = colorMode;
    if (colorMode === "system") {
      effectiveMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    setIsDarkMode(effectiveMode === "dark");
    root.classList.add(effectiveMode);
  }, [colorMode]);

  // Listen for system preference changes
  useEffect(() => {
    if (colorMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(
        mediaQuery.matches ? "dark" : "light"
      );
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorMode]);

  const value = {
    colorMode,
    setColorMode: updateColorMode,
    isDarkMode,
    toggleColorMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
