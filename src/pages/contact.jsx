import { memo, useCallback, useState } from "react";
import Swal from "sweetalert2";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ArrowUpRight,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const SUPPORT_EMAIL = "support@urbanfix.com";
const SUPPORT_PHONE = "+8801336458100";
const MESSAGE_MAX_LENGTH = 1000;
const NAME_MAX_LENGTH = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const INITIAL_FORM = {
  name: "",
  email: "",
  message: "",
};

const contactCards = [
  {
    icon: Mail,
    label: "Email Support",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    description: "Contact us by email",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: SUPPORT_PHONE,
    href: `tel:${SUPPORT_PHONE}`,
    description: "Reach our support line",
  },
  {
    icon: MapPin,
    label: "Our Location",
    value: "Dhaka, Bangladesh",
    description: "Based in Dhaka",
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 Hours",
    description: "Expected response time",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const validateForm = (form) => {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (
    email.length > 254 ||
    !EMAIL_REGEX.test(email)
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (!message) {
    errors.message = "Please write a message.";
  } else if (message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Your message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
};

const SectionHeading = memo(function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow && (
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </span>
      )}

      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 leading-7 text-base-content/65">
          {description}
        </p>
      )}
    </div>
  );
});

const ContactCard = memo(function ContactCard({
  item,
  reducedMotion,
}) {
  const Icon = item.icon;
  const Wrapper = item.href ? "a" : "div";

  return (
    <motion.div
      variants={reducedMotion ? undefined : itemVariants}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      className="h-full"
    >
      <Wrapper
        {...(item.href
          ? {
              href: item.href,
              "aria-label": `${item.label}: ${item.value}`,
            }
          : {})}
        className={`flex h-full flex-col items-center rounded-2xl border border-base-300 bg-base-100 p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-md ${
          item.href
            ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            : ""
        }`}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
        </div>

        <h3 className="font-bold">{item.label}</h3>

        <p className="mt-2 break-words text-sm font-medium text-base-content/80">
          {item.value}
        </p>

        <p className="mt-2 text-xs leading-5 text-base-content/50">
          {item.description}
        </p>

        {item.href && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Contact us
            <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        )}
      </Wrapper>
    </motion.div>
  );
});

const Contact = () => {
  const reducedMotion = useReducedMotion();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => {
      if (!previous[name]) return previous;

      const next = { ...previous };
      delete next[name];

      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setAttemptedSubmit(true);

      const validationErrors = validateForm(form);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        const firstInvalidField = Object.keys(validationErrors)[0];

        document
          .getElementById(firstInvalidField)
          ?.focus();

        return;
      }

      const name = form.name.trim();
      const email = form.email.trim();
      const message = form.message.trim();

      const subject = encodeURIComponent(
        `UrbanFix support request from ${name}`,
      );

      const body = encodeURIComponent(
        [
          "Hello UrbanFix Support,",
          "",
          "I would like to contact your team regarding the following:",
          "",
          message,
          "",
          "Contact details:",
          `Name: ${name}`,
          `Email: ${email}`,
        ].join("\n"),
      );

      const mailtoUrl =
        `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

      try {
        await Swal.fire({
          icon: "info",
          title: "Open your email app",
          text: "UrbanFix will prepare an email draft. Review it and press Send in your email app to submit your message.",
          confirmButtonText: "Continue to email",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonColor: "#087f5b",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = mailtoUrl;
          }
        });
      } catch (error) {
        console.error("Unable to prepare email draft:", error);

        await Swal.fire({
          icon: "error",
          title: "Unable to open email",
          text: `Please email ${SUPPORT_EMAIL} directly.`,
          confirmButtonColor: "#087f5b",
        });
      }
    },
    [form],
  );

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setAttemptedSubmit(false);
  }, []);

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      {/* Hero */}
      <section className="px-5 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-content sm:px-12 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-primary-content/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-10 h-60 w-60 rounded-full border-[32px] border-primary-content/10"
          />

          <div className="relative z-10">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-content/25 bg-primary-content/10 px-4 py-2 text-sm font-medium">
              <MessageCircle size={16} aria-hidden="true" />
              Contact UrbanFix
            </span>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl">
              Let's talk.
              <span className="mt-2 block opacity-80">
                We're here to help.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-primary-content/80 sm:text-lg sm:leading-8">
              Have a question, suggestion, or need help with an issue? Get in
              touch with the UrbanFix team.
            </p>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="btn btn-neutral mt-8 rounded-full px-7"
            >
              Email Our Team
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Contact information */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8">
        <SectionHeading
          eyebrow="Get in touch"
          title="Choose how to reach us"
          description="Find the appropriate contact details and choose the option that works best for you."
        />

        <motion.div
          variants={reducedMotion ? undefined : containerVariants}
          initial={reducedMotion ? false : "hidden"}
          whileInView={reducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {contactCards.map((item) => (
            <ContactCard
              key={item.label}
              item={item}
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>
      </section>

      {/* Contact form and support details */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-stretch gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Form */}
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, x: -16 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45 }}
            aria-labelledby="contact-form-heading"
            className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8 lg:col-span-3"
          >
            <div className="mb-7">
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                Send an inquiry
              </span>

              <h2
                id="contact-form-heading"
                className="mt-2 text-2xl font-bold sm:text-3xl"
              >
                Send us a message
              </h2>

              <p className="mt-3 text-sm leading-6 text-base-content/60">
                Complete the form below to prepare an email to our support
                address.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={NAME_MAX_LENGTH}
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`input input-bordered w-full bg-base-100 ${
                    errors.name ? "input-error" : ""
                  }`}
                />

                {errors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="mt-1.5 text-sm text-error"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={254}
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`input input-bordered w-full bg-base-100 ${
                    errors.email ? "input-error" : ""
                  }`}
                />

                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1.5 text-sm text-error"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={handleChange}
                  maxLength={MESSAGE_MAX_LENGTH}
                  required
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message
                      ? "message-error message-count"
                      : "message-count"
                  }
                  className={`textarea textarea-bordered w-full resize-y bg-base-100 leading-7 ${
                    errors.message ? "textarea-error" : ""
                  }`}
                />

                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {errors.message ? (
                    <p
                      id="message-error"
                      role="alert"
                      className="text-sm text-error"
                    >
                      {errors.message}
                    </p>
                  ) : (
                    <span className="text-xs text-base-content/50">
                      Please do not include passwords or sensitive account
                      information.
                    </span>
                  )}

                  <span
                    id="message-count"
                    className={`shrink-0 text-xs ${
                      form.message.length >= MESSAGE_MAX_LENGTH
                        ? "text-error"
                        : "text-base-content/50"
                    }`}
                    aria-live="polite"
                  >
                    {form.message.length}/{MESSAGE_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary min-h-12 w-full gap-2 rounded-xl"
              >
                <Send size={18} aria-hidden="true" />
                Prepare Email
              </button>

              {attemptedSubmit && Object.keys(errors).length > 0 && (
                <p role="status" className="text-sm text-error">
                  Please correct the highlighted fields before continuing.
                </p>
              )}

              <p className="text-center text-xs leading-5 text-base-content/50">
                This opens your email application. You must send the draft
                yourself to complete your request.
              </p>

              {attemptedSubmit &&
                Object.keys(errors).length === 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-ghost btn-sm w-full"
                  >
                    Clear form
                  </button>
                )}
            </form>
          </motion.section>

          {/* Support information */}
          <motion.aside
            initial={reducedMotion ? false : { opacity: 0, x: 16 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col rounded-3xl bg-base-200/70 p-6 sm:p-8 lg:col-span-2"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={29} aria-hidden="true" />
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              How can we help?
            </h2>

            <p className="mt-4 leading-7 text-base-content/65">
              Whether you need technical assistance, have feedback about the
              platform, or want to discuss a partnership, contact our team
              using the details below.
            </p>

            <div className="my-7 h-px bg-base-300" />

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-base-content/55">
                  Support email
                </h3>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="mt-2 inline-flex items-center gap-2 break-all font-semibold text-primary hover:underline"
                >
                  {SUPPORT_EMAIL}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-base-content/55">
                  Phone
                </h3>

                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="mt-2 inline-flex items-center gap-2 font-semibold hover:text-primary"
                >
                  {SUPPORT_PHONE}
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-base-content/55">
                  Office location
                </h3>

                <p className="mt-2 font-medium">Dhaka, Bangladesh</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-base-content/55">
                  Office hours
                </h3>

                <p className="mt-2 leading-6">
                  Sunday–Thursday
                  <span className="block text-base-content/65">
                    9:00 AM–6:00 PM
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                <div className="flex items-start gap-3">
                  <Clock
                    size={20}
                    className="mt-0.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />

                  <div>
                    <h3 className="font-semibold">Expected response</h3>

                    <p className="mt-1 text-sm leading-6 text-base-content/65">
                      We aim to respond within 24 hours. Actual response times
                      may vary.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="btn btn-outline w-full rounded-xl"
              >
                Contact Support
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-base-300 bg-base-200/50 px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Have an infrastructure issue to report?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-base-content/65">
            Use UrbanFix to submit a public infrastructure concern and follow
            its progress.
          </p>

          <a
            href="/create-issue"
            className="btn btn-primary mt-6 rounded-full px-7"
          >
            Report an Issue
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
};

export default Contact;