import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "How do I report an issue?",
    a: "Navigate to the Report Issue page, provide details, upload photos if needed, and submit your report.",
  },
  {
    q: "Can I edit my submitted issue?",
    a: "Yes. You can manage and update your reports from your dashboard under My Issues.",
  },
  {
    q: "How long does it take to resolve an issue?",
    a: "Resolution time depends on the category, location, and priority level of the reported issue.",
  },
  {
    q: "Can I track issue progress?",
    a: "Yes. UrbanFix provides real-time tracking and status updates for all submitted reports.",
  },
  {
    q: "Who should I contact for urgent issues?",
    a: "For critical public safety concerns, contact local emergency services immediately and also submit the issue through UrbanFix.",
  },
];

const supportCards = [
  {
    icon: MessageSquare,
    title: "Live Support",
    desc: "Reach our team through the contact form.",
    to: "/contact",
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "support@urbanfix.com",
    href: "mailto:support@urbanfix.com",
  },
  {
    icon: Phone,
    title: "Hotline",
    desc: "+880 1234 567890",
    href: "tel:+8801234567890",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Support = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-primary to-secondary text-white text-center p-10 md:p-16 mb-16"
        >
          <HelpCircle size={56} className="mx-auto mb-5" />
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">
            Help & Support Center
          </h1>
          <p className="max-w-2xl mx-auto text-white/80 text-base md:text-lg">
            Find answers, get support, and learn how UrbanFix helps communities report
            and resolve urban issues efficiently.
          </p>
        </motion.div>

        {/* Support Cards */}
        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16"
        >
          {supportCards.map(({ icon, title, desc, href, to }) => {
            const content = (
              <>
                <div className="text-primary flex justify-center mb-4">
                  {React.createElement(icon, { size: 32 })}
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="opacity-70">{desc}</p>
              </>
            );

            const cardClass =
              "bg-base-200 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block";

            return (
              <motion.div key={title} variants={itemVariants}>
                {href ? (
                  <a href={href} className={cardClass}>
                    {content}
                  </a>
                ) : (
                  <Link to={to} className={cardClass}>
                    {content}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="opacity-70 max-w-2xl mx-auto">
              Quick answers to the most common questions from our users.
            </p>
          </motion.div>

          <motion.div
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-4 max-w-4xl mx-auto"
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;

              return (
                <motion.div
                  key={faq.q}
                  variants={itemVariants}
                  className="bg-base-200 rounded-2xl overflow-hidden border border-base-300"
                >
                  <h3>
                    <button
                      id={buttonId}
                      onClick={() => toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full flex justify-between items-center gap-4 p-5 text-left font-semibold hover:bg-base-300/40 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={20}
                        aria-hidden="true"
                        className={`shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 opacity-80">{faq.a}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Emergency Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-error/10 border border-error/20 rounded-3xl p-6 md:p-8 mb-16"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <ShieldAlert className="text-error shrink-0" size={36} />
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Emergency Issues</h3>
              <p className="opacity-80">
                For immediate public safety threats such as fire, severe infrastructure
                collapse, gas leaks, or medical emergencies, contact emergency services
                first before submitting a report through UrbanFix.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="bg-base-200 rounded-3xl p-8 md:p-10 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="opacity-70 max-w-2xl mx-auto mb-6">
            Our support team is available to answer your questions and help resolve any
            issues you face.
          </p>
          <Link
            to="/contact"
            className="btn btn-primary btn-lg hover:scale-[1.03] active:scale-95 transition-transform"
          >
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;