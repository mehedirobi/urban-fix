import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  TriangleAlert,
  ArrowLeft,
  ArrowRight,
  House,
  Search,
  Compass,
} from "lucide-react";

const ErrorPage = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const animation = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.45,
            delay,
            ease: "easeOut",
          },
        };

  return (
    <main className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-base-100 px-4 py-16 text-base-content sm:px-6">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* Error illustration */}
        <motion.div
          {...(shouldReduceMotion
            ? {}
            : {
                initial: { opacity: 0, scale: 0.85, rotate: -8 },
                animate: { opacity: 1, scale: 1, rotate: 0 },
                transition: {
                  duration: 0.55,
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                },
              })}
          className="relative mx-auto mb-7 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-error/10 rotate-6" />
          <div className="absolute inset-2 rounded-[2rem] border border-error/20 bg-base-100/80 shadow-xl backdrop-blur-sm" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-error/10 text-error sm:h-24 sm:w-24">
            <TriangleAlert
              size={54}
              strokeWidth={1.6}
              aria-hidden="true"
              className="sm:hidden"
            />
            <TriangleAlert
              size={64}
              strokeWidth={1.6}
              aria-hidden="true"
              className="hidden sm:block"
            />
          </div>

          <span className="absolute -right-1 top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-base-100 bg-primary text-primary-content">
            <Search size={14} strokeWidth={2.5} />
          </span>
        </motion.div>

        {/* Error code */}
        <motion.p
          {...animation(0.1)}
          className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-primary"
        >
          Error 404
        </motion.p>

        <motion.h1
          {...animation(0.16)}
          className="text-6xl font-black leading-none tracking-tight sm:text-8xl"
        >
          4<span className="text-error">0</span>4
        </motion.h1>

        <motion.h2
          {...animation(0.22)}
          className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Looks like you're off the map.
        </motion.h2>

        <motion.p
          {...animation(0.28)}
          className="mx-auto mt-4 max-w-lg text-sm leading-7 text-base-content/65 sm:text-base"
        >
          The page you're looking for may have been moved, removed, or never
          existed. Let's get you back on the right path.
        </motion.p>

        {/* Actions */}
        <motion.div
          {...animation(0.35)}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/"
            className="btn btn-primary min-h-12 gap-2 rounded-xl px-6 shadow-lg shadow-primary/15 transition-transform hover:-translate-y-0.5"
          >
            <House size={18} />
            Back to Home
            <ArrowRight size={17} />
          </Link>

          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/", { replace: true });
              }
            }}
            className="btn btn-outline min-h-12 gap-2 rounded-xl px-6"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </motion.div>

        {/* Helpful link */}
        <motion.div
          {...animation(0.42)}
          className="mt-10 border-t border-base-300 pt-6"
        >
          <p className="flex items-center justify-center gap-2 text-sm text-base-content/55">
            <Compass size={16} />
            Looking for something specific?
          </p>

          <Link
            to="/all-issues"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Explore reported issues
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        <p className="mt-8 text-xs text-base-content/40">
          UrbanFix · Helping communities move forward
        </p>
      </div>
    </main>
  );
};

export default ErrorPage;