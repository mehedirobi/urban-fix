import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlinePause,
  HiOutlinePlay,
} from "react-icons/hi";

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2000&q=85",
    title: "Report Urban Issues Instantly",
    desc: "Help improve your city by reporting infrastructure and community issues in seconds.",
    alt: "Urban infrastructure and construction work",
  },
  {
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=85",
    title: "Track Progress Transparently",
    desc: "Stay informed with updates as community reports move from submission to resolution.",
    alt: "Workers improving urban infrastructure",
  },
  {
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=2000&q=85",
    title: "Collaborate for Better Communities",
    desc: "Bring citizens and authorities together to create cleaner, safer neighborhoods.",
    alt: "People collaborating on a community project",
  },
  {
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=85",
    title: "Building Smarter Cities Together",
    desc: "Support better urban management through community participation and accountability.",
    alt: "People working together on a project",
  },
];

const AUTOPLAY_DELAY = 6000;

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 36 : -36,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -36 : 36,
  }),
};

const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const Banner = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  const reducedMotion = useReducedMotion();
  const touchStartX = useRef(null);
  const totalSlides = SLIDES.length;

  const currentSlide = SLIDES[activeSlide];

  const goToSlide = useCallback(
    (nextIndex) => {
      const normalizedIndex =
        (nextIndex + totalSlides) % totalSlides;

      if (normalizedIndex === activeSlide) return;

      setDirection(normalizedIndex > activeSlide ? 1 : -1);
      setActiveSlide(normalizedIndex);
    },
    [activeSlide, totalSlides]
  );

  const goToNext = useCallback(() => {
    goToSlide(activeSlide + 1);
  }, [activeSlide, goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide(activeSlide - 1);
  }, [activeSlide, goToSlide]);

  // Automatically advance slides unless paused or reduced motion is enabled.
  useEffect(() => {
    if (isPaused || isManuallyPaused || reducedMotion) return undefined;

    const timer = window.setTimeout(() => {
      goToSlide(activeSlide + 1);
    }, AUTOPLAY_DELAY);

    return () => window.clearTimeout(timer);
  }, [
    activeSlide,
    goToSlide,
    isPaused,
    isManuallyPaused,
    reducedMotion,
  ]);

  // Preload the next image to reduce flicker during slide transitions.
  useEffect(() => {
    const nextSlide = SLIDES[(activeSlide + 1) % totalSlides];
    const image = new Image();

    image.src = nextSlide.img;
  }, [activeSlide, totalSlides]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    }
  };

  const handleBlurCapture = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false);
    }
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;

    if (Math.abs(distance) > 50) {
      if (distance < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
  };

  return (
    <section className="mx-auto mt-4 w-full max-w-7xl px-4 sm:mt-6 lg:px-6">
      <div
        className="relative isolate h-[420px] overflow-hidden rounded-2xl bg-slate-950 shadow-xl sm:h-[460px] sm:rounded-3xl md:h-[500px] lg:h-[520px]"
        role="region"
        aria-roledescription="carousel"
        aria-label="UrbanFix highlights"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={handleBlurCapture}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence
          initial={false}
          custom={direction}
          mode="sync"
        >
          <motion.div
            key={activeSlide}
            custom={direction}
            variants={reducedMotion ? undefined : slideVariants}
            initial={reducedMotion ? false : "enter"}
            animate="center"
            exit={reducedMotion ? undefined : "exit"}
            transition={{
              duration: reducedMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${activeSlide + 1} of ${totalSlides}: ${currentSlide.title}`}
          >
            <motion.img
              src={currentSlide.img}
              alt={currentSlide.alt}
              loading={activeSlide === 0 ? "eager" : "lazy"}
              fetchPriority={activeSlide === 0 ? "high" : "auto"}
              draggable="false"
              initial={false}
              animate={{
                scale: reducedMotion ? 1 : 1.06,
              }}
              transition={{
                duration: reducedMotion ? 0 : AUTOPLAY_DELAY / 1000 + 1,
                ease: "linear",
              }}
              className="h-full w-full select-none object-cover object-center"
            />

            {/* Image overlays for readable text */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/10" />

            {/* Slide content */}
            <div className="absolute inset-0 flex items-center px-6 pb-12 pt-8 sm:px-12 md:px-16 lg:px-20">
              <motion.div
                variants={reducedMotion ? undefined : contentVariants}
                initial={reducedMotion ? false : "hidden"}
                animate="visible"
                className="w-full max-w-3xl text-left text-white"
              >
                <motion.div
                  variants={reducedMotion ? undefined : itemVariants}
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-md sm:text-sm"
                >
                  <span
                    className="h-2 w-2 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  Smart Urban Management
                </motion.div>

                <motion.h1
                  variants={reducedMotion ? undefined : itemVariants}
                  className="mb-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
                >
                  {currentSlide.title}
                </motion.h1>

                <motion.p
                  variants={reducedMotion ? undefined : itemVariants}
                  className="mb-7 max-w-xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7 md:text-lg"
                >
                  {currentSlide.desc}
                </motion.p>

                <motion.div
                  variants={reducedMotion ? undefined : itemVariants}
                  className="flex flex-wrap items-center gap-3"
                >
                  <Link
                    to="/create-issue"
                    className="btn btn-primary min-h-11 rounded-full px-6 text-sm font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-7 sm:text-base"
                  >
                    Report an Issue
                  </Link>

                  <Link
                    to="/all-issues"
                    className="btn min-h-11 rounded-full border border-white/50 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-white hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-7 sm:text-base"
                  >
                    Explore Issues
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous and next controls */}
        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/30 text-white shadow-md backdrop-blur-md transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex md:left-5"
        >
          <HiChevronLeft size={25} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/30 text-white shadow-md backdrop-blur-md transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex md:right-5"
        >
          <HiChevronRight size={25} aria-hidden="true" />
        </button>

        {/* Slide indicators and autoplay control */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 sm:bottom-5">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 px-3 py-2 backdrop-blur-md">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                aria-current={index === activeSlide ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  index === activeSlide
                    ? "w-7 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setIsManuallyPaused((previous) => !previous)}
              aria-label={
                isManuallyPaused
                  ? "Resume automatic slide rotation"
                  : "Pause automatic slide rotation"
              }
              aria-pressed={isManuallyPaused}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/35 text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {isManuallyPaused ? (
                <HiOutlinePlay size={17} aria-hidden="true" />
              ) : (
                <HiOutlinePause size={17} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Banner;