import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2000&q=80",
    title: "Report Urban Issues Instantly",
    desc: "Help improve your city by reporting infrastructure and community issues in seconds.",
  },
  {
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80",
    title: "Track Progress Transparently",
    desc: "Stay informed with real-time updates from report submission to resolution.",
  },
  {
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=2000&q=80",
    title: "Collaborate for Better Communities",
    desc: "Citizens and authorities working together to create cleaner and safer neighborhoods.",
  },
  {
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80",
    title: "Building Smarter Cities Together",
    desc: "Technology-driven solutions for efficient urban management and maintenance.",
  },
];

const AUTOPLAY_MS = 6000;

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideVariants = {
  enter: (direction) => ({ opacity: 0, x: direction >= 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction >= 0 ? -60 : 60 }),
};

const Banner = () => {
  const [[index, direction], setSlide] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const timeoutRef = useRef(null);
  const total = slides.length;

  const goTo = useCallback((newIndex, dir) => {
    setSlide([(newIndex + total) % total, dir]);
  }, [total]);

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // Autoplay
  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    timeoutRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused, prefersReducedMotion, next]);

  // Preload the next image so transitions don't flash
  useEffect(() => {
    const img = new Image();
    img.src = slides[(index + 1) % total].img;
  }, [index, total]);

  const slide = slides[index];

  return (
    <section
      className="relative max-w-7xl mx-auto px-4 lg:px-0 mt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl h-[360px] sm:h-[420px] md:h-[480px]"
        role="region"
        aria-roledescription="carousel"
        aria-label="UrbanFix highlights"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${total}: ${slide.title}`}
          >
            <motion.img
              src={slide.img}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              initial={{ scale: 1 }}
              animate={{ scale: prefersReducedMotion ? 1 : 1.08 }}
              transition={{ duration: AUTOPLAY_MS / 1000 + 1, ease: "linear" }}
              className="h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/55 to-slate-900/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="max-w-3xl px-6 md:px-16 text-left text-white"
              >
                <motion.div
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm"
                >
                  Smart Urban Management
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight mb-3"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-sm sm:text-base md:text-lg text-gray-200 mb-5 max-w-xl"
                >
                  {slide.desc}
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-wrap gap-3 sm:gap-4 mb-6">
                  <Link
                    to="/create-issue"
                    className="btn btn-sm sm:btn-md btn-primary rounded-full px-6 sm:px-8 hover:scale-105 active:scale-95 transition-transform"
                  >
                    Report Issue
                  </Link>
                  <Link
                    to="/all-issues"
                    className="btn btn-sm sm:btn-md rounded-full px-6 sm:px-8 border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-colors"
                  >
                    Explore Issues
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="hidden sm:flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">10K+</h3>
                    <p className="text-xs sm:text-sm text-gray-300">Issues Reported</p>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">95%</h3>
                    <p className="text-xs sm:text-sm text-gray-300">Resolution Rate</p>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">50+</h3>
                    <p className="text-xs sm:text-sm text-gray-300">Communities</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition"
        >
          <HiChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition"
        >
          <HiChevronRight size={20} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => goTo(i, i > index ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;