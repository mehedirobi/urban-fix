import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaTools } from "react-icons/fa";

const SIZE_MAP = {
  sm: {
    wrapper: "h-10 w-10",
    ring: "border-[2px]",
    icon: "h-4 w-4",
  },
  md: {
    wrapper: "h-14 w-14",
    ring: "border-[3px]",
    icon: "h-5 w-5",
  },
  lg: {
    wrapper: "h-[4.5rem] w-[4.5rem]",
    ring: "border-4",
    icon: "h-6 w-6",
  },
  xl: {
    wrapper: "h-20 w-20",
    ring: "border-4",
    icon: "h-7 w-7",
  },
};

const COLOR_MAP = {
  blue: "border-t-blue-500 text-blue-500",
  red: "border-t-red-500 text-red-500",
  green: "border-t-green-500 text-green-500",
  gray: "border-t-gray-500 text-gray-500",
  primary: "border-t-primary text-primary",
};

const Loader = ({
  message = "Loading data...",
  size = "md",
  color = "primary",
  fullScreen = true,
  showIcon = true,
  className = "",
}) => {
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const colorConfig = COLOR_MAP[color] || COLOR_MAP.primary;

  const [ringColor, iconColor] = colorConfig.split(" text-");

  const ringClass = `${ringColor} ${
    sizeConfig.ring
  } border-base-content/10`;

  const loaderContent = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {/* Animated loader */}
      <div
        className={`relative flex ${sizeConfig.wrapper} items-center justify-center`}
        aria-hidden="true"
      >
        {/* Soft background glow */}
        <div className="absolute inset-1 rounded-full bg-primary/10 blur-md" />

        {/* Rotating outer ring */}
        <motion.div
          className={`absolute inset-0 rounded-full ${ringClass}`}
          animate={
            prefersReducedMotion ? undefined : { rotate: 360 }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 1.1,
                  ease: "linear",
                  repeat: Infinity,
                }
          }
        />

        {/* Center icon */}
        {showIcon && (
          <motion.div
            className={`relative z-10 flex items-center justify-center ${iconColor}`}
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.08, 1] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            <FaTools className={sizeConfig.icon} />
          </motion.div>
        )}
      </div>

      {/* Loading text */}
      {message ? (
        <div className="mt-5 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-semibold tracking-wide text-base-content sm:text-base">
            {message}
          </p>

          {!prefersReducedMotion && (
            <motion.div
              className="flex items-center gap-1"
              aria-hidden="true"
            >
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.85, 1, 0.85],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: dot * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="flex min-h-32 w-full items-center justify-center py-8">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-base-100/85 px-4 backdrop-blur-md">
      <div className="rounded-3xl border border-base-content/5 bg-base-100/70 px-8 py-8 shadow-xl shadow-base-content/5 sm:px-12 sm:py-10">
        {loaderContent}
      </div>
    </div>
  );
};

export default Loader;