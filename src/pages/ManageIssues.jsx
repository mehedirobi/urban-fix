import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";

const statusOptions = ["pending", "ongoing", "resolved", "rejected"];
const priorityOptions = ["low", "medium", "high", "urgent"];

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

// Demo data for presentation
const initialIssues = [
  {
    _id: "1",
    title: "Broken Streetlight in Mirpur",
    category: "Streetlight",
    location: "Mirpur 10, Dhaka",
    status: "pending",
    priority: "high",
    upvotes: 12,
    postedBy: {
      name: "Rahim",
      email: "rahim@gmail.com",
    },
    createdAt: "2025-12-20T10:00:00.000Z",
  },
  {
    _id: "2",
    title: "Garbage Overflow Near Market",
    category: "Waste Management",
    location: "Mohammadpur, Dhaka",
    status: "ongoing",
    priority: "urgent",
    upvotes: 21,
    postedBy: {
      name: "Karim",
      email: "karim@gmail.com",
    },
    createdAt: "2025-12-21T08:30:00.000Z",
  },
  {
    _id: "3",
    title: "Water Leakage on Main Road",
    category: "Water Supply",
    location: "Uttara Sector 7",
    status: "resolved",
    priority: "medium",
    upvotes: 8,
    postedBy: {
      name: "Sadia",
      email: "sadia@gmail.com",
    },
    createdAt: "2025-12-22T09:15:00.000Z",
  },
  {
    _id: "4",
    title: "Damaged Footpath Beside School",
    category: "Road & Footpath",
    location: "Dhanmondi 27, Dhaka",
    status: "pending",
    priority: "low",
    upvotes: 5,
    postedBy: {
      name: "Nabil",
      email: "nabil@gmail.com",
    },
    createdAt: "2025-12-23T11:45:00.000Z",
  },
  {
    _id: "5",
    title: "Drain Blockage Causing Waterlogging",
    category: "Drainage",
    location: "Badda, Dhaka",
    status: "ongoing",
    priority: "high",
    upvotes: 17,
    postedBy: {
      name: "Farzana",
      email: "farzana@gmail.com",
    },
    createdAt: "2025-12-24T06:20:00.000Z",
  },
];

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ManageIssues = () => {
  const [issues, setIssues] = useState(initialIssues);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredIssues = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        !search ||
        issue.title.toLowerCase().includes(search) ||
        issue.category.toLowerCase().includes(search) ||
        issue.location.toLowerCase().includes(search) ||
        issue.postedBy?.name?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || issue.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [issues, searchText, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter((item) => item.status === "pending").length,
      ongoing: issues.filter((item) => item.status === "ongoing").length,
      resolved: issues.filter((item) => item.status === "resolved").length,
      urgent: issues.filter((item) => item.priority === "urgent").length,
    };
  }, [issues]);

  const handleStatusChange = (id, newStatus) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === id ? { ...issue, status: newStatus } : issue
      )
    );

    Swal.fire({
      icon: "success",
      title: "Issue status updated",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const handlePriorityChange = (id, newPriority) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === id ? { ...issue, priority: newPriority } : issue
      )
    );

    Swal.fire({
      icon: "success",
      title: "Issue priority updated",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this issue?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    setIssues((prev) => prev.filter((issue) => issue._id !== id));

    Swal.fire({
      icon: "success",
      title: "Issue deleted successfully",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Issues</h1>
            <p className="mt-1 text-sm text-base-content/60">
              Review, monitor, and manage all reported infrastructure issues from one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Search title, category, location..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Total Issues</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.total}</h2>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Pending</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.pending}</h2>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Ongoing</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.ongoing}</h2>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Resolved</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.resolved}</h2>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Urgent Priority</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.urgent}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="border-b border-base-300 px-5 py-4">
          <h2 className="text-lg font-bold">All Reported Issues</h2>
          <p className="text-sm text-base-content/60">
            Showing {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""}
          </p>
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
                      <p className="text-xs text-base-content/60">{issue.location}</p>
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

                  <td>{issue.upvotes}</td>
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
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <select
                        className="select select-bordered select-sm w-28"
                        value={issue.priority}
                        onChange={(e) =>
                          handlePriorityChange(issue._id, e.target.value)
                        }
                      >
                        {priorityOptions.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDelete(issue._id)}
                        className="btn btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredIssues.length && (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-base-content/60">
                    No issues found for the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ManageIssues;