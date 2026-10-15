import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import {
  AiFillLike,
} from "react-icons/ai";
import {
  HiOutlineArrowLeft,
  HiOutlineLink,
  HiOutlineRefresh,
} from "react-icons/hi";

import { api, normalizeIssue, readRecord } from "../lib/api";
import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";

const NO_IMAGE_FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="#e5e7eb"/>
      <text x="600" y="400" font-family="sans-serif" font-size="32" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
        No image available
      </text>
    </svg>
  `);

const displayText = (value) => {
  if (value == null || value === "") return "Unknown";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return value.name || value.email || "Unknown";
  }

  return String(value);
};

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusBadgeClass = (status) => {
  switch (String(status || "").trim().toLowerCase()) {
    case "resolved":
      return "badge-success";

    case "in-progress":
    case "in progress":
      return "badge-warning";

    case "closed":
    case "rejected":
      return "badge-error";

    case "pending":
      return "badge-info";

    default:
      return "badge-primary";
  }
};

const priorityBadgeClass = (priority) => {
  switch (String(priority || "").trim().toLowerCase()) {
    case "high":
      return "badge-error";

    case "medium":
      return "badge-warning";

    case "low":
      return "badge-success";

    default:
      return "badge-ghost";
  }
};

const getOwnerEmail = (postedBy) => {
  if (typeof postedBy === "string") {
    return normalizeEmail(postedBy);
  }

  return normalizeEmail(postedBy?.email);
};

const DetailsSkeleton = () => (
  <main
    className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-12"
    aria-label="Loading issue details"
    aria-busy="true"
  >
    <div className="h-8 w-36 animate-pulse rounded bg-base-300" />

    <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-base-300 sm:aspect-[16/8]" />

    <section className="space-y-5 rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-8">
      <div className="h-8 w-3/4 animate-pulse rounded bg-base-300" />

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-6 w-20 animate-pulse rounded-full bg-base-300"
          />
        ))}
      </div>

      <div className="h-4 w-1/2 animate-pulse rounded bg-base-300" />
      <div className="h-20 animate-pulse rounded bg-base-300" />
    </section>
  </main>
);

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const secureApi = useAxiosSecure();
  const prefersReducedMotion = useReducedMotion();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [upvoting, setUpvoting] = useState(false);

  const currentEmail = normalizeEmail(user?.email);

  const motionInitial = prefersReducedMotion
    ? false
    : { opacity: 0, y: 12 };

  const motionTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3 };

  const loadIssue = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/issues/${id}`, { signal });
        const found = readRecord(response.data, "issue");

        if (!found || typeof found !== "object" || !found._id) {
          setIssue(null);
          setError("This issue could not be found.");
          return;
        }

        const normalized = normalizeIssue(found);
        const normalizedIssue = {
          ...normalized,
          title: found.title || "Untitled issue",
          category: found.category || "Uncategorized",
          status: found.status || "Pending",
          priority: found.priority || "Normal",
          location: found.location || "Location unavailable",
          description: found.description || "",
          image: found.image || NO_IMAGE_FALLBACK,
          upvotes: Math.max(0, normalized.upvotes),
          upvotedUsers: normalized.upvotedUsers.map(normalizeEmail),
          timeline:
            Array.isArray(found.timeline) && found.timeline.length > 0
              ? found.timeline
              : [
                  {
                    status: found.status || "Pending",
                    message: "Issue reported",
                    updatedBy: displayText(found.postedBy),
                    date: found.createdAt || null,
                  },
                ],
        };

        setIssue(normalizedIssue);
      } catch (err) {
        if (signal.aborted || axios.isCancel(err)) return;

        console.error("Failed to load issue details:", err);

        setIssue(null);
        setError(
          err.response?.status === 404
            ? "This issue could not be found."
            : "Unable to load issue details. Please check your connection and try again."
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    if (!id) {
      setIssue(null);
      setError("No issue ID was provided.");
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    loadIssue(controller.signal);

    return () => controller.abort();
  }, [id, retryCount, loadIssue]);

  const sortedTimeline = useMemo(() => {
    if (!Array.isArray(issue?.timeline)) return [];

    return [...issue.timeline].sort((a, b) => {
      const dateA = new Date(a?.date || 0).getTime();
      const dateB = new Date(b?.date || 0).getTime();

      const safeDateA = Number.isNaN(dateA) ? 0 : dateA;
      const safeDateB = Number.isNaN(dateB) ? 0 : dateB;

      return safeDateB - safeDateA;
    });
  }, [issue?.timeline]);

  const isOwnIssue =
    Boolean(currentEmail) && getOwnerEmail(issue?.postedBy) === currentEmail;

  const alreadyUpvoted =
    Boolean(currentEmail) &&
    Boolean(issue?.upvotedUsers?.includes(currentEmail));

  const handleUpvote = async () => {
    if (!user?.email) {
      const result = await Swal.fire({
        icon: "info",
        title: "Login required",
        text: "Please log in before upvoting an issue.",
        showCancelButton: true,
        confirmButtonText: "Go to login",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#087f5b",
      });

      if (result.isConfirmed) {
        navigate("/login");
      }

      return;
    }

    if (!issue?._id || isOwnIssue || alreadyUpvoted || upvoting) return;

    const previousIssue = issue;

    setUpvoting(true);

    // Optimistic UI update.
    setIssue((current) => ({
      ...current,
      upvotes: current.upvotes + 1,
      upvotedUsers: [...current.upvotedUsers, currentEmail],
    }));

    try {
      const response = await secureApi.patch(
        `/issues/${encodeURIComponent(issue._id)}/upvote`,
        {},
      );

      const updatedIssue = readRecord(response.data, "issue");

      if (updatedIssue && typeof updatedIssue === "object") {
        const normalized = normalizeIssue(updatedIssue);
        setIssue((current) => {
          if (!current) return current;

          return {
            ...current,
            ...normalized,
            upvotes: normalized.upvotes,
            upvotedUsers: normalized.upvotedUsers.map(normalizeEmail),
          };
        });
      }
    } catch (err) {
      console.error("Failed to upvote issue:", err);

      setIssue(previousIssue);

      await Swal.fire({
        icon: "error",
        title: "Upvote failed",
        text:
          err.response?.data?.message ||
          "Your upvote could not be saved. Please try again.",
        confirmButtonColor: "#087f5b",
      });
    } finally {
      setUpvoting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(window.location.href);

      await Swal.fire({
        icon: "success",
        title: "Link copied",
        text: "The issue link is ready to share.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Couldn't copy link",
        text: "Your browser may not allow clipboard access on this page.",
        confirmButtonColor: "#087f5b",
      });
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !issue) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-base-200 text-base-content/60">
          <HiOutlineRefresh size={28} />
        </div>

        <h1 className="text-2xl font-bold text-base-content">
          Unable to display issue
        </h1>

        <p className="max-w-md text-sm leading-6 text-base-content/65">
          {error || "The requested issue is unavailable."}
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {id && (
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="btn btn-primary btn-sm gap-2"
            >
              <HiOutlineRefresh size={17} />
              Try again
            </button>
          )}

          <Link to="/all-issues" className="btn btn-outline btn-sm gap-2">
            <HiOutlineArrowLeft size={17} />
            Back to issues
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-10">
      {/* Navigation and actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/all-issues")}
          className="btn btn-ghost btn-sm gap-2"
        >
          <HiOutlineArrowLeft size={18} />
          Back to issues
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="btn btn-outline btn-sm gap-2"
        >
          <HiOutlineLink size={17} />
          Share issue
        </button>
      </div>

      {/* Issue image */}
      <motion.figure
        initial={motionInitial}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransition}
        className="overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm"
      >
        <img
          src={issue.image}
          alt={issue.title ? `Photo for ${issue.title}` : "Issue photo"}
          className="aspect-[16/9] max-h-[520px] w-full object-cover"
          loading="eager"
          decoding="async"
          onError={(event) => {
            if (event.currentTarget.src !== NO_IMAGE_FALLBACK) {
              event.currentTarget.src = NO_IMAGE_FALLBACK;
            }
          }}
        />
      </motion.figure>

      {/* Issue overview */}
      <motion.section
        initial={motionInitial}
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.3, delay: 0.05 }
        }
        aria-labelledby="issue-title"
        className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary badge-outline">
              {issue.category}
            </span>

            <span className={`badge ${statusBadgeClass(issue.status)}`}>
              {issue.status}
            </span>

            <span className={`badge ${priorityBadgeClass(issue.priority)}`}>
              {issue.priority} priority
            </span>
          </div>

          <h1
            id="issue-title"
            className="break-words text-2xl font-bold leading-tight text-base-content sm:text-3xl lg:text-4xl"
          >
            {issue.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-base-content/65">
            <span aria-hidden="true">Location:</span>
            <span className="font-medium text-base-content">
              {issue.location}
            </span>
          </div>
        </div>

        <div className="border-t border-base-300" />

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-base-content">
            Issue description
          </h2>

          <p className="whitespace-pre-line break-words text-sm leading-7 text-base-content/75 sm:text-base">
            {issue.description || "No description has been provided."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-base-300 pt-5">
          <div className="space-y-1 text-sm">
            <p className="text-base-content/55">Reported by</p>
            <p className="break-all font-semibold text-base-content">
              {displayText(issue.postedBy)}
            </p>

            {issue.createdAt && (
              <p className="text-xs text-base-content/55">
                {formatDate(issue.createdAt)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-base-content">
                {issue.upvotes}
              </p>
              <p className="text-xs text-base-content/55">
                {issue.upvotes === 1 ? "Upvote" : "Upvotes"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpvote}
              disabled={
                isOwnIssue ||
                alreadyUpvoted ||
                upvoting ||
                !issue._id
              }
              title={
                isOwnIssue
                  ? "You cannot upvote your own issue"
                  : alreadyUpvoted
                    ? "You have already upvoted this issue"
                    : "Upvote this issue"
              }
              aria-pressed={alreadyUpvoted}
              className={`btn btn-sm gap-2 ${
                alreadyUpvoted ? "btn-success text-white" : "btn-outline"
              }`}
            >
              <AiFillLike
                size={18}
                className={alreadyUpvoted ? "text-white" : ""}
              />

              {upvoting
                ? "Saving..."
                : alreadyUpvoted
                  ? "Upvoted"
                  : isOwnIssue
                    ? "Your issue"
                    : "Upvote"}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Issue timeline */}
      <motion.section
        initial={motionInitial}
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.3, delay: 0.1 }
        }
        aria-labelledby="issue-timeline-title"
        className="rounded-2xl border border-base-300 bg-base-200/60 p-5 sm:p-8"
      >
        <div className="mb-7">
          <h2
            id="issue-timeline-title"
            className="text-xl font-bold text-base-content sm:text-2xl"
          >
            Issue timeline
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Track the recorded updates for this report.
          </p>
        </div>

        {sortedTimeline.length > 0 ? (
          <div className="relative space-y-5">
            <div
              aria-hidden="true"
              className="absolute bottom-5 left-[7px] top-5 w-px bg-base-300"
            />

            {sortedTimeline.map((item, index) => (
              <motion.article
                key={
                  item._id ||
                  `${item.status || "update"}-${item.date || "unknown"}-${index}`
                }
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, x: -8 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.25, delay: Math.min(index * 0.04, 0.2) }
                }
                className="relative flex items-start gap-4"
              >
                <span
                  aria-hidden="true"
                  className="relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 border-primary bg-base-100"
                />

                <div className="min-w-0 flex-1 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`badge ${statusBadgeClass(item.status || "Pending")}`}
                    >
                      {item.status || "Update"}
                    </span>

                    <time
                      dateTime={
                        item.date &&
                        !Number.isNaN(new Date(item.date).getTime())
                          ? new Date(item.date).toISOString()
                          : undefined
                      }
                      className="text-xs text-base-content/55"
                    >
                      {formatDate(item.date)}
                    </time>
                  </div>

                  <p className="whitespace-pre-line break-words text-sm leading-6 text-base-content/80">
                    {item.message || "Issue status updated."}
                  </p>

                  <p className="mt-3 break-words text-xs text-base-content/55">
                    Updated by: {displayText(item.updatedBy)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
            No timeline updates are available yet.
          </p>
        )}
      </motion.section>
    </main>
  );
};

export default IssueDetails;