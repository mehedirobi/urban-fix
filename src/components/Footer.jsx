import React from "react";
import { Link } from "react-router-dom";
import {
  FaTools,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { HiOutlineArrowUpRight } from "react-icons/hi2";

const FOOTER_LINKS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "All Issues", href: "/all-issues" },
      { label: "Report an Issue", href: "/create-issue" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: FaFacebookF,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: FaTwitter,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: FaInstagram,
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-base-300 bg-base-200/60 text-base-content">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_2fr] lg:gap-16">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="UrbanFix home"
              className="group inline-flex items-center gap-2 rounded-lg text-2xl font-extrabold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <FaTools
                aria-hidden="true"
                className="text-3xl text-primary transition-transform duration-300 group-hover:rotate-12"
              />

              <span>
                Urban<span className="text-primary">Fix</span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-7 text-base-content/65">
              Report, track, and resolve public infrastructure
              issues. Together, we can build cleaner, safer, and
              better-connected communities.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit UrbanFix on ${label}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer navigation */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h3 className="mb-4 text-sm font-bold tracking-wide">
                  {section.title}
                </h3>

                <ul className="space-y-3">
                  {section.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="group inline-flex items-center gap-1 text-sm text-base-content/65 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        {item.label}

                        <HiOutlineArrowUpRight
                          aria-hidden="true"
                          className="shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          size={14}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-base-300 pt-6 text-center sm:mt-12 sm:flex-row sm:text-left">
          <p className="text-xs leading-5 text-base-content/60 sm:text-sm">
            © {currentYear} UrbanFix. All rights reserved.
          </p>

          <p className="text-xs text-base-content/60 sm:text-sm">
            Designed and built by{" "}
            <span className="font-semibold text-base-content">
              Mehedi
            </span>
          </p>

          <Link
            to="/"
            className="text-xs font-medium text-base-content/65 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
          >
            Back to home ↑
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;