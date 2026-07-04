import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Swal from "sweetalert2";

import { HiOutlineMenuAlt3, HiOutlineX, HiOutlineUser, HiOutlineLogout } from "react-icons/hi";
import { FaTools } from "react-icons/fa";

import UseAuth from "../hooks/UseAuth";
import DarkModeToggle from "./DarkModeToggle";

const FALLBACK_AVATAR = "https://i.ibb.co/4pDNDk1/avatar.png";

// Closes a menu on outside click or Escape
const useClickOutside = (ref, onClose, active) => {
  useEffect(() => {
    if (!active) return;
    const handlePointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onClose, active]);
};

const Navbar = () => {
  const { user, logout } = UseAuth();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const profileRef = useRef(null);
  const mobileRef = useRef(null);

  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);
  useClickOutside(mobileRef, () => setMobileOpen(false), mobileOpen);

  // Track scroll to shrink navbar + intensify blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setProfileOpen(false);
      Swal.fire({
        icon: "success",
        title: "Logged out successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const baseRoutes = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "All Issues", path: "/all-issues" },
      { name: "About Us", path: "/about-us" },
      { name: "Contact", path: "/contact" },
      { name: "Support", path: "/support" },
    ],
    []
  );

  const authRoutes = useMemo(
    () =>
      user
        ? [
            { name: "Report Issue", path: "/create-issue" },
            { name: "Dashboard", path: "/dashboard" },
          ]
        : [],
    [user]
  );

  const menuItems = useMemo(() => [...baseRoutes, ...authRoutes], [baseRoutes, authRoutes]);

  const isActiveRoute = useCallback(
    (path) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)),
    [location.pathname]
  );

  const navTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={navTransition}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? "bg-base-100/90 backdrop-blur-xl border-base-300 shadow-sm"
            : "bg-base-100/60 backdrop-blur-md border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div
            className={`flex items-center justify-between transition-[height] duration-300 ${
              scrolled ? "h-14" : "h-16"
            }`}
          >
            {/* LEFT: Logo + mobile trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-base-200 active:scale-95 transition"
              >
                {mobileOpen ? <HiOutlineX size={22} /> : <HiOutlineMenuAlt3 size={22} />}
              </button>

              <Link
                to="/"
                className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold tracking-tight group"
              >
                <FaTools className="text-primary text-2xl sm:text-3xl transition-transform duration-300 group-hover:rotate-12" />
                <span>
                  Urban<span className="text-primary">Fix</span>
                </span>
              </Link>
            </div>

            {/* DESKTOP NAV with sliding pill indicator */}
            <ul className="hidden lg:flex items-center gap-1 relative">
              {menuItems.map((item) => {
                const active = isActiveRoute(item.path);
                return (
                  <li key={item.path} className="relative">
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      aria-current={active ? "page" : undefined}
                      className={`relative z-10 block px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                        active ? "text-primary-content" : "text-base-content/70 hover:text-base-content"
                      }`}
                    >
                      {item.name}
                    </NavLink>
                    {active && (
                      <motion.span
                        layoutId="activePill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 bg-primary rounded-full"
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* RIGHT */}
            <div className="flex items-center gap-2 sm:gap-3">
              <DarkModeToggle />

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    aria-label="Account menu"
                    aria-expanded={profileOpen}
                    onClick={() => setProfileOpen((v) => !v)}
                    className="w-10 h-10 rounded-full ring-2 ring-primary/30 overflow-hidden hover:ring-primary/60 transition active:scale-95"
                  >
                    <img
                      src={avatarError ? FALLBACK_AVATAR : user.photoURL || FALLBACK_AVATAR}
                      onError={() => setAvatarError(true)}
                      alt={user.displayName ? `${user.displayName}'s avatar` : "User avatar"}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-64 p-2 bg-base-100 rounded-2xl border border-base-300 shadow-xl origin-top-right"
                      >
                        <li className="px-3 py-2">
                          <p className="font-semibold truncate">{user.displayName || "User"}</p>
                          <p className="text-xs opacity-60 truncate">{user.email}</p>
                        </li>
                        <div className="h-px bg-base-300 my-1 mx-1" />
                        <li>
                          <Link
                            to="/dashboard/profile"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-base-200 transition"
                          >
                            <HiOutlineUser size={18} />
                            Profile
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-error hover:bg-error/10 transition"
                          >
                            <HiOutlineLogout size={18} />
                            Logout
                          </button>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="btn btn-primary btn-sm sm:btn-md rounded-full px-5 hover:scale-[1.03] active:scale-95 transition-transform"
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              ref={mobileRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-base-300 bg-base-100/95 backdrop-blur-xl"
            >
              <ul className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
                {menuItems.map((item, i) => {
                  const active = isActiveRoute(item.path);
                  return (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : i * 0.04, duration: 0.2 }}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        aria-current={active ? "page" : undefined}
                        className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                          active ? "bg-primary text-primary-content" : "hover:bg-base-200"
                        }`}
                      >
                        {item.name}
                      </NavLink>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to offset fixed navbar */}
      <div className={scrolled ? "h-14" : "h-16"} />
    </>
  );
};

export default Navbar;