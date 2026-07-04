import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import { HiOutlineRefresh, HiOutlineInbox } from "react-icons/hi";

const API_URL =
  import.meta.env.VITE_API_URL || "https://urban-fix-server.vercel.app";

// Inline SVG fallback — no external service, never goes down
const NO_IMAGE_FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
      <rect width="400" height="250" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">No image available</text>
    </svg>`
  );

const displayText = (value) => {
  if (!value) return "Unknown";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.name || value.email || "Unknown";
  return String(value);
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

// Lightweight relative time — avoids pulling in a date library for one string
const timeAgo = (dateStr) => {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const CardSkeleton = () => (
  <div className="animate-pulse card bg-base-100 border border-base-300 rounded-2xl h-[380px] overflow-hidden">
    <div className="h-48 bg-base-300" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-base-300 rounded w-3/4" />
      <div className="h-4 bg-base-300 rounded w-1/2" />
      <div className="h-4 bg-base-300 rounded w-1/3" />
      <div className="h-10 bg-base-300 rounded mt-6" />
    </div>
  </div>
);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const LatestResolvedIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const fetchResolvedIssues = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_URL}/issues`, { signal });
      const data = Array.isArray(res.data) ? res.data : [];

      const resolvedIssues = data
        .filter((issue) => issue?.status === "Resolved")
        .map((issue) => ({
          ...issue,
          image: issue.image || NO_IMAGE_FALLBACK,
        }));

      const sorted = resolvedIssues.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );

      setIssues(sorted.slice(0, 6));
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Error fetching resolved issues:", err);
      setError("Failed to load resolved issues.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchResolvedIssues(controller.signal);
    return () => controller.abort();
  }, [fetchResolvedIssues, retryCount]);

  const renderedCards = useMemo(() => {
    return issues.map((issue) => (
      <motion.div
        key={issue._id}
        variants={cardVariants}
        className="group card bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
      >
        <figure className="overflow-hidden bg-base-200">
          <img
            src={issue.image}
            alt={issue.title || "Resolved issue"}
            className="w-full h-48 md:h-56 object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = NO_IMAGE_FALLBACK;
            }}
          />
        </figure>

        <div className="card-body p-4 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg md:text-xl font-semibold line-clamp-1">{issue.title}</h3>
            {timeAgo(issue.updatedAt || issue.createdAt) && (
              <span className="text-xs text-base-content/50 whitespace-nowrap mt-1">
                {timeAgo(issue.updatedAt || issue.createdAt)}
              </span>
            )}
          </div>

          <div className="flex gap-2 flex-wrap mb-2">
            <span className="badge badge-primary badge-outline">{issue.category || "General"}</span>
            <span className="badge badge-success">{issue.status}</span>
            <span className={`badge ${priorityBadgeClass(issue.priority)}`}>
              {issue.priority || "Normal"}
            </span>
          </div>

          <p className="text-base-content/60 text-sm mb-1 truncate">
            Location: {issue.location || "Unknown"}
          </p>

          <p className="text-base-content/60 text-sm mb-4">
            Posted by: {displayText(issue.postedBy)}
          </p>

          <Link
            to={`/issues/${issue._id}`}
            className="btn btn-primary w-full mt-auto transition-transform duration-300 group-hover:scale-[1.02]"
          >
            View Details
          </Link>
        </div>
      </motion.div>
    ));
  }, [issues]);

  if (error) {
    return (
      <section className="bg-base-200 py-14">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center gap-4">
          <p className="text-error font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
            className="btn btn-outline btn-sm gap-2"
          >
            <HiOutlineRefresh size={18} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-base-200 py-14">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Latest Resolved Issues
          </h2>
          <p className="text-base-content/60 text-sm md:text-base">
            Real problems, fixed by the community and city teams.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-base-content/60 py-16">
            <HiOutlineInbox size={40} className="opacity-50" />
            <p className="font-medium">No resolved issues yet.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {renderedCards}
            </motion.div>

            <div className="flex justify-center mt-10">
              <Link to="/all-issues" className="btn btn-outline rounded-full px-8">
                View All Issues
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LatestResolvedIssues;