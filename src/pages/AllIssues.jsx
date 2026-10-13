import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AiFillLike } from "react-icons/ai";
import {
  HiOutlineRefresh,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { api, fetchAllIssues } from "../lib/api";

const ITEMS_PER_PAGE = 8;
const SEARCH_DEBOUNCE_MS = 250;
const ISSUES_QUERY_KEY = ["issues"];

const CATEGORY_OPTIONS = [
  "Electricity",
  "Water Supply",
  "Road",
  "Cleanliness",
];

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "inprogress" },
  { label: "Resolved", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

const PRIORITY_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Normal", value: "normal" },
];

const NO_IMAGE_FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
      <rect width="600" height="350" fill="#e5e7eb"/>
      <g fill="#6b7280" font-family="sans-serif" text-anchor="middle">
        <path d="M250 125h100v70H250z" fill="none" stroke="#9ca3af" stroke-width="4"/>
        <circle cx="275" cy="145" r="7" fill="#9ca3af"/>
        <path d="m255 185 28-27 18 17 15-13 29 23" fill="none" stroke="#9ca3af" stroke-width="4"/>
        <text x="300" y="230" font-size="18">Image unavailable</text>
      </g>
    </svg>
  `);

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeStatus = (value) =>
  normalizeText(value).replace(/[\s_-]+/g, "");

const normalizeEmail = (value) => normalizeText(value);

const getPriorityRank = (priority) => {
  switch (normalizeText(priority)) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "normal":
    case "low":
      return 1;
    default:
      return 0;
  }
};

const priorityBadgeClass = (priority) => {
  switch (normalizeText(priority)) {
    case "high":
      return "badge-error";
    case "medium":
      return "badge-warning";
    default:
      return "badge-success";
  }
};

const statusBadgeClass = (status) => {
  switch (normalizeStatus(status)) {
    case "resolved":
      return "badge-success";
    case "inprogress":
      return "badge-warning";
    case "rejected":
      return "badge-error";
    case "pending":
      return "badge-info";
    default:
      return "badge-ghost";
  }
};

const formatStatus = (status) => {
  const normalized = normalizeStatus(status);

  const labels = {
    pending: "Pending",
    inprogress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return labels[normalized] || status || "Unknown";
};

/**
 * Supports common API response shapes.
 * Adjust this function if fetchAllIssues returns a different contract.
 */
const normalizeIssuesResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.issues)) return response.issues;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.issues)) return response.data.issues;

  return [];
};

const getUpdatedIssueFromResponse = (response) => {
  const data = response?.data;

  if (data?._id) return data;
  if (data?.issue?._id) return data.issue;
  if (data?.updatedIssue?._id) return data.updatedIssue;
  if (data?.data?._id) return data.data;

  return null;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: 0.15,
    },
  },
};

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[390px] animate-pulse overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
    >
      <div className="h-48 bg-base-300" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 rounded bg-base-300" />
        <div className="h-4 w-1/2 rounded bg-base-300" />

        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-base-300" />
          <div className="h-6 w-20 rounded-full bg-base-300" />
        </div>

        <div className="h-4 w-full rounded bg-base-300" />

        <div className="flex gap-3 pt-3">
          <div className="h-9 w-20 rounded-lg bg-base-300" />
          <div className="h-9 flex-1 rounded-lg bg-base-300" />
        </div>
      </div>
    </div>
  );
});

const IssuesSkeleton = memo(function IssuesSkeleton() {
  return (
    <section
      aria-label="Loading issues"
      aria-busy="true"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8"
    >
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto h-8 w-56 animate-pulse rounded bg-base-300" />
        <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded bg-base-300" />
      </div>

      <div className="mb-7 h-16 animate-pulse rounded-2xl bg-base-200" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </section>
  );
});

const EmptyState = memo(function EmptyState({
  hasActiveFilters,
  onClear,
}) {
  return (
    <div className="col-span-full flex flex-col items-center px-5 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/50">
        <HiOutlineSearch size={30} aria-hidden="true" />
      </div>

      <h3 className="text-xl font-bold">
        {hasActiveFilters ? "No matching issues" : "No issues available"}
      </h3>

      <p className="mt-2 max-w-md leading-7 text-base-content/60">
        {hasActiveFilters
          ? "Try changing your search or filters to find the issue you are looking for."
          : "There are no issues to display right now. Please check again later."}
      </p>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="btn btn-primary btn-sm mt-5 rounded-full px-5"
        >
          Clear filters
        </button>
      )}
    </div>
  );
});

const ErrorState = memo(function ErrorState({ onRetry, isRetrying }) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error">
        <HiOutlineExclamationCircle size={32} aria-hidden="true" />
      </div>

      <h2 className="text-2xl font-bold">Unable to load issues</h2>

      <p className="mt-3 leading-7 text-base-content/65">
        The issue list could not be retrieved. Check your connection and try
        again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="btn btn-primary mt-6 gap-2 rounded-full"
      >
        <HiOutlineRefresh
          size={18}
          className={isRetrying ? "animate-spin" : ""}
          aria-hidden="true"
        />
        {isRetrying ? "Retrying..." : "Try again"}
      </button>
    </section>
  );
});

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  reducedMotion,
}) {
  const pages = useMemo(() => {
    const result = [];

    for (let page = 1; page <= totalPages; page += 1) {
      if (
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1
      ) {
        result.push(page);
      }
    }

    const compact = [];
    let previous = 0;

    for (const page of result) {
      if (previous) {
        if (page - previous === 2) {
          compact.push(previous + 1);
        } else if (page - previous > 2) {
          compact.push("…");
        }
      }

      compact.push(page);
      previous = page;
    }

    return compact;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Issue pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className="btn btn-sm btn-outline"
      >
        <HiChevronLeft size={18} aria-hidden="true" />
      </button>

      {pages.map((page, index) =>
        page === "…" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-1 text-base-content/50"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            className={`btn btn-sm ${
              currentPage === page ? "btn-primary" : "btn-outline"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className="btn btn-sm btn-outline"
      >
        <HiChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
});

const IssueCard = memo(function IssueCard({
  issue,
  userEmail,
  isVoting,
  voteError,
  onUpvote,
  reducedMotion,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const issueId = issue?._id;
  const title = issue?.title || "Untitled issue";
  const image = issue?.image;
  const category = issue?.category || "Uncategorized";
  const location = issue?.location || "Location not provided";
  const upvotes = Number(issue?.upvotes) || 0;

  const voterEmails = Array.isArray(issue?.upvotedUsers)
    ? issue.upvotedUsers
    : [];

  const alreadyUpvoted = voterEmails.some(
    (email) => normalizeEmail(email) === userEmail,
  );

  const isOwnIssue =
    normalizeEmail(issue?.postedBy?.email) === userEmail && Boolean(userEmail);

  const voteDisabled =
    !userEmail || isOwnIssue || alreadyUpvoted || isVoting || !issueId;

  const voteLabel = !userEmail
    ? "Sign in to upvote"
    : isOwnIssue
      ? "You cannot upvote your own issue"
      : alreadyUpvoted
        ? "You have already upvoted this issue"
        : "Upvote this issue";

  return (
    <motion.article
      variants={reducedMotion ? undefined : cardVariants}
      layout={!reducedMotion}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <Link
        to={`/issues/${issueId}`}
        aria-label={`View details for ${title}`}
        className="relative block overflow-hidden bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <img
          src={!imageFailed && image ? image : NO_IMAGE_FALLBACK}
          alt={image && !imageFailed ? title : "Issue image unavailable"}
          className={`h-48 w-full object-cover ${
            reducedMotion
              ? ""
              : "transition-transform duration-500 group-hover:scale-105"
          }`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />

        <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-base-100/95 px-3 py-1 text-xs font-semibold text-base-content shadow-sm backdrop-blur">
          {category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-6">
          <Link
            to={`/issues/${issueId}`}
            className="transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {title}
          </Link>
        </h3>

        <p
          className="mt-2 flex items-start gap-1.5 text-sm leading-6 text-base-content/60"
          title={location}
        >
          <HiOutlineLocationMarker
            size={17}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span className="line-clamp-2">{location}</span>
        </p>

        {issue?.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-base-content/65">
            {issue.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`badge ${statusBadgeClass(issue?.status)}`}>
            {formatStatus(issue?.status)}
          </span>

          <span className={`badge ${priorityBadgeClass(issue?.priority)}`}>
            {issue?.priority || "Normal"} priority
          </span>
        </div>

        {voteError && (
          <p role="status" className="mt-3 text-xs leading-5 text-error">
            {voteError}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-5">
          <button
            type="button"
            onClick={() => onUpvote(issue)}
            disabled={voteDisabled}
            aria-label={`${voteLabel}. Current votes: ${upvotes}`}
            title={voteLabel}
            className={`btn btn-sm gap-1.5 ${
              alreadyUpvoted ? "btn-success text-white" : "btn-outline"
            }`}
          >
            <AiFillLike
              size={17}
              className={
                alreadyUpvoted ? "text-white" : "text-warning"
              }
              aria-hidden="true"
            />
            <span>{upvotes}</span>
            {isVoting && (
              <span
                className="loading loading-spinner loading-xs"
                aria-hidden="true"
              />
            )}
          </button>

          <Link
            to={`/issues/${issueId}`}
            className="btn btn-primary btn-sm flex-1"
          >
            View Details
            <HiChevronRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
});

const AllIssues = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const secureApi = useAxiosSecure();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();

  const gridTopRef = useRef(null);
  const votingIdsRef = useRef(new Set());

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [votingIds, setVotingIds] = useState(() => new Set());
  const [voteErrors, setVoteErrors] = useState({});

  const userEmail = normalizeEmail(user?.email);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const {
    data: issues = [],
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ISSUES_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchAllIssues(api);
      return normalizeIssuesResponse(response);
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const availableCategories = useMemo(() => {
    const categories = new Map();

    for (const item of [...CATEGORY_OPTIONS, ...issues.map((i) => i?.category)]) {
      if (typeof item !== "string" || !item.trim()) continue;

      const key = normalizeText(item);
      if (!categories.has(key)) categories.set(key, item.trim());
    }

    return [...categories.values()].sort((a, b) => a.localeCompare(b));
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const query = normalizeText(search);

    return issues
      .filter((issue) => {
        if (query) {
          const searchableText = [
            issue?.title,
            issue?.location,
            issue?.description,
            issue?.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!searchableText.includes(query)) return false;
        }

        if (
          category &&
          normalizeText(issue?.category) !== normalizeText(category)
        ) {
          return false;
        }

        if (
          status &&
          normalizeStatus(issue?.status) !== normalizeStatus(status)
        ) {
          return false;
        }

        if (
          priority &&
          normalizeText(issue?.priority) !== normalizeText(priority)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priorityDifference =
          getPriorityRank(b?.priority) - getPriorityRank(a?.priority);

        if (priorityDifference !== 0) return priorityDifference;

        const voteDifference =
          (Number(b?.upvotes) || 0) - (Number(a?.upvotes) || 0);

        if (voteDifference !== 0) return voteDifference;

        return String(b?.createdAt || "").localeCompare(
          String(a?.createdAt || ""),
        );
      });
  }, [issues, search, category, status, priority]);

  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));

  useEffect(() => {
    if (currentPage !== activePage) setCurrentPage(activePage);
  }, [currentPage, activePage]);

  const currentIssues = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;

    return filteredIssues.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredIssues, activePage]);

  const hasActiveFilters = Boolean(
    searchInput.trim() || search || category || status || priority,
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setStatus("");
    setPriority("");
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback(
    (page) => {
      const nextPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

      setCurrentPage(nextPage);

      gridTopRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [totalPages, reducedMotion],
  );

  const handleUpvote = useCallback(
    async (issue) => {
      const issueId = issue?._id;

      if (!userEmail) {
        navigate("/login");
        return;
      }

      if (!issueId) return;

      if (
        normalizeEmail(issue?.postedBy?.email) === userEmail ||
        (Array.isArray(issue?.upvotedUsers) &&
          issue.upvotedUsers.some(
            (email) => normalizeEmail(email) === userEmail,
          ))
      ) {
        return;
      }

      // Prevent duplicate clicks before React re-renders.
      if (votingIdsRef.current.has(issueId)) return;

      votingIdsRef.current.add(issueId);

      setVotingIds((previous) => {
        const next = new Set(previous);
        next.add(issueId);
        return next;
      });

      setVoteErrors((previous) => {
        const next = { ...previous };
        delete next[issueId];
        return next;
      });

      await queryClient.cancelQueries({ queryKey: ISSUES_QUERY_KEY });

      const previousIssues = queryClient.getQueryData(ISSUES_QUERY_KEY);
      const previousIssue = Array.isArray(previousIssues)
        ? previousIssues.find((item) => item?._id === issueId)
        : null;

      // Optimistic update.
      queryClient.setQueryData(ISSUES_QUERY_KEY, (previous = []) => {
        if (!Array.isArray(previous)) return previous;

        return previous.map((item) =>
          item?._id === issueId
            ? {
                ...item,
                upvotes: (Number(item.upvotes) || 0) + 1,
                upvotedUsers: [
                  ...(Array.isArray(item.upvotedUsers)
                    ? item.upvotedUsers
                    : []),
                  userEmail,
                ],
              }
            : item,
        );
      });

      try {
        const response = await secureApi.put(
          `/issues/${encodeURIComponent(issueId)}/upvote`,
          { userEmail: user.email },
        );

        const updatedIssue = getUpdatedIssueFromResponse(response);

        if (updatedIssue) {
          queryClient.setQueryData(ISSUES_QUERY_KEY, (previous = []) => {
            if (!Array.isArray(previous)) return previous;

            return previous.map((item) =>
              item?._id === issueId
                ? { ...item, ...updatedIssue }
                : item,
            );
          });
        } else if (
          response?.data?.success === false ||
          response?.data?.error
        ) {
          throw new Error(
            response.data.message || "The vote could not be saved.",
          );
        }
      } catch (voteError) {
        console.error("Failed to upvote issue:", voteError);

        // Roll back only this issue so other concurrent updates are preserved.
        if (previousIssue) {
          queryClient.setQueryData(ISSUES_QUERY_KEY, (previous = []) => {
            if (!Array.isArray(previous)) return previous;

            return previous.map((item) =>
              item?._id === issueId ? previousIssue : item,
            );
          });
        }

        const message =
          voteError?.response?.data?.message ||
          voteError?.message ||
          "Could not save your vote. Please try again.";

        setVoteErrors((previous) => ({
          ...previous,
          [issueId]: message,
        }));
      } finally {
        votingIdsRef.current.delete(issueId);

        setVotingIds((previous) => {
          const next = new Set(previous);
          next.delete(issueId);
          return next;
        });
      }
    },
    [userEmail, user, navigate, queryClient, secureApi],
  );

  if (isPending) {
    return <IssuesSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => refetch()}
        isRetrying={isFetching}
        error={error}
      />
    );
  }

  return (
    <main
      ref={gridTopRef}
      className="scroll-mt-24 bg-base-100 text-base-content"
    >
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Page heading */}
        <div className="mb-9 text-center">
          <span className="badge badge-primary badge-outline mb-4 px-4 py-3">
            Community Reports
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Explore <span className="text-primary">Issues</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-base-content/65 sm:text-lg">
            Discover infrastructure concerns reported by your community and
            follow their progress toward resolution.
          </p>
        </div>

        {/* Filters */}
        <section
          aria-label="Filter issues"
          className="mb-7 rounded-2xl border border-base-300 bg-base-200/60 p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="relative sm:col-span-2 lg:col-span-2">
              <span className="sr-only">Search issues</span>

              <HiOutlineSearch
                size={19}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/45"
                aria-hidden="true"
              />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title, location, or description..."
                className="input input-bordered w-full bg-base-100 pl-10"
                aria-label="Search issues by title, location, category, or description"
              />
            </label>

            <label>
              <span className="sr-only">Filter by category</span>

              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setCurrentPage(1);
                }}
                className="select select-bordered w-full bg-base-100"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>

                {availableCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by status</span>

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className="select select-bordered w-full bg-base-100"
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>

                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by priority</span>

              <select
                value={priority}
                onChange={(event) => {
                  setPriority(event.target.value);
                  setCurrentPage(1);
                }}
                className="select select-bordered w-full bg-base-100"
                aria-label="Filter by priority"
              >
                <option value="">All priorities</option>

                {PRIORITY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p
              className="text-sm text-base-content/65"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-semibold text-base-content">
                {filteredIssues.length}
              </span>{" "}
              {filteredIssues.length === 1 ? "issue" : "issues"} found
              {isFetching && (
                <span className="ml-2 inline-flex items-center gap-1.5 text-primary">
                  <span className="loading loading-spinner loading-xs" />
                  Updating
                </span>
              )}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-ghost btn-sm text-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Issue cards */}
        <AnimatePresence mode="wait" initial={false}>
          {currentIssues.length > 0 ? (
            <motion.div
              key={`${activePage}-${search}-${category}-${status}-${priority}`}
              variants={reducedMotion ? undefined : containerVariants}
              initial={reducedMotion ? false : "hidden"}
              animate="visible"
              exit={reducedMotion ? undefined : "hidden"}
              className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {currentIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  userEmail={userEmail}
                  isVoting={votingIds.has(issue._id)}
                  voteError={voteErrors[issue._id]}
                  onUpvote={handleUpvote}
                  reducedMotion={reducedMotion}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
            />
          )}
        </AnimatePresence>

        {/* Pagination */}
        <Pagination
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={goToPage}
          reducedMotion={reducedMotion}
        />

        {/* Back to top */}
        {filteredIssues.length > ITEMS_PER_PAGE && (
          <p className="mt-5 text-center text-xs text-base-content/45">
            Showing {Math.min((activePage - 1) * ITEMS_PER_PAGE + 1, filteredIssues.length)}
            {"–"}
            {Math.min(activePage * ITEMS_PER_PAGE, filteredIssues.length)} of{" "}
            {filteredIssues.length} issues
          </p>
        )}
      </section>
    </main>
  );
};

export default AllIssues;