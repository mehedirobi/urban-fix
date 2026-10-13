import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Swal from "sweetalert2";

import {
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineLogout,
} from "react-icons/hi";
import { FaTools } from "react-icons/fa";

import UseAuth from "../hooks/UseAuth";
import DarkModeToggle from "./DarkModeToggle";

const PUBLIC_ROUTES = [
  { name: "Home", path: "/" },
  { name: "All Issues", path: "/all-issues" },
  { name: "About Us", path: "/about-us" },
  { name: "Contact", path: "/contact" },
  { name: "Support", path: "/support" },
];

const AUTH_ROUTES = [
  { name: "Report Issue", path: "/create-issue" },
  { name: "Dashboard", path: "/dashboard" },
];

const NAV_TRANSITION = {
  type: "tween",
  duration: 0.25,
  ease: "easeOut",
};

const useClickOutside = (
  ref,
  onClose,
  active,
  ignoredRef = null
) => {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        ref.current?.contains(target) ||
        ignoredRef?.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, ignoredRef, onClose, active]);
};

const Navbar = () => {
  const { user, logout } = UseAuth();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef(null);
  const mobileRef = useRef(null);
  const mobileButtonRef = useRef(null);

  const closeProfile = useCallback(() => {
    setProfileOpen(false);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useClickOutside(profileRef, closeProfile, profileOpen);

  useClickOutside(
    mobileRef,
    closeMobile,
    mobileOpen,
    mobileButtonRef
  );

  // Track scrolling without unnecessary state updates.
  useEffect(() => {
    const handleScroll = () => {
      const nextScrolled = window.scrollY > 8;

      setScrolled((previous) =>
        previous === nextScrolled ? previous : nextScrolled
      );
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menus when navigation changes.
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Reset avatar fallback when the authenticated user changes.
  useEffect(() => {
    setAvatarError(false);
  }, [user?.uid, user?.photoURL]);

  const menuItems = user
    ? [...PUBLIC_ROUTES, ...AUTH_ROUTES]
    : PUBLIC_ROUTES;

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();

      setProfileOpen(false);
      setMobileOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Logged out successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);

      await Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: "Please try again.",
        confirmButtonText: "Try again",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const getLinkClass = ({ isActive }) =>
    [
      "relative z-10 block rounded-full px-3 xl:px-4 py-2",
      "text-sm font-medium transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary focus-visible:ring-offset-2",
      isActive
        ? "text-primary-content"
        : "text-base-content/75 hover:text-base-content",
    ].join(" ");

  const getMobileLinkClass = ({ isActive }) =>
    [
      "block rounded-xl px-4 py-3 text-sm font-medium",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary",
      isActive
        ? "bg-primary text-primary-content"
        : "text-base-content hover:bg-base-200",
    ].join(" ");

  const avatarUrl = user?.photoURL;

  const navbarTransition = prefersReducedMotion
    ? { duration: 0 }
    : NAV_TRANSITION;

  return (
    <>
      <motion.nav
        initial={prefersReducedMotion ? false : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={navbarTransition}
        aria-label="Main navigation"
        className={[
          "fixed inset-x-0 top-0 z-50 border-b",
          "transition-[background-color,border-color,box-shadow]",
          "duration-300",
          scrolled
            ? "border-base-300 bg-base-100/95 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-base-100/80 backdrop-blur-md",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={[
              "flex items-center justify-between gap-3",
              "transition-[height] duration-300",
              scrolled ? "h-14" : "h-16",
            ].join(" ")}
          >
            {/* Logo and mobile menu */}
            <div className="flex min-w-0 items-center gap-2">
              <button
                ref={mobileButtonRef}
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMobileOpen((previous) => !previous)}
                className={[
                  "inline-flex h-10 w-10 shrink-0 items-center",
                  "justify-center rounded-full lg:hidden",
                  "text-base-content transition-colors",
                  "hover:bg-base-200 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-primary",
                ].join(" ")}
              >
                {mobileOpen ? (
                  <HiOutlineX size={22} aria-hidden="true" />
                ) : (
                  <HiOutlineMenuAlt3 size={22} aria-hidden="true" />
                )}
              </button>

              <Link
                to="/"
                aria-label="UrbanFix home"
                className={[
                  "group flex min-w-0 items-center gap-2",
                  "rounded-lg font-extrabold tracking-tight",
                  "text-xl sm:text-2xl",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-primary",
                ].join(" ")}
              >
                <FaTools
                  aria-hidden="true"
                  className={[
                    "shrink-0 text-primary",
                    "text-2xl sm:text-3xl",
                    "transition-transform duration-300",
                    "group-hover:rotate-12",
                  ].join(" ")}
                />

                <span className="whitespace-nowrap">
                  Urban<span className="text-primary">Fix</span>
                </span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <ul className="hidden items-center gap-1 lg:flex">
              {menuItems.map((item) => (
                <li key={item.path} className="relative">
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={getLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="urbanfix-active-pill"
                            aria-hidden="true"
                            transition={
                              prefersReducedMotion
                                ? { duration: 0 }
                                : {
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 32,
                                  }
                            }
                            className="absolute inset-0 -z-10 rounded-full bg-primary"
                          />
                        )}

                        {item.name}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Account actions */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <DarkModeToggle />

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    aria-label="Open account menu"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                    onClick={() =>
                      setProfileOpen((previous) => !previous)
                    }
                    className={[
                      "flex h-10 w-10 items-center justify-center",
                      "overflow-hidden rounded-full",
                      "border-2 border-primary/30 bg-base-200",
                      "transition-[border-color,transform]",
                      "hover:border-primary active:scale-95",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-primary",
                    ].join(" ")}
                  >
                    {avatarUrl && !avatarError ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <HiOutlineUser
                        size={23}
                        aria-hidden="true"
                        className="text-base-content/70"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? false
                            : { opacity: 0, y: -6, scale: 0.98 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.16, ease: "easeOut" }
                        }
                        className={[
                          "absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)]",
                          "origin-top-right rounded-2xl",
                          "border border-base-300 bg-base-100 p-2",
                          "shadow-xl",
                        ].join(" ")}
                      >
                        <div className="px-3 py-3">
                          <p className="truncate text-sm font-semibold">
                            {user.displayName || "User"}
                          </p>

                          <p className="mt-1 truncate text-xs text-base-content/60">
                            {user.email || "No email available"}
                          </p>
                        </div>

                        <div className="my-1 h-px bg-base-300" />

                        <Link
                          to="/dashboard/profile"
                          onClick={closeProfile}
                          className={[
                            "flex items-center gap-3 rounded-xl px-3 py-2.5",
                            "text-sm transition-colors hover:bg-base-200",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-primary",
                          ].join(" ")}
                        >
                          <HiOutlineUser
                            size={18}
                            aria-hidden="true"
                          />
                          Profile
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className={[
                            "flex w-full items-center gap-3 rounded-xl",
                            "px-3 py-2.5 text-left text-sm",
                            "text-error transition-colors hover:bg-error/10",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-error",
                          ].join(" ")}
                        >
                          <HiOutlineLogout
                            size={18}
                            aria-hidden="true"
                          />

                          {loggingOut ? "Logging out..." : "Logout"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={[
                    "btn btn-primary btn-sm sm:btn-md",
                    "min-h-10 rounded-full px-4 sm:px-5",
                    "transition-transform hover:scale-[1.02]",
                    "active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-primary focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              ref={mobileRef}
              id="mobile-navigation"
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, height: 0 }
              }
              animate={{ opacity: 1, height: "auto" }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, height: 0 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.2, ease: "easeInOut" }
              }
              className={[
                "overflow-hidden border-t border-base-300",
                "bg-base-100/95 backdrop-blur-xl lg:hidden",
              ].join(" ")}
            >
              <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, x: -8 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.16,
                      delay: prefersReducedMotion ? 0 : index * 0.025,
                    }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      className={getMobileLinkClass}
                    >
                      {item.name}
                    </NavLink>
                  </motion.li>
                ))}

                {!user && (
                  <li className="pt-2">
                    <Link
                      to="/login"
                      className="btn btn-primary min-h-11 w-full rounded-xl"
                    >
                      Login to your account
                    </Link>
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Offset the fixed navbar */}
      <div
        aria-hidden="true"
        className={scrolled ? "h-14" : "h-16"}
      />
    </>
  );
};

export default Navbar;