import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const StatCard = ({ title, value, subtitle, color = "primary" }) => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-base-content/70">{title}</p>
          <h3 className="mt-2 text-3xl font-bold">{value}</h3>
          {subtitle && (
            <p className="mt-2 text-xs text-base-content/60">{subtitle}</p>
          )}
        </div>

        <div className={`badge badge-${color} badge-outline capitalize`}>
          {color}
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, desc, to, btnText }) => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-base-content/70">{desc}</p>
      <Link to={to} className="btn btn-primary btn-sm mt-4">
        {btnText}
      </Link>
    </div>
  );
};

const DashboardOverview = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const userRole = (user?.role || "citizen").toLowerCase();

  const { data: overview = {}, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-overview", user?.email, userRole],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get("/dashboard-overview", {
        params: { email: user.email, role: userRole },
      });
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-base-200" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-error">Could not load dashboard data.</p>
        <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm mt-3">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* top hero */}
      <section className="rounded-3xl border border-base-300 bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 p-6 shadow-sm">
        <h2 className="text-2xl font-bold">
          Welcome to UrbanFix Dashboard 👋
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-base-content/70">
          Track infrastructure issues, monitor progress, manage reports, and keep
          city services more transparent and efficient.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="badge badge-primary badge-outline capitalize">
            {userRole}
          </span>

          {user?.isPremium && (
            <span className="badge badge-success badge-outline">Premium User</span>
          )}
        </div>
      </section>

      {/* citizen overview */}
      {userRole === "citizen" && (
        <>
          <section>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="My Total Issues"
                value={overview.totalIssues || 0}
                subtitle="All issues you reported"
                color="primary"
              />
              <StatCard
                title="Pending Issues"
                value={overview.pendingIssues || 0}
                subtitle="Waiting for action"
                color="warning"
              />
              <StatCard
                title="Resolved Issues"
                value={overview.resolvedIssues || 0}
                subtitle="Completed successfully"
                color="success"
              />
              <StatCard
                title="My Payments"
                value={overview.totalPayments || 0}
                subtitle="Boost / subscription payments"
                color="secondary"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <QuickActionCard
              title="View My Issues"
              desc="See all your submitted issues, their current status, and update history."
              to="/dashboard/my-issues"
              btnText="Go to My Issues"
            />
            <QuickActionCard
              title="Manage Profile & Payments"
              desc="Update your profile information or review your payment history."
              to="/dashboard/profile"
              btnText="Open Profile"
            />
          </section>
        </>
      )}

      {/* staff overview */}
      {userRole === "staff" && (
        <>
          <section>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Issues"
                value={overview.totalIssues || 0}
                subtitle="All reported issues in the system"
                color="primary"
              />
              <StatCard
                title="Pending"
                value={overview.pendingIssues || 0}
                subtitle="Need staff attention"
                color="warning"
              />
              <StatCard
                title="In Progress"
                value={overview.inProgressIssues || 0}
                subtitle="Currently being handled"
                color="secondary"
              />
              <StatCard
                title="Resolved"
                value={overview.resolvedIssues || 0}
                subtitle="Completed issues"
                color="success"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <QuickActionCard
              title="Manage Issues"
              desc="Review reported issues, update statuses, and track resolution progress."
              to="/dashboard/manage-issues"
              btnText="Manage Issues"
            />
            <QuickActionCard
              title="Profile Settings"
              desc="Keep your staff account information updated for a clean presentation."
              to="/dashboard/profile"
              btnText="Open Profile"
            />
          </section>
        </>
      )}

      {/* admin overview */}
      {userRole === "admin" && (
        <>
          <section>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Users"
                value={overview.totalUsers || 0}
                subtitle="All registered platform users"
                color="primary"
              />
              <StatCard
                title="Total Issues"
                value={overview.totalIssues || 0}
                subtitle="All reported issues"
                color="secondary"
              />
              <StatCard
                title="Total Payments"
                value={overview.totalPayments || 0}
                subtitle="Recorded payment entries"
                color="success"
              />
              <StatCard
                title="Premium Users"
                value={overview.totalPremiumUsers || 0}
                subtitle="Users with premium access"
                color="warning"
              />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Pending Issues"
              value={overview.pendingIssues || 0}
              subtitle="Need review / assignment"
              color="warning"
            />
            <StatCard
              title="In Progress"
              value={overview.inProgressIssues || 0}
              subtitle="Currently being processed"
              color="secondary"
            />
            <StatCard
              title="Resolved Issues"
              value={overview.resolvedIssues || 0}
              subtitle="Successfully resolved"
              color="success"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <QuickActionCard
              title="Manage Users"
              desc="Update roles, block users, and review platform members from one place."
              to="/dashboard/manage-users"
              btnText="Manage Users"
            />
            <QuickActionCard
              title="Manage Issues"
              desc="Monitor all reports, track progress, and keep issue resolution flowing."
              to="/dashboard/manage-issues"
              btnText="Manage Issues"
            />
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardOverview;