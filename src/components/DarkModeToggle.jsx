import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const THEME_KEY = "theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const DarkModeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const prefersReducedMotion = useReducedMotion();

  // Apply theme + persist
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Keep in sync with system changes, but only if the user hasn't picked manually
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      const hasManualChoice = localStorage.getItem(THEME_KEY + ":manual") === "true";
      if (!hasManualChoice) setTheme(e.matches ? "dark" : "light");
    };
    mql.addEventListener("change", handleSystemChange);
    return () => mql.removeEventListener("change", handleSystemChange);
  }, []);

  // Keep multiple tabs in sync
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === THEME_KEY && e.newValue) setTheme(e.newValue);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    localStorage.setItem(THEME_KEY + ":manual", "true"); // remembers this was an explicit choice
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="btn btn-sm btn-ghost btn-circle tooltip tooltip-bottom overflow-hidden"
      data-tip={isDark ? "Light Mode" : "Dark Mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="sun"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={prefersReducedMotion ? false : { rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.36 5.36l-.7-.7M6.34 6.34l-.7-.7m12.02 12.02l-.7-.7M6.34 17.66l-.7-.7M12 5a7 7 0 100 14 7 7 0 000-14z"
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-base-content/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={prefersReducedMotion ? false : { rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { rotate: -90, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
};

export default DarkModeToggle;