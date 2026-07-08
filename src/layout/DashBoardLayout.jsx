import React, { memo, useCallback, useId, useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import Loader from "../components/Loader";

const SIDEBAR_LINKS = [
  { to: "/dashboard", label: "Overview", roles: ["admin", "staff", "citizen"] },
  { to: "/dashboard/my-issues", label: "My Issues", roles: ["citizen"] },
  { to: "/dashboard/manage-users", label: "Manage Users", roles: ["admin"] },
  { to: "/dashboard/manage-issues", label: "Manage Issues", roles: ["admin", "staff"] },
  { to: "/dashboard/my-payment", label: "My Payment", roles: ["citizen"] },
  { to: "/dashboard/profile", label: "My Profile", roles: ["admin", "staff", "citizen"] },
];

const roleStyles = {
  admin: "badge-error",
  staff: "badge-warning",
  citizen: "badge-info",
};

const getInitials = (name = "") => {
  const words = name.trim().split(" ").filter(Boolean);
  if (!words.length) return "U";
  if (words.length === 1) return words[0][0]?.toUpperCase() || "U";
  return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
};

const navLinkClassName = ({ isActive }) =>
  [
    "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-primary text-primary-content shadow-sm"
      : "text-base-content/80 hover:bg-base-300 hover:text-base-content",
  ].join(" ");

const HamburgerIcon = memo(function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
});

const Sidebar = memo(function Sidebar({ links, drawerId, onNavigate, user, userRole }) {
  const displayName = user?.name || user?.displayName || "UrbanFix User";
  const email = user?.email || "";
  const photoURL = user?.photoURL || "";

  return (
    <aside className="drawer-side z-40">
      <label htmlFor={drawerId} className="drawer-overlay" />

      <div className="min-h-full w-72 bg-base-200 border-r border-base-300 flex flex-col">
        {/* Brand */}
        <div className="border-b border-base-300 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content text-lg font-bold shadow">
              UF
            </div>

            <div>
              <h2 className="text-xl font-bold leading-tight">UrbanFix</h2>
              <p className="text-xs text-base-content/60">Dashboard Panel</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="h-12 w-12 rounded-full object-cover ring ring-base-300"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {getInitials(displayName)}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{displayName}</h3>
                <p className="truncate text-xs text-base-content/60">{email}</p>
              </div>
            </div>

            <div className="mt-3">
              <span className={`badge badge-sm capitalize ${roleStyles[userRole] || "badge-neutral"}`}>
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 py-5 overflow-y-auto">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
            Dashboard Menu
          </p>

          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={navLinkClassName} onClick={onNavigate}>
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-base-300 px-4 py-4">
          <div className="rounded-xl bg-base-100 px-4 py-3 text-xs text-base-content/60">
            Smart city issue management with <span className="font-semibold text-primary">UrbanFix</span>
          </div>
        </div>
      </div>
    </aside>
  );
});

const DashBoardLayout = () => {
  const { user, loading } = useAuth();
  const drawerId = useId();

  // backend role should be: citizen | staff | admin
  const userRole = (user?.role || "citizen").toLowerCase().trim();

  const filteredLinks = useMemo(() => {
    return SIDEBAR_LINKS.filter((link) => link.roles.includes(userRole));
  }, [userRole]);

  const closeDrawer = useCallback(() => {
    const checkbox = document.getElementById(drawerId);
    if (checkbox) checkbox.checked = false;
  }, [drawerId]);

  if (loading) return <Loader />;
  if (!user) return null;

  const displayName = user?.name || user?.displayName || "UrbanFix User";

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-100">
      <input id={drawerId} type="checkbox" className="drawer-toggle" />

      {/* Main content */}
      <div className="drawer-content flex min-h-screen flex-col">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
          <div className="navbar px-4 lg:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <label
                htmlFor={drawerId}
                className="btn btn-square btn-ghost"
                aria-label="Open dashboard sidebar"
              >
                <HamburgerIcon />
              </label>
            </div>

            <div className="flex-1">
              <div>
                <h1 className="text-xl font-bold lg:text-2xl">Dashboard</h1>
                <p className="text-xs text-base-content/60 lg:text-sm">
                  Welcome back, {displayName}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold leading-tight">{displayName}</p>
                <p className="text-xs text-base-content/60 capitalize">{userRole}</p>
              </div>

              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="h-10 w-10 rounded-full object-cover ring ring-base-300"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {getInitials(displayName)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar */}
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