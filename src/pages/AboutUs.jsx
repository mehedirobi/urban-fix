import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wrench,
  Shield,
  Users,
  Building2,
  Globe,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Easy Reporting",
    desc: "Submit infrastructure issues with photos, location, and detailed descriptions in seconds.",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    desc: "Every report and resolution process is monitored to ensure transparency and accountability.",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "Citizens actively contribute to building cleaner, safer, and smarter cities.",
  },
  {
    icon: Building2,
    title: "City-Wide Coverage",
    desc: "Supporting urban infrastructure maintenance across multiple communities.",
  },
];

const steps = [
  "Citizens submit reports with photos, location, and issue details.",
  "Administrators review and verify the submitted issue.",
  "Maintenance teams are assigned to resolve the problem.",
  "Citizens track progress through real-time updates.",
];

const stats = [
  { value: 10000, suffix: "+", label: "Issues Reported" },
  { value: 95, suffix: "%", label: "Resolution Rate" },
  { value: 1000, suffix: "+", label: "Active Citizens" },
  { value: 64, suffix: "+", label: "Coverage Areas" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Small self-contained count-up, fires once when scrolled into view
const CountUpStat = ({ value, suffix, label }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    const duration = 1200;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, prefersReducedMotion]);

  const formatted = value >= 1000 ? `${Math.round(display / 1000)}K` : display;

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className="bg-base-200 rounded-3xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-primary tabular-nums">
        {formatted}
        {suffix}
      </h2>
      <p className="mt-3 opacity-70">{label}</p>
    </motion.div>
  );
};

const AboutUs = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="bg-base-100">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge badge-primary badge-lg mb-6">About UrbanFix</span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight">
              Building Better Cities
              <span className="block text-primary">Through Technology</span>
            </h1>

            <p className="max-w-3xl mx-auto mt-6 text-base sm:text-lg md:text-xl opacity-80">
              UrbanFix empowers citizens and authorities to work together in identifying,
              tracking, and resolving public infrastructure issues faster and more
              transparently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <motion.section
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto px-6 pb-20"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <CountUpStat key={stat.label} {...stat} />
          ))}
        </div>
      </motion.section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Why People Choose UrbanFix</h2>
          <p className="mt-4 opacity-70 max-w-2xl mx-auto">
            Designed to simplify urban issue reporting and ensure transparency throughout
            the resolution process.
          </p>
        </motion.div>

        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                className="bg-base-100 border border-base-300 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="opacity-70 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-base-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold">How UrbanFix Works</h2>
          </motion.div>

          <motion.div
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="relative space-y-8"
          >
            {/* Connecting line — steps are a real sequence, so this earns its place */}
            <div
              aria-hidden="true"
              className="absolute left-6 top-6 bottom-6 w-px bg-base-300 hidden sm:block"
            />

            {steps.map((step, index) => (
              <motion.div key={step} variants={itemVariants} className="relative flex gap-5 items-start">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold shrink-0 relative z-10">
                  {index + 1}
                </div>
                <div className="bg-base-100 rounded-2xl p-5 shadow-sm flex-1">{step}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <motion.section
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-20"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-primary text-primary-content rounded-3xl p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-5">Our Mission</h2>
            <p className="leading-relaxed opacity-90">
              To transform urban infrastructure management through transparency,
              efficiency, and citizen engagement, making communities cleaner, safer, and
              better connected.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-base-200 rounded-3xl p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-5 text-primary">Our Vision</h2>
            <p className="leading-relaxed opacity-80">
              A future where every urban issue is reported, tracked, and resolved
              seamlessly through technology-driven collaboration between citizens and
              local authorities.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* IMPACT */}
      <motion.section
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto px-6 pb-20"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-base-200 rounded-3xl p-8 text-center">
            <Globe className="w-14 h-14 text-primary mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Expanding Coverage</h3>
            <p className="opacity-70">
              Helping communities identify and resolve public infrastructure issues more
              efficiently.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-base-200 rounded-3xl p-8 text-center">
            <Users className="w-14 h-14 text-primary mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Growing Community</h3>
            <p className="opacity-70">
              Thousands of citizens participate in creating cleaner and safer urban
              environments.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="px-6 pb-24"
      >
        <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-10 md:p-12 text-center text-primary-content">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">Join The Movement</h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            Be part of a smarter city. Report issues, track progress, and help improve
            your community today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/create-issue"
              className="btn btn-neutral rounded-full hover:scale-[1.03] active:scale-95 transition-transform"
            >
              Report an Issue
            </Link>

            <Link
              to="/all-issues"
              className="btn btn-outline border-primary-content text-primary-content rounded-full hover:bg-primary-content hover:text-primary hover:scale-[1.03] active:scale-95 transition-all"
            >
              Explore Issues
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;