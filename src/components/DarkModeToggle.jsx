import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HiMoon, HiSun } from "react-icons/hi";

const THEME_KEY = "theme";
const MANUAL_THEME_KEY = `${THEME_KEY}:manual`;
const DARK_QUERY = "(prefers-color-scheme: dark)";

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";

  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
};

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // Continue with the system preference if storage is unavailable.
  }

  return getSystemTheme();
};

const DarkModeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const prefersReducedMotion = useReducedMotion();

  const isDark = theme === "dark";

  // Apply the theme to DaisyUI and persist it when storage is available.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The current theme still works even when persistence is unavailable.
    }
  }, [theme]);

  // Follow system changes only when the user has not manually selected a theme.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_QUERY);

    const handleSystemChange = (event) => {
      try {
        const hasManualChoice =
          localStorage.getItem(MANUAL_THEME_KEY) === "true";

        if (!hasManualChoice) {
          setTheme(event.matches ? "dark" : "light");
        }
      } catch {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  // Synchronize theme changes made in other browser tabs.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        if (event.newValue === "light" || event.newValue === "dark") {
          setTheme(event.newValue);
        } else if (event.newValue === null) {
          setTheme(getSystemTheme());
        }
      }

      if (event.key === MANUAL_THEME_KEY && event.newValue === null) {
        setTheme(getSystemTheme());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    try {
      localStorage.setItem(MANUAL_THEME_KEY, "true");
    } catch {
      // Allow theme switching even if storage is unavailable.
    }

    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="btn btn-ghost btn-circle btn-sm shrink-0 text-base-content transition-colors duration-200 hover:bg-base-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={
            prefersReducedMotion
              ? false
              : { opacity: 0, rotate: isDark ? -45 : 45, scale: 0.8 }
          }
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, rotate: isDark ? 45 : -45, scale: 0.8 }
          }
          transition={{
            duration: prefersReducedMotion ? 0 : 0.2,
            ease: "easeOut",
          }}
          className="flex items-center justify-center"
          aria-hidden="true"
        >
          {isDark ? (
            <HiSun className="h-5 w-5 text-amber-400" />
          ) : (
            <HiMoon className="h-5 w-5 text-base-content" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default DarkModeToggle;