import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FilePlus2,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    icon: FilePlus2,
    title: "Report an Issue",
    description:
      "Submit local infrastructure problems with a clear description, location, and supporting photos.",
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: "Review & Verification",
    description:
      "Authorized staff review submitted reports and assess the information before taking action.",
  },
  {
    id: 3,
    icon: Clock3,
    title: "Track Progress",
    description:
      "Follow your report's status and review progress updates from your dashboard.",
  },
  {
    id: 4,
    icon: CheckCircle2,
    title: "Issue Resolved",
    description:
      "Check the final status when the responsible team marks the reported issue as resolved.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const HowItWorks = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="relative overflow-hidden bg-base-100 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.header
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-3xl text-center sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-primary"
            />
            Simple & Transparent
          </span>

          <h2
            id="how-it-works-heading"
            className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            How UrbanFix Works
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-base-content/65 sm:text-lg sm:leading-8">
            A straightforward process that helps citizens report community
            problems and follow their progress toward resolution.
          </p>
        </motion.header>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connector */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-9 hidden h-px bg-primary/20 xl:block"
          />

          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6"
          >
            {STEPS.map((step) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.id}
                  variants={shouldReduceMotion ? undefined : cardVariants}
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -5 }
                  }
                  className="group relative flex h-full flex-col rounded-2xl border border-base-300 bg-base-200/50 p-6 transition-colors duration-300 hover:border-primary/40 hover:bg-base-200 hover:shadow-xl hover:shadow-primary/5 sm:p-7"
                >
                  {/* Step number and icon */}
                  <div className="relative z-10 mb-7 flex items-center justify-between">
                    <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-primary/15 bg-base-100 text-primary shadow-sm transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
                      <Icon
                        size={29}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-base-100 text-sm font-bold text-primary">
                      {String(step.id).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug sm:text-xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-7 text-base-content/65 sm:text-base">
                    {step.description}
                  </p>

                  <div
                    aria-hidden="true"
                    className="mt-6 h-1 w-10 rounded-full bg-primary/30 transition-all duration-300 group-hover:w-16 group-hover:bg-primary"
                  />
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative mt-14 overflow-hidden rounded-3xl bg-primary text-primary-content sm:mt-20"
        >
          {/* Decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-primary-content/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-12 h-44 w-44 rounded-full border border-primary-content/10"
          />

          <div className="relative px-6 py-10 text-center sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-content/75">
              Be part of the change
            </span>

            <h3 className="mx-auto mt-4 max-w-2xl text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Every Report Can Make a Difference
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-primary-content/80 sm:text-base sm:leading-8">
              Help improve your neighborhood by reporting infrastructure
              problems and keeping track of the progress.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
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
                className="btn btn-outline min-h-12 rounded-xl border-primary-content/40 px-6 text-primary-content hover:border-primary-content hover:bg-primary-content/10 hover:text-primary-content"
              >
                Explore Issues
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;