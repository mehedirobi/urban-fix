import React, { useState } from "react";
import Swal from "sweetalert2";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://urban-fix-server.vercel.app";
const MESSAGE_MAX_LENGTH = 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactCards = [
  { icon: Mail, label: "Email", value: "support@urbanfix.com", href: "mailto:support@urbanfix.com" },
  { icon: Phone, label: "Phone", value: "+8801336458100", href: "tel:+8801336458100" },
  { icon: MapPin, label: "Location", value: "Dhaka, Bangladesh", href: null },
  { icon: Clock, label: "Response Time", value: "Within 24 Hours", href: null },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_REGEX.test(form.email.trim())) next.email = "That email doesn't look right.";
    if (!form.message.trim()) next.message = "Please write a message.";
    else if (form.message.length > MESSAGE_MAX_LENGTH)
      next.message = `Message is too long (max ${MESSAGE_MAX_LENGTH} characters).`;
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/contact`, {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      Swal.fire({
        icon: "success",
        title: "Message sent!",
        text: "We'll get back to you as soon as possible.",
        timer: 2000,
        showConfirmButton: false,
      });

      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form submission failed:", err);
      Swal.fire({
        icon: "error",
        title: "Couldn't send your message",
        text: "Something went wrong on our end. Please try again shortly.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center rounded-3xl bg-gradient-to-r from-primary to-secondary text-white p-10 md:p-16 mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">Contact UrbanFix</h1>
          <p className="max-w-2xl mx-auto text-white/80 text-base md:text-lg">
            Have questions, suggestions, or need support? Our team is ready to help improve
            your experience.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {contactCards.map(({ icon: Icon, label, value, href }) => {
            const CardTag = href ? "a" : "div";
            return (
              <motion.div key={label} variants={itemVariants}>
                <CardTag
                  {...(href ? { href } : {})}
                  className={`block bg-base-200 rounded-3xl p-6 text-center transition-all duration-300 ${
                    href ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer" : ""
                  }`}
                >
                  <Icon className="mx-auto text-primary mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">{label}</h3>
                  <p className="opacity-70 break-words">{value}</p>
                </CardTag>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Form + Info */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-base-200 rounded-3xl p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Send Us a Message</h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`input input-bordered w-full transition-colors ${
                    errors.name ? "input-error" : ""
                  }`}
                />
                {errors.name && (
                  <p id="name-error" className="text-error text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`input input-bordered w-full transition-colors ${
                    errors.email ? "input-error" : ""
                  }`}
                />
                {errors.email && (
                  <p id="email-error" className="text-error text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  name="message"
                  rows="6"
                  placeholder="Write your message..."
                  value={form.message}
                  onChange={handleChange}
                  disabled={submitting}
                  maxLength={MESSAGE_MAX_LENGTH}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : "message-count"}
                  className={`textarea textarea-bordered w-full transition-colors ${
                    errors.message ? "textarea-error" : ""
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.message ? (
                    <p id="message-error" className="text-error text-sm">
                      {errors.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span id="message-count" className="text-xs opacity-50">
                    {form.message.length}/{MESSAGE_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-base-200 rounded-3xl p-6 md:p-8 flex flex-col justify-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">We're Here To Help</h2>

            <p className="opacity-70 leading-relaxed mb-6">
              UrbanFix is committed to helping citizens report, track, and resolve urban
              issues more efficiently. Whether you need technical support, have
              partnership inquiries, or want to share feedback, our team is available to
              assist you.
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Office Hours</h4>
                <p className="opacity-70">Sunday - Thursday, 9:00 AM - 6:00 PM</p>
              </div>

              <div>
                <h4 className="font-semibold">Support Email</h4>
                <a href="mailto:support@urbanfix.com" className="opacity-70 hover:text-primary hover:underline">
                  support@urbanfix.com
                </a>
              </div>

              <div>
                <h4 className="font-semibold">Emergency Support</h4>
                <p className="opacity-70">Available for critical urban incidents.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;