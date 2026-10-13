import React, { memo, useCallback, useId, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineWrenchScrewdriver,
  HiOutlineCreditCard,
  HiOutlineUserCircle,
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import { FaTools } from "react-icons/fa";

import useAuth from "../hooks/UseAuth";
import Loader from "../components/Loader";

const SIDEBAR_LINKS = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: HiOutlineHome,
    roles: ["admin", "staff", "citizen"],
    end: true,
  },
  {
    to: "/dashboard/my-issues",
    label: "My Issues",
    icon: HiOutlineClipboardList,
    roles: ["citizen"],
  },
  {
    to: "/dashboard/manage-users",
    label: "Manage Users",
    icon: HiOutlineUsers,
    roles: ["admin"],
  },
  {
    to: "/dashboard/manage-issues",
    label: "Manage Issues",
    icon: HiOutlineWrenchScrewdriver,
    roles: ["admin", "staff"],
  },
  {
    to: "/dashboard/my-payment",
    label: "My Payments",
    icon: HiOutlineCreditCard,
    roles: ["citizen"],
  },
  {
    to: "/dashboard/profile",
    label: "My Profile",
    icon: HiOutlineUserCircle,
    roles: ["admin", "staff", "citizen"],
  },
];

const ROLE_BADGES = {
  admin: "badge-error",
  staff: "badge-warning",
  citizen: "badge-info",
};

const PAGE_TITLES = {
  "/dashboard": "Overview",
  "/dashboard/my-issues": "My Issues",
  "/dashboard/manage-users": "Manage Users",
  "/dashboard/manage-issues": "Manage Issues",
  "/dashboard/my-payment": "My Payments",
  "/dashboard/profile": "My Profile",
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

// --------------------------------------------------
// USER AVATAR
// --------------------------------------------------

const UserAvatar = memo(function UserAvatar({
  name,
  photoURL,
  size = "md",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-12 w-12 text-sm",
  };

  const dimensions = sizeClasses[size] || sizeClasses.md;
  const showImage = Boolean(photoURL) && !imageFailed;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary ring-1 ring-base-300 ${dimensions}`}
    >
      {showImage ? (
        <img
          src={photoURL}
          alt={`${name}'s profile`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-label={`${name}'s initials`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
});

// --------------------------------------------------
// SIDEBAR NAVIGATION
// --------------------------------------------------

const Sidebar = memo(function Sidebar({
  links,
  drawerId,
  onNavigate,
  user,
  userRole,
}) {
  const displayName =
    user?.displayName || user?.name || "UrbanFix User";

  const email = user?.email || "";

  return (
    <aside className="drawer-side z-50">
      <label
        htmlFor={drawerId}
        aria-label="Close dashboard sidebar"
        className="drawer-overlay"
      />

      <div className="flex min-h-full w-[min(18rem,85vw)] flex-col border-r border-base-300 bg-base-200 text-base-content">
        {/* Brand */}
        <div className="border-b border-base-300 px-5 py-5">
          <Link
            to="/"
            onClick={onNavigate}
            className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="UrbanFix home"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-sm transition-transform duration-200 group-hover:scale-105">
              <FaTools className="text-lg" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-extrabold tracking-tight">
                UrbanFix
              </h2>
              <p className="text-xs text-base-content/60">
                Dashboard workspace
              </p>
            </div>
          </Link>
        </div>

        {/* User information */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                name={displayName}
                photoURL={user?.photoURL}
                size="lg"
              />

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold">
                  {displayName}
                </h3>

                <p
                  className="mt-0.5 truncate text-xs text-base-content/60"
                  title={email}
                >
                  {email || "No email available"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`badge badge-sm capitalize ${
                  ROLE_BADGES[userRole] || "badge-neutral"
                }`}
              >
                {userRole}
              </span>

              {user?.isPremium && (
                <span className="badge badge-success badge-sm">
                  Premium
                </span>
              )}

              {user?.isBlocked && (
                <span className="badge badge-error badge-sm">
                  Blocked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav
          aria-label="Dashboard navigation"
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-base-content/50">
            Workspace
          </p>

          <ul className="space-y-1.5">
            {links.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium",
                      "outline-none transition-colors duration-200",
                      "focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? "bg-primary text-primary-content shadow-sm"
                        : "text-base-content/75 hover:bg-base-300 hover:text-base-content",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className="h-5 w-5 shrink-0"
                        aria-hidden="true"
                      />

                      <span className="flex-1">{label}</span>

                      {isActive && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-current"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-base-300 p-4">
          <div className="rounded-xl bg-base-100 p-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FaTools aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold">Better cities together</p>
                <p className="mt-0.5 text-[11px] text-base-content/60">
                  Powered by community action
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/"
            onClick={onNavigate}
            className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-base-content/60 transition hover:bg-base-300 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <HiOutlineArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to website
          </Link>
        </div>
      </div>
    </aside>
  );
});

// --------------------------------------------------
// DASHBOARD LAYOUT
// --------------------------------------------------

const DashBoardLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const drawerId = useId();
  const drawerRef = useRef(null);

  const userRole = (user?.role || "citizen").trim().toLowerCase();

  const filteredLinks = useMemo(
    () =>
      SIDEBAR_LINKS.filter((link) =>
        link.roles.includes(userRole)
      ),
    [userRole]
  );

  const closeDrawer = useCallback(() => {
    if (drawerRef.current) {
      drawerRef.current.checked = false;
    }
  }, []);

  // Close the mobile drawer after navigating to another route.
  React.useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  const pageTitle =
    PAGE_TITLES[location.pathname] ||
    [...filteredLinks]
      .filter(
        (link) =>
          link.to !== "/dashboard" &&
          location.pathname.startsWith(`${link.to}/`)
      )
      .sort((a, b) => b.to.length - a.to.length)[0]?.label ||
    "Dashboard";

  const displayName =
    user?.displayName || user?.name || "UrbanFix User";

  if (loading) {
    return <Loader message="Loading your dashboard..." />;
  }

  if (!user) {
    // Let the application's route guard handle unauthenticated redirects.
    return null;
  }

  if (user.isBlocked) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-base-100 px-4 py-10">
        <section
          role="alert"
          className="w-full max-w-md rounded-3xl border border-error/20 bg-base-100 p-6 text-center shadow-xl sm:p-9"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-2xl font-bold text-error">
            !
          </div>

          <h1 className="mt-5 text-2xl font-extrabold">
            Account Blocked
          </h1>

          <p className="mt-3 text-sm leading-6 text-base-content/70">
            Your account has been blocked by an administrator. Please
            contact support if you believe this is a mistake.
          </p>

          <Link
            to="/"
            className="btn btn-primary mt-6 rounded-xl px-6"
          >
            Back to Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="drawer min-h-dvh bg-base-100 lg:drawer-open">
      <input
        ref={drawerRef}
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
        aria-label="Toggle dashboard navigation"
      />

      {/* Main content */}
      <div className="drawer-content flex min-h-dvh min-w-0 flex-col">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur-xl">
          <div className="navbar min-h-[4.5rem] gap-2 px-3 sm:px-5 lg:px-8">
            {/* Mobile sidebar control */}
            <div className="flex-none lg:hidden">
              <label
                htmlFor={drawerId}
                className="btn btn-square btn-ghost btn-sm sm:btn-md"
                aria-label="Open dashboard sidebar"
              >
                <HiOutlineMenuAlt3
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </label>
            </div>

            {/* Page heading */}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-extrabold tracking-tight sm:text-xl lg:text-2xl">
                {pageTitle}
              </h1>

              <p className="mt-0.5 truncate text-xs text-base-content/60 sm:text-sm">
                Welcome back, {displayName}
              </p>
            </div>

            {/* Desktop profile summary */}
            <div className="flex flex-none items-center gap-2.5 sm:gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-semibold">
                  {displayName}
                </p>

                <p className="text-xs capitalize text-base-content/60">
                  {userRole}
                </p>
              </div>

              <UserAvatar
                name={displayName}
                photoURL={user.photoURL}
                size="md"
              />
            </div>
          </div>
        </header>

        {/* Routed dashboard page */}
        <main className="w-full flex-1 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Minimal footer */}
        <footer className="border-t border-base-300 px-4 py-4 text-center text-xs text-base-content/50 sm:px-6">
          UrbanFix Dashboard
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          Making communities better together
        </footer>
      </div>

      {/* Responsive sidebar */}
      <Sidebar
        links={filteredLinks}
        drawerId={drawerId}
        onNavigate={closeDrawer}
        user={user}
        userRole={userRole}
      />
    </div>
  );
};

export default DashBoardLayout;