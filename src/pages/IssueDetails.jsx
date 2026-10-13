import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import { api, readRecord } from "../lib/api";
import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { AiFillLike } from "react-icons/ai";
import { HiOutlineArrowLeft, HiOutlineLink, HiOutlineRefresh } from "react-icons/hi";
import Swal from "sweetalert2";

const NO_IMAGE_FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle" dy=".3em">No image available</text>
    </svg>`
  );

const displayText = (value) => {
  if (!value) return "Unknown";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.name || value.email || "Unknown";
  return String(value);
};

const statusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return "badge-success";
    case "in-progress":
    case "in progress":
      return "badge-warning";
    case "closed":
    case "rejected":
      return "badge-error";
    default:
      return "badge-primary";
  }
};

const priorityBadgeClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "badge-error";
    case "medium":
      return "badge-warning";
    default:
      return "badge-success";
  }
};

const DetailsSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-10 space-y-10 animate-pulse">
    <div className="h-[300px] md:h-[400px] bg-base-300 rounded-xl" />
    <div className="bg-base-100 border border-base-300 p-6 rounded-xl space-y-4">
      <div className="h-8 bg-base-300 rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-base-300 rounded-full" />
        <div className="h-6 w-20 bg-base-300 rounded-full" />
        <div className="h-6 w-20 bg-base-300 rounded-full" />
      </div>
      <div className="h-4 bg-base-300 rounded w-1/3" />
      <div className="h-20 bg-base-300 rounded" />
    </div>
  </div>
);

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = UseAuth();
  const secureApi = useAxiosSecure();
  const prefersReducedMotion = useReducedMotion();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadIssue = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/issues/${id}`, { signal });
        const found = readRecord(res.data, "issue");

        if (!found) {
          navigate("/all-issues");
          return;
        }

        const normalizedIssue = {
          ...found,
          image: found.image || NO_IMAGE_FALLBACK,
          upvotedUsers: Array.isArray(found.upvotedUsers) ? found.upvotedUsers : [],
          timeline:
            Array.isArray(found.timeline) && found.timeline.length > 0
              ? found.timeline
              : [
                  {
                    status: "Pending",
                    message: "Issue reported by citizen",
                    updatedBy: displayText(found.postedBy),
                    date: found.createdAt ? new Date(found.createdAt) : new Date(),
                  },
                ],
        };

        setIssue(normalizedIssue);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error(err);
        setError("Failed to load issue details.");
      } finally {
        setLoading(false);
      }
    },
    [id, navigate]
  );

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    loadIssue(controller.signal);
    return () => controller.abort();
  }, [id, loadIssue, retryCount]);

  const handleUpvote = async () => {
    if (!user?.email) return navigate("/login");
    if (!issue?._id || issue.postedBy?.email === user.email) return;
    if (issue.upvotedUsers.includes(user.email)) return;

    const previous = issue;
    setIssue((prev) => ({
      ...prev,
      upvotes: (prev.upvotes || 0) + 1,
      upvotedUsers: [...prev.upvotedUsers, user.email],
    }));

    try {
      const res = await secureApi.put(`/issues/${issue._id}/upvote`, {
        userEmail: user.email,
      });
      if (res?.data?._id) setIssue((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Upvote failed:", err);
      setIssue(previous);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        icon: "success",
        title: "Link copied",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Couldn't copy link" });
    }
  };

  if (loading) return <DetailsSkeleton />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-4">
        <p className="text-error font-semibold">{error}</p>
        <button onClick={() => setRetryCount((c) => c + 1)} className="btn btn-outline btn-sm gap-2">
          <HiOutlineRefresh size={18} />
          Try again
        </button>
      </div>
    );
  }

  if (!issue) return null;

  const sortedTimeline = [...issue.timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
  const alreadyUpvoted = issue.upvotedUsers.includes(user?.email);
  const isOwnIssue = issue.postedBy?.email === user?.email;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/all-issues")}
          className="btn btn-ghost btn-sm gap-2"
        >
          <HiOutlineArrowLeft size={18} />
          Back to Issues
        </button>

        <button onClick={handleCopyLink} className="btn btn-outline btn-sm gap-2">
          <HiOutlineLink size={16} />
          Copy Link
        </button>
      </div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl overflow-hidden shadow-lg bg-base-200"
      >
        <img
          src={issue.image}
          alt={issue.title || "Issue image"}
          className="w-full h-[300px] md:h-[400px] object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = NO_IMAGE_FALLBACK;
          }}
        />
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-base-100 border border-base-300 p-6 rounded-xl shadow-sm space-y-4"
      >
        <h1 className="text-2xl md:text-4xl font-bold text-primary">{issue.title}</h1>

        <div className="flex gap-2 flex-wrap">
          <span className="badge badge-primary badge-outline">{issue.category}</span>
          <span className={`badge ${statusBadgeClass(issue.status)}`}>{issue.status}</span>
          <span className={`badge ${priorityBadgeClass(issue.priority)}`}>
            {issue.priority || "Normal"}
          </span>
        </div>

        <p className="text-base-content/70">
          Location: <span className="font-semibold text-base-content">{issue.location}</span>
        </p>

        <p className="text-base-content/80 leading-relaxed">
          {issue.description || "No description available."}
        </p>

        <p className="text-sm text-base-content/60">
          Posted by: <span className="font-semibold">{displayText(issue.postedBy)}</span>
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-semibold">{issue.upvotes || 0} Upvotes</span>
          <button
            onClick={handleUpvote}
            disabled={isOwnIssue}
            title={isOwnIssue ? "You can't upvote your own issue" : undefined}
            className={`btn btn-sm gap-2 transition-all duration-300 ${
              alreadyUpvoted ? "btn-success text-white" : "btn-outline"
            }`}
          >
            <AiFillLike className={alreadyUpvoted ? "text-white" : "text-yellow-400"} size={18} />
            {alreadyUpvoted ? "Upvoted" : "Upvote"}
          </button>
        </div>
      </motion.div>

      {/* Timeline */}
      {sortedTimeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-base-200 p-6 rounded-xl shadow-sm"
        >
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-6">Issue Timeline</h2>

          <div className="relative flex flex-col gap-6">
            <div
              aria-hidden="true"
              className="absolute left-[7px] top-2 bottom-2 w-px bg-base-300"
            />

            {sortedTimeline.map((t, idx) => (
              <motion.div
                key={idx}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * idx }}
                className="relative flex items-start gap-4"
              >
                <div className="w-4 h-4 mt-2 rounded-full border-2 border-primary bg-base-100 shrink-0 relative z-10" />

                <div className="flex-1 p-4 border-l-4 border-primary bg-base-100 rounded shadow-sm">
                  <div className="flex justify-between items-center mb-1 text-sm gap-2 flex-wrap">
                    <span className={`badge ${statusBadgeClass(t.status)}`}>{t.status}</span>
                    <span className="text-base-content/50 text-xs">
                      {t.date ? new Date(t.date).toLocaleString() : "Unknown date"}
                    </span>
                  </div>

                  <p className="text-base-content/80">{t.message}</p>
                  <p className="text-base-content/50 text-xs mt-1">By: {displayText(t.updatedBy)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IssueDetails;