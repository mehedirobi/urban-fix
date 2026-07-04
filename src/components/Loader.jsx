import React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Safe size mapping (Tailwind does NOT support dynamic class strings)
 */
const SIZE_MAP = {
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-[3px]",
  lg: "w-14 h-14 border-4",
  xl: "w-20 h-20 border-4",
};

/**
 * Safe color mapping — arc color only, track stays theme-neutral
 */
const COLOR_MAP = {
  blue: "border-t-blue-500",
  red: "border-t-red-500",
  green: "border-t-green-500",
  gray: "border-t-gray-500",
  primary: "border-t-primary",
};

const Loader = ({
  message = "Loading data...",
  size = "md",
  color = "primary",
  fullScreen = true,
}) => {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const colorClass = COLOR_MAP[color] || COLOR_MAP.primary;
  const prefersReducedMotion = useReducedMotion();

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center"
    >
      <div className="relative">
        {/* Static track */}
        <div className={`${sizeClass} rounded-full border-base-content/10`} />
        {/* Animated arc, layered on top */}
        <div
          className={[
            sizeClass,
            colorClass,
            "border-transparent rounded-full absolute inset-0",
            prefersReducedMotion ? "animate-pulse" : "animate-spin",
          ].join(" ")}
        />
      </div>

      {message ? (
        <p className="mt-4 text-base-content/80 font-medium text-base sm:text-lg text-center">
          {message}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );

  if (!fullScreen) {
    return <div className="flex items-center justify-center py-10">{spinner}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm">
      {spinner}
    </div>
  );
};

export default Loader;