import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { fetchAllIssues } from "../lib/api";

const statusOptions = ["Pending", "In Progress", "Resolved", "Rejected"];

const normalizedStatus = (status) => {
  const value = status?.toLowerCase();
  return value === "ongoing" || value === "in-progress" ? "in progress" : value;
};

const statusBadgeMap = {
  pending: "badge-warning",
  ongoing: "badge-info",
  "in progress": "badge-info",
  resolved: "badge-success",
  closed: "badge-error",
  rejected: "badge-error",
};

const priorityBadgeMap = {
  low: "badge-ghost",
  medium: "badge-info",
  high: "badge-warning",
  urgent: "badge-error",
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ManageIssues = () => {
  const { user } = UseAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const queryKey = ["issues"];
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: issues = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchAllIssues(axiosSecure),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      axiosSecure.patch(`/issues/${encodeURIComponent(id)}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) =>
      Swal.fire(
        "Update failed",
        error.response?.data?.message || "Could not update the issue.",
        "error"
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      axiosSecure.delete(`/issues/${encodeURIComponent(id)}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) =>
      Swal.fire(
        "Delete failed",
        error.response?.data?.message || "Could not delete the issue.",
        "error"
      ),
  });

  const filteredIssues = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        !search ||
        issue.title?.toLowerCase().includes(search) ||
        issue.category?.toLowerCase().includes(search) ||
        issue.location?.toLowerCase().includes(search) ||
        issue.postedBy?.name?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus(issue.status) === normalizedStatus(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [issues, searchText, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      pending: issues.filter((item) => normalizedStatus(item.status) === "pending").length,
      ongoing: issues.filter((item) => normalizedStatus(item.status) === "in progress").length,
      resolved: issues.filter((item) => normalizedStatus(item.status) === "resolved").length,
      urgent: issues.filter((item) => item.priority?.toLowerCase() === "urgent").length,
    };
  }, [issues]);

  const handleStatusChange = (id, status) => updateMutation.mutate({ id, status });

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

    deleteMutation.mutate(id);
  };

  if (!["admin", "staff"].includes(user?.role)) {
    return <p className="py-12 text-center text-error">Staff access is required.</p>;
  }

  if (isLoading) {
    return <div className="py-12 text-center" role="status">Loading issues…</div>;
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-error">Could not load issues from the service.</p>
        <button type="button" onClick={() => refetch()} className="btn btn-outline btn-sm mt-3">
          Try again
        </button>
      </div>
    );
  }

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
                        statusBadgeMap[issue.status?.toLowerCase()] || "badge-neutral"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge capitalize ${
                        priorityBadgeMap[issue.priority?.toLowerCase()] || "badge-neutral"
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
                        value={
                          statusOptions.find((status) => status === issue.status) || "Pending"
                        }
                        disabled={updateMutation.isPending}
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

                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDelete(issue._id)}
                          className="btn btn-sm btn-error"
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      )}
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