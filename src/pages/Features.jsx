import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  ShieldCheck,
  BellRing,
  ChartNoAxesCombined,
  ArrowUpRight,
} from "lucide-react";

const FEATURES = [
  {
    id: "reporting",
    title: "Easy Issue Reporting",
    description:
      "Report potholes, damaged roads, broken streetlights, and drainage problems through a simple reporting process.",
    icon: MapPin,
    number: "01",
  },
  {
    id: "tracking",
    title: "Transparent Tracking",
    description:
      "Follow the progress of reported issues and understand their status from submission through resolution.",
    icon: ChartNoAxesCombined,
    number: "02",
  },
  {
    id: "security",
    title: "Secure & Accountable",
    description:
      "Authenticated accounts and role-based access help keep reports organized and administrative actions controlled.",
    icon: ShieldCheck,
    number: "03",
  },
  {
    id: "updates",
    title: "Progress Updates",
    description:
      "Check issue status and progress updates so you can stay informed as reports move through the process.",
    icon: BellRing,
    number: "04",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const Features = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="features-heading"
      className="relative overflow-hidden bg-base-100 py-16 sm:py-20 lg:py-24"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-primary"
            />
            Why UrbanFix
          </span>

          <h2
            id="features-heading"
            className="mt-5 text-3xl font-bold leading-tight tracking-tight text-base-content sm:text-4xl lg:text-5xl"
          >
            Better tools for{" "}
            <span className="text-primary">better communities.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-base-content/65 sm:text-lg sm:leading-8">
            From reporting local infrastructure problems to following their
            progress, UrbanFix helps citizens and authorities work toward
            cleaner, safer, and more connected communities.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.id}
                variants={shouldReduceMotion ? undefined : cardVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-200/50 p-6 transition-colors duration-300 hover:border-primary/40 hover:bg-base-200 hover:shadow-xl hover:shadow-primary/5 sm:p-7"
              >
                {/* Card number */}
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
                    <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <span className="text-sm font-semibold tracking-widest text-base-content/30">
                    {feature.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold leading-snug text-base-content sm:text-xl">
                  {feature.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-base-content/65 sm:text-base">
                  {feature.description}
                </p>

                {/* Decorative accent */}
                <div
                  aria-hidden="true"
                  className="mt-7 flex items-center justify-between border-t border-base-300 pt-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                    UrbanFix Platform
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="text-base-content/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Closing statement */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 text-center text-sm text-base-content/55 sm:mt-12"
        >
          Every report is a step toward a better neighborhood.
        </motion.p>
      </div>
    </section>
  );
};

export default Features;