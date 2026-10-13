import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wrench,
  ShieldCheck,
  Users,
  Building2,
  Globe2,
  ArrowRight,
  Camera,
  ClipboardCheck,
  HardHat,
  Activity,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Simple Issue Reporting",
    description:
      "Report potholes, damaged roads, drainage problems, and other public infrastructure issues with photos and location details.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Tracking",
    description:
      "Follow issue progress through status updates and a clear reporting workflow.",
  },
  {
    icon: Users,
    title: "Community Participation",
    description:
      "Give citizens a practical way to raise concerns, support reports, and contribute to better neighborhoods.",
  },
  {
    icon: Building2,
    title: "Organized Management",
    description:
      "Help administrators and maintenance teams review reports, prioritize problems, and coordinate responses.",
  },
];

const steps = [
  {
    title: "Report an issue",
    description:
      "Submit a description, photos, category, and location to explain the problem.",
    icon: Camera,
  },
  {
    title: "Review and verification",
    description:
      "The responsible team reviews the submitted report and verifies its details.",
    icon: ClipboardCheck,
  },
  {
    title: "Coordinate action",
    description:
      "Administrators and assigned staff manage the issue and work toward a resolution.",
    icon: HardHat,
  },
  {
    title: "Track progress",
    description:
      "Citizens can revisit the report and follow its status as it progresses.",
    icon: Activity,
  },
];

const highlights = [
  {
    icon: Wrench,
    title: "Practical solutions",
    description:
      "Turn everyday infrastructure concerns into organized, actionable reports.",
  },
  {
    icon: Globe2,
    title: "Better communities",
    description:
      "Encourage collaboration toward cleaner, safer, and more accessible public spaces.",
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

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
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

const Reveal = memo(function Reveal({
  children,
  className = "",
  reducedMotion,
  delay = 0,
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

const SectionHeading = memo(function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {eyebrow && (
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </span>
      )}

      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-base-content/70 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
});

const FeatureCard = memo(function FeatureCard({
  feature,
  reducedMotion,
}) {
  const Icon = feature.icon;

  return (
    <motion.article
      variants={reducedMotion ? undefined : itemVariants}
      whileHover={reducedMotion ? undefined : { y: -5 }}
      className="group h-full rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:p-7"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
        <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold sm:text-xl">{feature.title}</h3>

      <p className="mt-3 leading-7 text-base-content/70">
        {feature.description}
      </p>
    </motion.article>
  );
});

const StepCard = memo(function StepCard({ step, index, reducedMotion }) {
  const Icon = step.icon;

  return (
    <motion.li
      variants={reducedMotion ? undefined : itemVariants}
      className="relative flex gap-4 sm:gap-5"
    >
      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-sm">
        <Icon size={22} aria-hidden="true" />
      </div>

      <div className="flex-1 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Step {index + 1}
        </span>

        <h3 className="mt-2 text-lg font-bold">{step.title}</h3>

        <p className="mt-2 leading-7 text-base-content/70">
          {step.description}
        </p>
      </div>
    </motion.li>
  );
});

const AboutUs = () => {
  const reducedMotion = useReducedMotion();

  return (
    <main className="overflow-hidden bg-base-100 text-base-content">
      {/* Hero */}
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(var(--p)/0.12),transparent_65%)]"
        />

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <Reveal
            reducedMotion={reducedMotion}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="badge badge-primary badge-outline mb-6 px-4 py-3 font-semibold">
              About UrbanFix
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Building better cities
              <span className="mt-2 block text-primary">
                through collective action.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-base-content/70 sm:text-lg md:text-xl">
              UrbanFix connects citizens, administrators, and maintenance
              teams through a more organized approach to reporting, tracking,
              and managing public infrastructure issues.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/create-issue"
                className="btn btn-primary min-h-12 rounded-full px-7"
              >
                Report an Issue
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link
                to="/all-issues"
                className="btn btn-outline min-h-12 rounded-full px-7"
              >
                Explore Issues
              </Link>
            </div>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {[
              {
                value: "Report",
                label: "Document infrastructure problems",
              },
              {
                value: "Track",
                label: "Follow issue status and progress",
              },
              {
                value: "Improve",
                label: "Support better community outcomes",
              },
            ].map((item, index) => (
              <Reveal
                key={item.value}
                reducedMotion={reducedMotion}
                delay={index * 0.08}
                className="rounded-2xl border border-base-300 bg-base-100/80 p-5 text-center shadow-sm backdrop-blur-sm sm:p-6"
              >
                <p className="text-2xl font-bold text-primary sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  {item.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <SectionHeading
          eyebrow="Why UrbanFix"
          title="A clearer path from reporting to resolution"
          description="A practical platform designed to make public infrastructure reporting more accessible, organized, and transparent."
        />

        <motion.div
          variants={reducedMotion ? undefined : containerVariants}
          initial={reducedMotion ? false : "hidden"}
          whileInView={reducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.12 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section
        aria-labelledby="workflow-heading"
        className="bg-base-200/70"
      >
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            eyebrow="The process"
            title="How UrbanFix works"
            description="A straightforward workflow helps turn reported problems into trackable tasks."
          />

          <motion.ol
            variants={reducedMotion ? undefined : containerVariants}
            initial={reducedMotion ? false : "hidden"}
            whileInView={reducedMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.1 }}
            className="relative space-y-5"
          >
            <div
              aria-hidden="true"
              className="absolute bottom-8 left-6 top-8 hidden w-px bg-base-300 sm:block"
            />

            {steps.map((step, index) => (
              <StepCard
                key={step.title}
                step={step}
                index={index}
                reducedMotion={reducedMotion}
              />
            ))}
          </motion.ol>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal reducedMotion={reducedMotion}>
            <article className="h-full rounded-3xl bg-primary p-7 text-primary-content sm:p-10">
              <span className="text-sm font-semibold uppercase tracking-widest opacity-80">
                Our mission
              </span>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Make civic reporting more effective.
              </h2>

              <p className="mt-5 leading-8 opacity-90">
                Our mission is to give communities a structured way to report
                public infrastructure concerns, help teams manage them, and
                make progress easier to follow.
              </p>
            </article>
          </Reveal>

          <Reveal reducedMotion={reducedMotion} delay={0.08}>
            <article className="h-full rounded-3xl border border-base-300 bg-base-200/70 p-7 sm:p-10">
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                Our vision
              </span>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Stronger communities through collaboration.
              </h2>

              <p className="mt-5 leading-8 text-base-content/70">
                We envision communities where citizens can raise concerns
                confidently and responsible teams can coordinate infrastructure
                improvements through accessible technology.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* Impact highlights */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <SectionHeading
          eyebrow="Our approach"
          title="Technology with a community purpose"
          description="UrbanFix focuses on the practical steps that help communities communicate problems and organize responses."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal
                key={item.title}
                reducedMotion={reducedMotion}
                delay={index * 0.08}
              >
                <article className="flex h-full gap-5 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={24} aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 leading-7 text-base-content/70">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <Reveal reducedMotion={reducedMotion}>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-content sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[40px] border-primary-content/10"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-12 h-52 w-52 rounded-full border-[30px] border-primary-content/10"
            />

            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Help make your community better.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 opacity-90 sm:text-lg">
                Every well-documented report can help bring attention to an
                infrastructure problem. Start by reporting an issue or
                exploring what your community has raised.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/create-issue"
                  className="btn btn-neutral rounded-full px-7"
                >
                  Report an Issue
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>

                <Link
                  to="/all-issues"
                  className="btn btn-outline rounded-full border-primary-content px-7 text-primary-content hover:border-primary-content hover:bg-primary-content hover:text-primary"
                >
                  Browse All Issues
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
};

export default AboutUs;