import React, { useEffect, useMemo, useState } from "react";

const statusBadgeMap = {
  pending: "badge-warning",
  ongoing: "badge-info",
  resolved: "badge-success",
  rejected: "badge-error",
};

const priorityBadgeMap = {
  low: "badge-ghost",
  medium: "badge-info",
  high: "badge-warning",
  urgent: "badge-error",
};

const demoIssues = [
  {
    _id: "1",
    title: "Broken Streetlight in Mirpur",
    category: "Streetlight",
    location: "Mirpur 10, Dhaka",
    status: "pending",
    priority: "high",
    upvotes: 12,
    postedBy: { name: "Rahim", email: "rahim@gmail.com" },
    createdAt: "2025-12-20T10:00:00.000Z",
  },
  {
    _id: "2",
    title: "Garbage overflow near market",
    category: "Waste",
    location: "Mohammadpur, Dhaka",
    status: "ongoing",
    priority: "urgent",
    upvotes: 22,
    postedBy: { name: "Karim", email: "karim@gmail.com" },
    createdAt: "2025-12-21T08:30:00.000Z",
  },
  {
    _id: "3",
    title: "Water leakage beside road",
    category: "Water",
    location: "Uttara Sector 7",
    status: "resolved",
    priority: "medium",
    upvotes: 7,
    postedBy: { name: "Sadia", email: "sadia@gmail.com" },
    createdAt: "2025-12-22T09:20:00.000Z",
  },
  {
    _id: "4",
    title: "Damaged footpath in Dhanmondi",
    category: "Footpath",
    location: "Dhanmondi 27",
    status: "pending",
    priority: "low",
    upvotes: 5,
    postedBy: { name: "Nabil", email: "nabil@gmail.com" },
    createdAt: "2025-12-23T11:15:00.000Z",
  },
];

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

const ManageIssues = () => {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // later backend API দিয়ে replace করবা
    setIssues(demoIssues);
  }, []);

  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        !term ||
        issue.title?.toLowerCase().includes(term) ||
        issue.category?.toLowerCase().includes(term) ||
        issue.location?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || issue.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [issues, search, statusFilter]);

  const totalIssues = issues.length;
  const pendingCount = issues.filter((i) => i.status === "pending").length;
  const ongoingCount = issues.filter((i) => i.status === "ongoing").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;
  const urgentCount = issues.filter((i) => i.priority === "urgent").length;

  const handleStatusChange = (id, newStatus) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === id ? { ...issue, status: newStatus } : issue
      )
    );
  };

  const handlePriorityChange = (id, newPriority) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === id ? { ...issue, priority: newPriority } : issue
      )
    );
  };

  const handleDeleteIssue = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this issue?"
    );
    if (!confirmDelete) return;

    setIssues((prev) => prev.filter((issue) => issue._id !== id));
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Issues</h1>
            <p className="text-sm text-base-content/70">
              Review reported issues, update status, change priority, and manage city service workflow.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Search issue, category, location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Total Issues</p>
          <h3 className="mt-2 text-3xl font-bold">{totalIssues}</h3>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Pending</p>
          <h3 className="mt-2 text-3xl font-bold">{pendingCount}</h3>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Ongoing</p>
          <h3 className="mt-2 text-3xl font-bold">{ongoingCount}</h3>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Urgent</p>
          <h3 className="mt-2 text-3xl font-bold">{urgentCount}</h3>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">Issue List</h2>
            <p className="text-sm text-base-content/60">
              Showing {filteredIssues.length} issues
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Issue</th>
                <th>Category</th>
                <th>Reporter</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Upvotes</th>
                <th>Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredIssues.map((issue, index) => (
                <tr key={issue._id}>
                  <td>{index + 1}</td>

                  <td>
                    <div>
                      <p className="font-semibold">{issue.title}</p>
                      <p className="text-xs text-base-content/60">
                        {issue.location}
                      </p>
                    </div>
                  </td>

                  <td>{issue.category}</td>

                  <td>
                    <div>
                      <p className="font-medium">{issue.postedBy?.name || "Unknown"}</p>
                      <p className="text-xs text-base-content/60">
                        {issue.postedBy?.email || "No email"}
                      </p>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge capitalize ${
                        statusBadgeMap[issue.status] || "badge-neutral"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge capitalize ${
                        priorityBadgeMap[issue.priority] || "badge-neutral"
                      }`}
                    >
                      {issue.priority}
                    </span>
                  </td>

                  <td>{issue.upvotes || 0}</td>
                  <td>{formatDate(issue.createdAt)}</td>

                  <td>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <select
                        className="select select-bordered select-sm w-28"
                        value={issue.status}
                        onChange={(e) =>
                          handleStatusChange(issue._id, e.target.value)
                        }
                      >
                        <option value="pending">pending</option>
                        <option value="ongoing">ongoing</option>
                        <option value="resolved">resolved</option>
                        <option value="rejected">rejected</option>
                      </select>

                      <select
                        className="select select-bordered select-sm w-28"
                        value={issue.priority}
                        onChange={(e) =>
                          handlePriorityChange(issue._id, e.target.value)
                        }
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                        <option value="urgent">urgent</option>
                      </select>

                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleDeleteIssue(issue._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredIssues.length && (
            <div className="px-5 py-12 text-center text-base-content/60">
              No issues found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ManageIssues;