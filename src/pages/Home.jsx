import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FilePlus2, Search } from "lucide-react";

import Banner from "./Banner";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import LatestResolvedIssues from "./LatestResolvedIssues";
import WhyChooseUs from "./WhyChooseUs";
import VisionMission from "./VisionMission";

const Home = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="overflow-hidden bg-base-100 text-base-content">
      {/* Hero */}
      <Banner />

      {/* Latest resolved issues */}
      <section
        aria-label="Latest resolved issues"
        className="py-14 sm:py-18 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LatestResolvedIssues />
        </div>
      </section>

      {/* Platform features */}
      <section aria-label="UrbanFix features" className="bg-base-200/60">
        <Features />
      </section>

      {/* How it works */}
      <section
        aria-label="How UrbanFix works"
        className="py-14 sm:py-18 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HowItWorks />
        </div>
      </section>

      {/* Why choose UrbanFix */}
      <section
        aria-label="Why choose UrbanFix"
        className="border-y border-base-300/70 bg-base-200/60 py-14 sm:py-18 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <WhyChooseUs />
        </div>
      </section>

      {/* Vision and mission */}
      <section
        aria-label="Our vision and mission"
        className="py-14 sm:py-18 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <VisionMission />
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-4 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary text-primary-content shadow-xl shadow-primary/10"
        >
          {/* Decorative shapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-primary-content/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-primary-content/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-primary-content/5 blur-2xl"
          />

          <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_auto] lg:px-16 lg:py-20">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-content/20 bg-primary-content/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-primary-content"
                />
                Make a difference locally
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Help Build a Better City
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-primary-content/80 sm:text-base sm:leading-8 lg:mx-0">
                Every reported problem is an opportunity to improve your
                community. Report local infrastructure issues, follow their
                progress, and help make neighborhoods safer and cleaner.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:min-w-52 lg:flex-col">
              <Link
                to="/create-issue"
                className="btn btn-neutral min-h-12 gap-2 rounded-xl px-6"
              >
                <FilePlus2 size={18} />
                Report an Issue
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/all-issues"
                className="btn btn-outline min-h-12 gap-2 rounded-xl border-primary-content/40 px-6 text-primary-content hover:border-primary-content hover:bg-primary-content/10 hover:text-primary-content"
              >
                <Search size={18} />
                Explore Issues
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Home;