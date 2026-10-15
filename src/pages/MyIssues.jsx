import React, { useState, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchAllIssues } from "../lib/api";

const CATEGORIES = ["Road", "Garbage", "Water", "Streetlight", "Others"];

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

const getOwnerEmail = (issue) =>
  String(
    issue?.userEmail ||
      (typeof issue?.postedBy === "string"
        ? issue.postedBy
        : issue?.postedBy?.email) ||
      ""
  )
    .trim()
    .toLowerCase();

/* ---------------- Issue Card ---------------- */

const IssueCard = memo(function IssueCard({ issue, onEdit, onDelete }) {
  return (
    <div className="card border shadow-lg rounded-xl">
      <figure>
        <img
          src={
            issue.image ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3C/svg%3E"
          }
          alt={issue.title}
          className="w-full h-48 object-cover rounded-t-xl"
          loading="lazy"
        />
      </figure>

      <div className="card-body flex flex-col gap-2">
        <h2 className="text-xl font-bold">{issue.title}</h2>

        <div className="flex gap-2 flex-wrap">
          <span className="badge badge-primary">{issue.category}</span>
          <span className="badge badge-secondary">{issue.status}</span>
        </div>

        <p className="text-gray-700 text-sm line-clamp-3">{issue.description}</p>

        <div className="mt-3 flex justify-between items-center">
          <Link to={`/issues/${issue._id}`} className="btn btn-sm btn-primary">
            View Details
          </Link>
          <span className="text-gray-500">{issue.upvotes || 0} 👍</span>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="btn btn-sm btn-warning flex-1"
            aria-label={`Edit ${issue.title}`}
            onClick={() => onEdit(issue)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-error flex-1"
            aria-label={`Delete ${issue.title}`}
            onClick={() => onDelete(issue._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

/* ---------------- Edit Modal ---------------- */

const EditIssueModal = memo(function EditIssueModal({
  initialData,
  submitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialData);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Edit Issue</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            className="input input-bordered"
            value={form.title || ""}
            onChange={update("title")}
            required
          />

          <textarea
            className="textarea textarea-bordered"
            value={form.description || ""}
            onChange={update("description")}
            required
          />

          <select
            className="select select-bordered"
            value={form.category || "Others"}
            onChange={update("category")}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            className="input input-bordered"
            value={form.location || ""}
            onChange={update("location")}
            required
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

/* ---------------- Main Component ---------------- */

const MyIssues = () => {
  const { user } = UseAuth();
  const secureApi = useAxiosSecure();
  const queryClient = useQueryClient();
  const queryKey = ["my-issues", user?.email];

  const [editIssueData, setEditIssueData] = useState(null);

  const {
    data: issues = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    enabled: !!user?.email,
    queryFn: async () => {
      const allIssues = await fetchAllIssues(secureApi);
      const email = user.email.trim().toLowerCase();
      return allIssues.filter((issue) => getOwnerEmail(issue) === email);
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      secureApi.delete(`/issues/${encodeURIComponent(id)}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old = []) => old.filter((i) => i._id !== id));
      return { previous };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(queryKey, context.previous);
      Swal.fire("Error", getErrorMessage(err, "Failed to delete issue."), "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      Swal.fire({ title: "Deleted", text: "Issue removed successfully.", icon: "success" });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ _id, ...payload }) =>
      secureApi.patch(`/issues/${encodeURIComponent(_id)}`, payload),
    onMutate: async ({ _id, ...payload }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old = []) =>
        old.map((i) => (i._id === _id ? { ...i, ...payload } : i))
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(queryKey, context.previous);
      Swal.fire("Error", getErrorMessage(err, "Failed to update issue."), "error");
    },
    onSuccess: () => {
      setEditIssueData(null);
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      Swal.fire({ title: "Updated", text: "Issue updated successfully.", icon: "success" });
    },
  });

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Delete this issue?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
      });
      if (result.isConfirmed) deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const openEditModal = useCallback((issue) => setEditIssueData(issue), []);
  const closeModal = useCallback(() => setEditIssueData(null), []);

  const handleEditSubmit = useCallback(
    (form) => {
      const { _id, title, description, category, location } = form;
      editMutation.mutate({ _id, title, description, category, location });
    },
    [editMutation]
  );

  if (!user) {
    return <p className="text-center py-10">Please login to see your issues.</p>;
  }

  if (isLoading) {
    return <p className="text-center py-10">Loading issues...</p>;
  }

  if (isError) {
    return (
      <div className="py-10 text-center" role="alert">
        <p className="text-error">Failed to load your issues from the service.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn btn-outline btn-sm mt-3"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl text-center font-bold mb-8 text-primary">My Issues</h1>

      {issues.length === 0 ? (
        <p className="text-gray-500 text-center">You haven't posted any issues yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editIssueData && (
        <EditIssueModal
          initialData={editIssueData}
          submitting={editMutation.isPending}
          onClose={closeModal}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default MyIssues;