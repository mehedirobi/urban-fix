import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineCreditCard,
  HiOutlineUserCircle,
  HiOutlineMenuAlt3,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import { FaTools } from "react-icons/fa";

import useAuth from "../hooks/UseAuth";
import Loader from "../components/Loader";

const ROLE_LABELS = {
  admin: "Administrator",
  staff: "Staff",
  citizen: "Citizen",
  user: "Citizen",
};

const ROLE_STYLES = {
  admin: "badge-error",
  staff: "badge-warning",
  citizen: "badge-success",
  user: "badge-success",
};

const NAV_ITEMS = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: HiOutlineHome,
    roles: ["admin", "staff", "citizen"],
    end: true,
  },
  {
    label: "My Issues",
    path: "/dashboard/my-issues",
    icon: HiOutlineClipboardList,
    roles: ["citizen"],
  },
  {
    label: "Manage Users",
    path: "/dashboard/manage-users",
    icon: HiOutlineUsers,
    roles: ["admin"],
  },
  {
    label: "Manage Issues",
    path: "/dashboard/manage-issues",
    icon: FaTools,
    roles: ["admin", "staff"],
  },
  {
    label: "My Payments",
    path: "/dashboard/my-payment",
    icon: HiOutlineCreditCard,
    roles: ["citizen"],
  },
  {
    label: "My Profile",
    path: "/dashboard/profile",
    icon: HiOutlineUserCircle,
    roles: ["admin", "staff", "citizen"],
  },
];

const PAGE_TITLES = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/my-issues": "My Issues",
  "/dashboard/manage-users": "Manage Users",
  "/dashboard/manage-issues": "Manage Issues",
  "/dashboard/my-payment": "My Payments",
  "/dashboard/profile": "My Profile",
  "/dashboard/payment-success": "Payment Successful",
  "/dashboard/payment-cancel": "Payment Cancelled",
};

const normalizeRole = (role) => {
  const normalized = String(role || "citizen").trim().toLowerCase();

  return normalized === "user" ? "citizen" : normalized;
};

const getInitials = (name = "User") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "U";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const UserAvatar = memo(function UserAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);

  const photoURL = user?.photoURL || user?.photoUrl || user?.photo;

  useEffect(() => {
    setImageFailed(false);
  }, [photoURL]);

  if (photoURL && !imageFailed) {
    return (
      <div className="avatar shrink-0">
        <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-base-300">
          <img
            src={photoURL}
            alt={user?.displayName || user?.name || "User profile"}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="avatar placeholder shrink-0">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-content">
        <span className="text-sm font-bold">
          {getInitials(user?.displayName || user?.name)}
        </span>
      </div>
    </div>
  );
});

const Sidebar = memo(function Sidebar({
  user,
  role,
  navItems,
  onNavigate,
}) {
  const displayName =
    user?.displayName || user?.name || "UrbanFix User";

  const email = user?.email || "No email available";

  return (
    <aside className="flex h-full min-h-0 flex-col bg-base-100">
      {/* Brand */}
      <div className="border-b border-base-200 px-5 py-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="UrbanFix home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-content">
            <FaTools className="text-xl" />
          </span>

          <span>
            <span className="block text-xl font-extrabold tracking-tight">
              UrbanFix
            </span>
            <span className="text-xs text-base-content/60">
              Dashboard Portal
            </span>
          </span>
        </Link>
      </div>

      {/* User profile */}
      <div className="border-b border-base-200 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar user={user} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {displayName}
            </p>

            <p className="truncate text-xs text-base-content/60">
              {email}
            </p>

            <span
              className={`badge mt-2 badge-sm ${
                ROLE_STYLES[role] || "badge-ghost"
              }`}
            >
              {ROLE_LABELS[role] || role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="min-h-0 flex-1 overflow-y-auto p-3"
        aria-label="Dashboard navigation"
      >
        <p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-base-content/45">
          Workspace
        </p>

        <ul className="menu menu-md gap-1 p-0">
          {navItems.map(({ label, path, icon: Icon, end }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                    isActive
                      ? "bg-primary font-semibold text-primary-content"
                      : "text-base-content/75 hover:bg-base-200 hover:text-base-content",
                  ].join(" ")
                }
              >
                <Icon className="shrink-0 text-xl" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="border-t border-base-200 p-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="btn btn-ghost btn-sm w-full justify-start gap-3 rounded-xl"
        >
          <HiOutlineArrowLeft className="text-lg" />
          Back to Website
        </Link>
      </div>
    </aside>
  );
});

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200/50">
      <Loader message="Loading your dashboard..." />
    </div>
  );
}

function DashboardAccessError({ role }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200/50 p-5">
      <div className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
          <HiOutlineCog className="text-3xl" />
        </div>

        <h1 className="text-xl font-bold">
          Dashboard Access Unavailable
        </h1>

        <p className="mt-3 text-sm leading-6 text-base-content/65">
          This account does not have a supported dashboard role.
          Please check your account role or contact the administrator.
        </p>

        <p className="mt-3 text-xs text-base-content/50">
          Current role: {role || "Not assigned"}
        </p>

        <Link to="/" className="btn btn-primary mt-6">
          Return Home
        </Link>
      </div>
    </main>
  );
}

export default function DashBoardLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = useMemo(
    () => normalizeRole(user?.role),
    [user?.role]
  );

  const navItems = useMemo(
    () => NAV_ITEMS.filter((item) => item.roles.includes(role)),
    [role]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  const pageTitle = useMemo(() => {
    const pathname = location.pathname;

    if (PAGE_TITLES[pathname]) {
      return PAGE_TITLES[pathname];
    }

    const matchedItem = [...NAV_ITEMS]
      .filter((item) => item.path !== "/dashboard")
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) => pathname.startsWith(`${item.path}/`) ||
        pathname === item.path);

    if (matchedItem) {
      return matchedItem.label;
    }

    if (pathname.startsWith("/dashboard")) {
      return "Dashboard";
    }

    return "UrbanFix";
  }, [location.pathname]);

  if (loading) {
    return <DashboardLoading />;
  }

  if (!user) {
    // PrivateRoute should handle redirecting unauthenticated users.
    return null;
  }

  const supportedRoles = ["admin", "staff", "citizen"];

  if (!supportedRoles.includes(role)) {
    return <DashboardAccessError role={role} />;
  }

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200/50">
      <input
        id="urbanfix-dashboard-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={(event) => setDrawerOpen(event.target.checked)}
        aria-label="Toggle dashboard sidebar"
      />

      <div className="drawer-content flex min-h-screen min-w-0 flex-col">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/95 backdrop-blur">
          <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <label
                htmlFor="urbanfix-dashboard-drawer"
                className="btn btn-square btn-ghost drawer-button lg:hidden"
                aria-label="Open sidebar"
              >
                <HiOutlineMenuAlt3 className="text-2xl" />
              </label>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold sm:text-xl">
                  {pageTitle}
                </h1>

                <p className="hidden text-xs text-base-content/55 sm:block">
                  Manage your UrbanFix workspace
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-semibold">
                  {user.displayName || user.name || "User"}
                </p>
                <p className="text-xs capitalize text-base-content/55">
                  {ROLE_LABELS[role] || role}
                </p>
              </div>

              <UserAvatar user={user} />
            </div>
          </div>
        </header>

        {/* Nested dashboard route content */}
        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-base-300 bg-base-100 px-4 py-4 text-center text-xs text-base-content/50 sm:text-sm">
          © {new Date().getFullYear()} UrbanFix. All rights reserved.
        </footer>
      </div>

      {/* Sidebar / mobile drawer */}
      <div className="drawer-side z-40">
        <label
          htmlFor="urbanfix-dashboard-drawer"
          aria-label="Close sidebar"
          className="drawer-overlay"
        />

        <div className="h-full w-[280px] max-w-[85vw] border-r border-base-300 bg-base-100 sm:w-[300px]">
          <Sidebar
            user={user}
            role={role}
            navItems={navItems}
            onNavigate={closeDrawer}
          />
        </div>
      </div>
    </div>
  );
}