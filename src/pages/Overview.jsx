import { memo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";

const STAT_STYLES = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

const STAT_ICONS = {
  primary: BarChart3,
  secondary: ClipboardList,
  success: CheckCircle2,
  warning: AlertCircle,
  error: ShieldCheck,
};

const formatValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0
    ? number.toLocaleString()
    : "0";
};

const StatCard = memo(function StatCard({
  title,
  value = 0,
  subtitle,
  color = "primary",
}) {
  const badgeClass = STAT_STYLES[color] || STAT_STYLES.primary;
  const Icon = STAT_ICONS[color] || STAT_ICONS.primary;

  return (
    <article className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-base-content/65">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-base-content">
            {formatValue(value)}
          </p>

          {subtitle && (
            <p className="mt-2 text-xs leading-5 text-base-content/55 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <span
          className={`badge ${badgeClass} badge-outline shrink-0 capitalize`}
        >
          {color}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-base-300 pt-4">
        <Icon
          size={17}
          className="text-primary"
          aria-hidden="true"
        />
        <span className="text-xs text-base-content/55">
          Dashboard statistics
        </span>
      </div>
    </article>
  );
});

const QuickActionCard = memo(function QuickActionCard({
  title,
  desc,
  to,
  btnText,
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none sm:p-6">
      <h3 className="text-lg font-bold text-base-content">{title}</h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-base-content/65">
        {desc}
      </p>

      <Link
        to={to}
        className="btn btn-primary btn-sm mt-5 w-fit gap-2"
      >
        {btnText}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
});

const StatGrid = memo(function StatGrid({ items, columns = "four" }) {
  const gridClass =
    columns === "three"
      ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  );
});

const QuickActions = memo(function QuickActions({ items }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <QuickActionCard key={item.title} {...item} />
      ))}
    </div>
  );
});

const LoadingOverview = () => (
  <div
    className="space-y-6"
    role="status"
    aria-label="Loading dashboard"
  >
    <div className="h-36 animate-pulse rounded-3xl bg-base-200 sm:h-40" />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-2xl border border-base-300 bg-base-200/70"
        />
      ))}
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-2xl bg-base-200"
        />
      ))}
    </div>

    <span className="sr-only">Loading your dashboard data...</span>
  </div>
);

const DashboardMessage = ({ title, message, onRetry }) => (
  <section className="mx-auto flex min-h-[40vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <div className="flex size-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/70">
      <AlertCircle size={26} aria-hidden="true" />
    </div>

    <h2 className="mt-5 text-xl font-bold text-base-content">{title}</h2>

    <p className="mt-2 max-w-md text-sm leading-6 text-base-content/65">
      {message}
    </p>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="btn btn-primary btn-sm mt-5 gap-2"
      >
        <RefreshCw size={16} aria-hidden="true" />
        Try again
      </button>
    )}
  </section>
);

const DASHBOARD_CONTENT = {
  citizen: {
    stats: [
      {
        title: "My Total Issues",
        key: "totalIssues",
        subtitle: "Issues you have reported",
        color: "primary",
      },
      {
        title: "Pending Issues",
        key: "pendingIssues",
        subtitle: "Waiting for action",
        color: "warning",
      },
      {
        title: "Resolved Issues",
        key: "resolvedIssues",
        subtitle: "Issues marked as resolved",
        color: "success",
      },
      {
        title: "My Payments",
        key: "totalPayments",
        subtitle: "Recorded payment entries",
        color: "secondary",
      },
    ],
    actions: [
      {
        title: "View My Issues",
        desc: "Review your submitted reports and their current statuses.",
        to: "/dashboard/my-issues",
        btnText: "Go to My Issues",
      },
      {
        title: "Profile & Payments",
        desc: "Update your account details or review your payment history.",
        to: "/dashboard/profile",
        btnText: "Open Profile",
      },
    ],
  },

  staff: {
    stats: [
      {
        title: "Total Issues",
        key: "totalIssues",
        subtitle: "Reported issues across the platform",
        color: "primary",
      },
      {
        title: "Pending Issues",
        key: "pendingIssues",
        subtitle: "Awaiting review or action",
        color: "warning",
      },
      {
        title: "In Progress",
        key: "inProgressIssues",
        subtitle: "Currently being handled",
        color: "secondary",
      },
      {
        title: "Resolved Issues",
        key: "resolvedIssues",
        subtitle: "Issues marked as resolved",
        color: "success",
      },
    ],
    actions: [
      {
        title: "Manage Issues",
        desc: "Review reports and update issue statuses according to your permissions.",
        to: "/dashboard/manage-issues",
        btnText: "Manage Issues",
      },
      {
        title: "Profile Settings",
        desc: "View and update your account information.",
        to: "/dashboard/profile",
        btnText: "Open Profile",
      },
    ],
  },

  admin: {
    stats: [
      {
        title: "Total Users",
        key: "totalUsers",
        subtitle: "Registered platform users",
        color: "primary",
      },
      {
        title: "Total Issues",
        key: "totalIssues",
        subtitle: "All reported issues",
        color: "secondary",
      },
      {
        title: "Total Payments",
        key: "totalPayments",
        subtitle: "Recorded payment entries",
        color: "success",
      },
      {
        title: "Premium Users",
        key: "totalPremiumUsers",
        subtitle: "Users with premium access",
        color: "warning",
      },
      {
        title: "Pending Issues",
        key: "pendingIssues",
        subtitle: "Awaiting review or action",
        color: "warning",
      },
      {
        title: "In Progress",
        key: "inProgressIssues",
        subtitle: "Currently being handled",
        color: "secondary",
      },
      {
        title: "Resolved Issues",
        key: "resolvedIssues",
        subtitle: "Issues marked as resolved",
        color: "success",
      },
    ],
    actions: [
      {
        title: "Manage Users",
        desc: "Review platform members and manage account permissions.",
        to: "/dashboard/manage-users",
        btnText: "Manage Users",
      },
      {
        title: "Manage Issues",
        desc: "Monitor reports and oversee issue resolution progress.",
        to: "/dashboard/manage-issues",
        btnText: "Manage Issues",
      },
    ],
  },
};

const DashboardOverview = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const email = user?.email?.trim();

  const rawRole = user?.role?.toLowerCase?.() || "citizen";
  const userRole = rawRole === "user" ? "citizen" : rawRole;
  const content = DASHBOARD_CONTENT[userRole];

  const {
    data: overview = {},
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard-overview", email, userRole],
    enabled: Boolean(email),
    staleTime: 30_000,
    retry: 1,
    queryFn: async () => {
      const response = await axiosSecure.get("/dashboard-overview", {
        params: {
          email,
          role: userRole,
        },
      });

      const payload = response?.data;

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Invalid dashboard response.");
      }

      return payload;
    },
  });

  if (!user) {
    return (
      <DashboardMessage
        title="Account not ready"
        message="Your account information is not available yet. Wait for authentication to finish, then reopen the dashboard."
      />
    );
  }

  if (!email) {
    return (
      <DashboardMessage
        title="Email unavailable"
        message="We couldn't identify your signed-in account. Sign in again if this issue continues."
      />
    );
  }

  if (isLoading) {
    return <LoadingOverview />;
  }

  if (isError) {
    return (
      <DashboardMessage
        title="Unable to load dashboard"
        message="The dashboard data could not be retrieved. Check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (!content) {
    return (
      <DashboardMessage
        title="Dashboard role unavailable"
        message={`The account role "${userRole}" is not supported by this dashboard. Verify the role stored for your account.`}
      />
    );
  }

  const stats = content.stats.map((item) => ({
    title: item.title,
    subtitle: item.subtitle,
    color: item.color,
    value: overview[item.key] ?? 0,
  }));

  return (
    <main className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-5 shadow-sm sm:p-7 lg:p-8">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-primary badge-outline capitalize">
              {userRole}
            </span>

            {user?.isPremium && (
              <span className="badge badge-success badge-outline">
                Premium
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
            Welcome to UrbanFix
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/65 sm:text-base">
            Monitor civic reports, review issue progress, and access the tools
            available to your account.
          </p>

          <p className="mt-3 break-all text-sm text-base-content/55">
            Signed in as {email}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 hidden size-48 rounded-full bg-primary/10 blur-2xl sm:block"
        />
      </section>

      <section aria-label="Dashboard statistics">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-base-content sm:text-xl">
            Overview
          </h2>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn btn-ghost btn-sm gap-2"
          >
            <RefreshCw
              size={15}
              className={isFetching ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>

        <StatGrid
          items={stats}
          columns={userRole === "admin" ? "three" : "four"}
        />
      </section>

      <section aria-labelledby="quick-actions-heading">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard
            size={19}
            className="text-primary"
            aria-hidden="true"
          />
          <h2
            id="quick-actions-heading"
            className="text-lg font-bold text-base-content sm:text-xl"
          >
            Quick Actions
          </h2>
        </div>

        <QuickActions items={content.actions} />
      </section>

      {userRole === "admin" && (
        <section className="flex items-start gap-3 rounded-2xl border border-base-300 bg-base-200/50 p-4">
          <Users
            size={20}
            className="mt-0.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-semibold text-base-content">
              Platform administration
            </h2>
            <p className="mt-1 text-sm leading-6 text-base-content/65">
              Use the management pages to review users and reported issues.
              Available actions depend on your server-side permissions.
            </p>
          </div>
        </section>
      )}
    </main>
  );
};

export default memo(DashboardOverview);