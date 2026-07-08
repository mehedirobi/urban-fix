import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Loader from "../components/Loader";

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-medium text-base-content/60">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        {subtitle ? <p className="text-xs text-base-content/55">{subtitle}</p> : null}
      </div>
    </div>
  );
};

const SectionCard = ({ title, subtitle, children }) => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <div className="border-b border-base-300 px-5 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {subtitle ? <p className="text-sm text-base-content/60 mt-1">{subtitle}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase();

  let badgeClass = "badge-ghost";
  if (normalized === "pending") badgeClass = "badge-warning";
  if (normalized === "in progress") badgeClass = "badge-info";
  if (normalized === "resolved") badgeClass = "badge-success";
  if (normalized === "rejected") badgeClass = "badge-error";

  return <span className={`badge ${badgeClass}`}>{status || "Unknown"}</span>;
};

const PriorityBadge = ({ priority }) => {
  const normalized = priority?.toLowerCase();

  let badgeClass = "badge-ghost";
  if (normalized === "low") badgeClass = "badge-neutral";
  if (normalized === "normal") badgeClass = "badge-info";
  if (normalized === "medium") badgeClass = "badge-info";
  if (normalized === "high") badgeClass = "badge-warning";
  if (normalized === "urgent") badgeClass = "badge-error";

  return <span className={`badge ${badgeClass}`}>{priority || "Normal"}</span>;
};

const EmptyState = ({ text = "No data available yet." }) => {
  return (
    <div className="rounded-xl border border-dashed border-base-300 px-4 py-10 text-center text-sm text-base-content/60">
      {text}
    </div>
  );
};

const IssueTable = ({ issues = [], showReporter = false, showAssigned = false }) => {
  if (!issues.length) {
    return <EmptyState text="No issues found for this section yet." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Status</th>
            <th>Priority</th>
            {showReporter && <th>Reported By</th>}
            {showAssigned && <th>Assigned To</th>}
            <th>Upvotes</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue._id}>
              <td>
                <div>
                  <p className="font-semibold">{issue.title}</p>
                  <p className="text-xs text-base-content/60">
                    {issue.category || "General"} • {issue.location || "No location"}
                  </p>
                </div>
              </td>
              <td>
                <StatusBadge status={issue.status} />
              </td>
              <td>
                <PriorityBadge priority={issue.priority} />
              </td>
              {showReporter && (
                <td className="text-sm">
                  {issue?.postedBy?.name || issue?.postedBy?.email || "Unknown"}
                </td>
              )}
              {showAssigned && (
                <td className="text-sm">
                  {issue?.assignedTo?.name || issue?.assignedTo?.email || "Not assigned"}
                </td>
              )}
              <td>{issue.upvotes || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Overview = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const email = user?.email || "";
  const role = (user?.role || "citizen").toLowerCase();

  // Citizen data
  const {
    data: myIssues = [],
    isLoading: myIssuesLoading,
  } = useQuery({
    queryKey: ["my-issues-overview", email],
    enabled: !!email && role === "citizen",
    queryFn: async () => {
      const res = await axiosSecure.get(`/issues/my/${email}`);
      return res.data;
    },
  });

  const {
    data: myPayments = [],
    isLoading: myPaymentsLoading,
  } = useQuery({
    queryKey: ["my-payments-overview", email],
    enabled: !!email && role === "citizen",
    queryFn: async () => {
      const res = await axiosSecure.get(`/payments/${email}`);
      return res.data;
    },
  });

  // Staff data
  const {
    data: assignedIssues = [],
    isLoading: assignedIssuesLoading,
  } = useQuery({
    queryKey: ["assigned-issues-overview", email],
    enabled: !!email && role === "staff",
    queryFn: async () => {
      const res = await axiosSecure.get(`/issues/assigned/${email}`);
      return res.data;
    },
  });

  // Admin data
  const {
    data: allUsers = [],
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["overview-users"],
    enabled: role === "admin",
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });

  const {
    data: allIssues = [],
    isLoading: allIssuesLoading,
  } = useQuery({
    queryKey: ["overview-all-issues"],
    enabled: role === "admin",
    queryFn: async () => {
      const res = await axiosSecure.get("/issues");
      return res.data;
    },
  });

  const isLoading =
    myIssuesLoading ||
    myPaymentsLoading ||
    assignedIssuesLoading ||
    usersLoading ||
    allIssuesLoading;

  if (isLoading) return <Loader />;

  const displayName = user?.name || user?.displayName || "UrbanFix User";

  // Citizen stats
  const citizenResolved = myIssues.filter((issue) => issue.status === "Resolved").length;
  const citizenPending = myIssues.filter((issue) => issue.status === "Pending").length;
  const citizenUpvotes = myIssues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0);
  const recentCitizenIssues = [...myIssues].slice(0, 5);

  // Staff stats
  const staffPending = assignedIssues.filter((issue) => issue.status === "Pending").length;
  const staffInProgress = assignedIssues.filter((issue) => issue.status === "In Progress").length;
  const staffResolved = assignedIssues.filter((issue) => issue.status === "Resolved").length;
  const recentAssignedIssues = [...assignedIssues].slice(0, 5);

  // Admin stats
  const totalUsers = allUsers.length;
  const totalIssues = allIssues.length;
  const pendingIssues = allIssues.filter((issue) => issue.status === "Pending").length;
  const resolvedIssues = allIssues.filter((issue) => issue.status === "Resolved").length;
  const inProgressIssues = allIssues.filter((issue) => issue.status === "In Progress").length;
  const recentAllIssues = [...allIssues].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-base-300 bg-gradient-to-r from-base-100 to-base-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold lg:text-3xl">Welcome back, {displayName}</h1>
        <p className="mt-2 max-w-3xl text-sm text-base-content/70 lg:text-base">
          UrbanFix dashboard overview for your{" "}
          <span className="font-semibold capitalize">{role}</span> account. Here you can monitor
          issues, payments, assignments, and overall platform activity in one place.
        </p>
      </div>

      {/* Citizen Dashboard */}
      {role === "citizen" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Reported Issues" value={myIssues.length} subtitle="Issues created by you" />
            <StatCard title="Resolved Issues" value={citizenResolved} subtitle="Successfully resolved reports" />
            <StatCard title="Pending Issues" value={citizenPending} subtitle="Waiting for action or review" />
            <StatCard title="Total Upvotes" value={citizenUpvotes} subtitle="Upvotes received on your issues" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <SectionCard
                title="Recent Reported Issues"
                subtitle="Your latest submitted issues and their current status"
              >
                <IssueTable issues={recentCitizenIssues} />
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="Payment Summary" subtitle="Premium / boost payment activity">
                <div className="space-y-4">
                  <div className="rounded-xl bg-base-200 p-4">
                    <p className="text-sm text-base-content/60">Total Payments</p>
                    <h3 className="mt-1 text-3xl font-bold">{myPayments.length}</h3>
                  </div>

                  <div className="rounded-xl bg-base-200 p-4">
                    <p className="text-sm text-base-content/60">Latest Activity</p>
                    <p className="mt-1 text-sm">
                      {myPayments.length
                        ? "You have completed payment activity in UrbanFix."
                        : "No payment activity yet."}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Quick Insight" subtitle="Short summary of your reporting activity">
                <ul className="space-y-3 text-sm">
                  <li className="rounded-xl bg-base-200 p-3">
                    You have reported <span className="font-bold">{myIssues.length}</span> issue(s) so far.
                  </li>
                  <li className="rounded-xl bg-base-200 p-3">
                    <span className="font-bold">{citizenResolved}</span> issue(s) have already been resolved.
                  </li>
                  <li className="rounded-xl bg-base-200 p-3">
                    Your issues received <span className="font-bold">{citizenUpvotes}</span> total upvote(s).
                  </li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {/* Staff Dashboard */}
      {role === "staff" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Assigned Issues" value={assignedIssues.length} subtitle="Total issues assigned to you" />
            <StatCard title="Pending" value={staffPending} subtitle="Waiting to be started" />
            <StatCard title="In Progress" value={staffInProgress} subtitle="Currently being worked on" />
            <StatCard title="Resolved" value={staffResolved} subtitle="Successfully completed tasks" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <SectionCard
              title="Assigned Issues Overview"
              subtitle="Recent issues assigned to you for action and updates"
            >
              <IssueTable issues={recentAssignedIssues} showReporter />
            </SectionCard>
          </div>
        </>
      )}

      {/* Admin Dashboard */}
      {role === "admin" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total Users" value={totalUsers} subtitle="All registered platform users" />
            <StatCard title="Total Issues" value={totalIssues} subtitle="All submitted issues in UrbanFix" />
            <StatCard title="Pending Issues" value={pendingIssues} subtitle="Need admin/staff action" />
            <StatCard title="In Progress" value={inProgressIssues} subtitle="Currently under processing" />
            <StatCard title="Resolved Issues" value={resolvedIssues} subtitle="Successfully completed issues" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <SectionCard
                title="Recent Platform Issues"
                subtitle="Latest issue reports across the whole UrbanFix system"
              >
                <IssueTable issues={recentAllIssues} showReporter showAssigned />
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="Platform Snapshot" subtitle="Quick platform health summary">
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-base-200 p-3">
                    Total users registered: <span className="font-bold">{totalUsers}</span>
                  </div>
                  <div className="rounded-xl bg-base-200 p-3">
                    Total issue reports: <span className="font-bold">{totalIssues}</span>
                  </div>
                  <div className="rounded-xl bg-base-200 p-3">
                    Resolved issue count: <span className="font-bold">{resolvedIssues}</span>
                  </div>
                  <div className="rounded-xl bg-base-200 p-3">
                    Pending issue count: <span className="font-bold">{pendingIssues}</span>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Admin Note" subtitle="Presentation-friendly system summary">
                <p className="text-sm leading-6 text-base-content/70">
                  UrbanFix centralizes public issue reporting, role-based management, staff assignment,
                  timeline updates, and payment-powered priority handling in a single dashboard experience.
                </p>
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;