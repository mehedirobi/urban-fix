import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineRefresh,
  HiOutlineInbox,
  HiOutlineArrowRight,
} from "react-icons/hi";

import { api, readIssueList } from "../lib/api";

const NO_IMAGE_FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#e5e7eb"/>
      <text x="400" y="250" font-family="sans-serif" font-size="24" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
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

const getTimestamp = (value) => {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const timeAgo = (value) => {
  const timestamp = getTimestamp(value);

  if (!timestamp) return null;

  const difference = Date.now() - timestamp;

  // Avoid displaying misleading relative times for future dates.
  if (difference < 0) {
    return new Date(timestamp).toLocaleDateString();
  }

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);

  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
};

const CardSkeleton = () => (
  <article
    aria-hidden="true"
    className="card h-full animate-pulse overflow-hidden rounded-2xl border border-base-300 bg-base-100"
  >
    <div className="aspect-[16/10] bg-base-300" />

    <div className="flex flex-1 flex-col gap-4 p-5">
      <div className="h-6 w-3/4 rounded bg-base-300" />

      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-base-300" />
        <div className="h-6 w-20 rounded-full bg-base-300" />
      </div>

      <div className="h-4 w-2/3 rounded bg-base-300" />
      <div className="h-4 w-1/2 rounded bg-base-300" />
      <div className="mt-auto h-11 rounded-lg bg-base-300" />
    </div>
  </article>
);

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

const LatestResolvedIssues = () => {
  const prefersReducedMotion = useReducedMotion();

  const {
    data: allIssues = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["issues", "latest-resolved"],
    queryFn: async () => {
      const response = await api.get("/issues", {
        params: { status: "Resolved", limit: 6 },
      });

      return readIssueList(response.data);
    },
    staleTime: 30_000,
    retry: 1,
  });

  const issues = useMemo(() => {
    if (!Array.isArray(allIssues)) return [];

    return allIssues
      .filter(
        (issue) =>
          String(issue?.status || "").trim().toLowerCase() === "resolved" &&
          issue?._id
      )
      .sort((a, b) => {
        const dateA = getTimestamp(a.updatedAt || a.createdAt);
        const dateB = getTimestamp(b.updatedAt || b.createdAt);

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [allIssues]);

  const handleImageError = (event) => {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied === "true") return;

    image.dataset.fallbackApplied = "true";
    image.src = NO_IMAGE_FALLBACK;
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <section
      aria-labelledby="latest-resolved-title"
      className="bg-base-200/60 py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <span className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Community impact
          </span>

          <h2
            id="latest-resolved-title"
            className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl"
          >
            Latest Resolved Issues
          </h2>

          <p className="mt-3 text-sm leading-6 text-base-content/65 sm:text-base">
            See the community problems that have been addressed and marked as
            resolved.
          </p>
        </header>

        {/* Loading state */}
        {isPending ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            aria-label="Loading resolved issues"
            aria-busy="true"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          /* Error state */
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-2xl border border-base-300 bg-base-100 px-5 py-14 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
              <HiOutlineRefresh size={27} />
            </div>

            <h3 className="text-lg font-semibold text-base-content">
              Couldn't load resolved issues
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-base-content/60">
              {error?.response?.data?.message ||
                "There was a problem retrieving the latest reports. Please try again."}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              disabled={isFetching}
              className="btn btn-outline btn-sm mt-5 gap-2"
            >
              <HiOutlineRefresh
                size={17}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Retrying..." : "Try again"}
            </button>
          </div>
        ) : issues.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 px-5 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-base-300/60 text-base-content/55">
              <HiOutlineInbox size={29} />
            </div>

            <h3 className="text-lg font-semibold text-base-content">
              No resolved issues yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-base-content/60">
              Resolved reports will appear here as issues are completed and
              their status is updated.
            </p>

            <Link
              to="/all-issues"
              className="btn btn-outline btn-sm mt-5 gap-2"
            >
              Explore all issues
              <HiOutlineArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            {/* Resolved issue cards */}
            <motion.div
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {issues.map((issue) => {
                const timestamp = issue.updatedAt || issue.createdAt;
                const relativeTime = timeAgo(timestamp);

                return (
                  <motion.article
                    key={issue._id}
                    variants={prefersReducedMotion ? undefined : cardVariants}
                    className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-shadow duration-300 hover:shadow-lg"
                  >
                    <Link
                      to={`/issues/${issue._id}`}
                      aria-label={`View details for ${issue.title || "resolved issue"}`}
                      className="relative block overflow-hidden bg-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    >
                      <img
                        src={issue.image || NO_IMAGE_FALLBACK}
                        alt={issue.title ? `Photo of ${issue.title}` : "Resolved issue"}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                      />

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-content shadow-sm">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-current"
                        />
                        Resolved
                      </span>
                    </Link>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="badge badge-primary badge-outline">
                          {issue.category || "General"}
                        </span>

                        {relativeTime && (
                          <time
                            dateTime={
                              getTimestamp(timestamp)
                                ? new Date(getTimestamp(timestamp)).toISOString()
                                : undefined
                            }
                            className="text-xs text-base-content/50"
                            title={
                              getTimestamp(timestamp)
                                ? new Date(getTimestamp(timestamp)).toLocaleString()
                                : undefined
                            }
                          >
                            {relativeTime}
                          </time>
                        )}
                      </div>

                      <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-7 text-base-content transition-colors group-hover:text-primary sm:text-xl">
                        {issue.title || "Untitled issue"}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="badge badge-success badge-outline">
                          Successfully resolved
                        </span>

                        <span
                          className={`badge ${priorityBadgeClass(issue.priority)}`}
                        >
                          {issue.priority || "Normal"} priority
                        </span>
                      </div>

                      <p
                        className="mt-4 line-clamp-2 text-sm leading-6 text-base-content/65"
                        title={issue.location || undefined}
                      >
                        <span className="font-medium text-base-content/80">
                          Location:
                        </span>{" "}
                        {issue.location || "Location unavailable"}
                      </p>

                      <p className="mt-2 line-clamp-1 text-xs text-base-content/55">
                        Reported by: {displayText(issue.postedBy)}
                      </p>

                      <div className="mt-auto pt-5">
                        <Link
                          to={`/issues/${issue._id}`}
                          className="btn btn-primary btn-sm w-full gap-2"
                        >
                          View details
                          <HiOutlineArrowRight
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>

            {/* Section CTA */}
            <div className="mt-10 flex justify-center sm:mt-12">
              <Link
                to="/all-issues"
                className="btn btn-outline rounded-full px-7"
              >
                View all issues
                <HiOutlineArrowRight size={17} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LatestResolvedIssues;