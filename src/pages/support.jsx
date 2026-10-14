import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Clock3,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const faqs = [
  {
    question: "How do I report an issue?",
    answer:
      "Open the Report Issue page, describe the problem, select its category and location, attach a photo if available, and submit your report.",
  },
  {
    question: "Can I edit an issue after submitting it?",
    answer:
      "You can review your submissions in My Issues. Editing availability depends on the issue's current status and the permissions configured for your account.",
  },
  {
    question: "How long does it take to resolve an issue?",
    answer:
      "Resolution time depends on the issue type, location, priority, and the responsible team's capacity. Check your issue details for the latest recorded status.",
  },
  {
    question: "How can I track an issue?",
    answer:
      "Open your dashboard and visit My Issues to review your submitted reports and any status or timeline updates available for them.",
  },
  {
    question: "Who should I contact about an urgent issue?",
    answer:
      "For immediate threats to life or public safety, contact the appropriate local emergency service first. You can also report the underlying civic issue through UrbanFix when it is safe to do so.",
  },
  {
    question: "What should I do if I cannot access my account?",
    answer:
      "Check that you are using the correct email address and try signing in again. If the problem continues, use the Contact Support page to describe the issue without sharing your password.",
  },
];

const supportOptions = [
  {
    icon: MessageCircle,
    title: "Contact support",
    description:
      "Send us your question or describe a problem you're experiencing.",
    linkText: "Contact our team",
    to: "/contact",
  },
  {
    icon: Mail,
    title: "Email support",
    description:
      "Email support is available if the address below is configured for your project.",
    linkText: "support@urbanfix.com",
    href: "mailto:support@urbanfix.com",
  },
  {
    icon: UserRound,
    title: "Account assistance",
    description:
      "Find your submitted reports and review their available status information.",
    linkText: "Open dashboard",
    to: "/dashboard",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const Support = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const id = useId();

  const revealProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.4, ease: "easeOut" },
      };

  const toggleFaq = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <main className="min-h-screen overflow-hidden bg-base-100 text-base-content">
      {/* Hero */}
      <section className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:pt-20">
        <motion.div
          {...(reducedMotion
            ? {}
            : {
                initial: { opacity: 0, y: 18 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.45 },
              })}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary text-primary-content"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[40px] border-white/10 sm:h-96 sm:w-96"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 -left-20 h-72 w-72 rounded-full border-[36px] border-white/10"
          />

          <div className="relative mx-auto max-w-3xl px-6 py-12 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10">
              <LifeBuoy size={34} strokeWidth={1.7} />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-content/70 sm:text-sm">
              UrbanFix help center
            </p>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              How can we help you?
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-primary-content/80 sm:text-base lg:text-lg">
              Find answers about reporting civic issues, managing your reports,
              and tracking progress in your community.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="btn min-h-12 gap-2 rounded-xl border-0 bg-base-100 px-6 text-primary hover:bg-base-200"
              >
                <MessageCircle size={18} />
                Contact support
              </Link>

              <Link
                to="/all-issues"
                className="btn min-h-12 gap-2 rounded-xl border border-white/25 bg-white/10 px-6 text-primary-content hover:bg-white/20"
              >
                Browse issues
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Support options */}
      <section
        className="px-4 py-8 sm:px-6 sm:py-12"
        aria-labelledby="support-options-title"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div {...revealProps} className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">
              Get assistance
            </p>
            <h2
              id="support-options-title"
              className="text-2xl font-extrabold tracking-tight sm:text-3xl"
            >
              Support options
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60 sm:text-base">
              Choose the option that best matches what you need help with.
            </p>
          </motion.div>

          <motion.div
            variants={reducedMotion ? undefined : containerVariants}
            initial={reducedMotion ? false : "hidden"}
            whileInView={reducedMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {supportOptions.map((option) => {
              const Icon = option.icon;

              const content = (
                <div className="flex h-full flex-col">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>

                  <h3 className="text-lg font-bold">{option.title}</h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-base-content/60">
                    {option.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    {option.linkText}
                    <ArrowRight size={16} />
                  </span>
                </div>
              );

              const className =
                "group h-full rounded-2xl border border-base-300/80 bg-base-100 p-6 transition-colors hover:border-primary/40 hover:bg-base-200/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

              return (
                <motion.div
                  key={option.title}
                  variants={reducedMotion ? undefined : itemVariants}
                  className="h-full"
                >
                  {option.href ? (
                    <a
                      href={option.href}
                      className={className + " block"}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link to={option.to} className={className + " block"}>
                      {content}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="px-4 py-14 sm:px-6 sm:py-20"
        aria-labelledby="faq-title"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <motion.div {...revealProps} className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CircleHelp size={25} />
            </div>

            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">
              Frequently asked questions
            </p>

            <h2
              id="faq-title"
              className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
            >
              Quick answers to common questions.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-base-content/60 sm:text-base">
              Learn how to use UrbanFix and what to expect when submitting and
              following civic issue reports.
            </p>

            <div className="mt-7 rounded-2xl border border-base-300 bg-base-200/50 p-5">
              <div className="flex items-start gap-3">
                <MessageCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-primary"
                />
                <div>
                  <h3 className="font-bold">Didn't find your answer?</h3>
                  <p className="mt-1 text-sm leading-6 text-base-content/60">
                    Contact our team with your question.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    Get in touch
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={reducedMotion ? undefined : containerVariants}
            initial={reducedMotion ? false : "hidden"}
            whileInView={reducedMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.08 }}
            className="space-y-3"
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const buttonId = `${id}-faq-button-${index}`;
              const panelId = `${id}-faq-panel-${index}`;

              return (
                <motion.div
                  key={faq.question}
                  variants={reducedMotion ? undefined : itemVariants}
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    isOpen
                      ? "border-primary/35 bg-base-200/50"
                      : "border-base-300 bg-base-100"
                  }`}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary sm:px-6"
                    >
                      <span className="text-sm font-bold leading-6 sm:text-base">
                        {faq.question}
                      </span>

                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                          isOpen
                            ? "bg-primary text-primary-content"
                            : "bg-base-200 text-base-content/60"
                        }`}
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                  >
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="mb-3 h-px bg-base-300" />
                      <p className="text-sm leading-7 text-base-content/65 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Emergency notice */}
      <section className="px-4 pb-12 sm:px-6 sm:pb-16">
        <motion.div
          {...revealProps}
          className="mx-auto max-w-7xl rounded-2xl border border-error/20 bg-error/5 p-5 sm:p-7"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-error/10 text-error">
              <ShieldAlert size={24} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold sm:text-xl">
                Emergency or immediate safety concern?
              </h2>

              <p className="mt-2 text-sm leading-7 text-base-content/70 sm:text-base">
                For fires, medical emergencies, gas leaks, or immediate threats
                to public safety, contact the appropriate local emergency
                services first. Do not rely on UrbanFix as an emergency
                response service.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <motion.div
          {...revealProps}
          className="mx-auto max-w-7xl rounded-3xl border border-base-300 bg-base-200/50 px-6 py-10 text-center sm:px-10 sm:py-14"
        >
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LifeBuoy size={25} />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Still need help?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-base-content/60 sm:text-base">
            If your question isn't covered above, send us a message through our
            contact page.
          </p>

          <Link
            to="/contact"
            className="btn btn-primary mt-7 min-h-12 gap-2 rounded-xl px-6"
          >
            Contact support
            <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default Support;