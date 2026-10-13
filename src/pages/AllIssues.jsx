import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { api, fetchAllIssues } from "../lib/api";
import { AiFillLike } from "react-icons/ai";
import { HiOutlineRefresh, HiChevronLeft, HiChevronRight, HiOutlineSearch } from "react-icons/hi";

const ITEMS_PER_PAGE = 8;
const SEARCH_DEBOUNCE_MS = 250;

const normalizeStatus = (value) =>
  String(value || "").toLowerCase().replace(/[\s_-]+/g, "");

const NO_IMAGE_FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
      <rect width="600" height="350" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="#9ca3af" text-anchor="middle" dy=".3em">No image available</text>
    </svg>`
  );

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

const statusBadgeClass = (status) => {
  switch (normalizeStatus(status)) {
    case "resolved":
      return "badge-success";
    case "inprogress":
      return "badge-warning";
    case "rejected":
      return "badge-error";
    default:
      return "badge-primary";
  }
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-base-100 border border-base-300 rounded-xl shadow-sm min-h-[380px] overflow-hidden">
    <div className="h-48 bg-base-300 w-full" />
    <div className="p-4 space-y-2">
      <div className="h-6 bg-base-300 w-3/4 rounded" />
      <div className="h-4 bg-base-300 w-1/2 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-16 bg-base-300 rounded" />
        <div className="h-6 w-16 bg-base-300 rounded" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 w-20 bg-base-300 rounded" />
        <div className="h-8 w-20 bg-base-300 rounded" />
      </div>
    </div>
  </div>
);

// Windowed pagination: 1 ... 4 5 [6] 7 8 ... 20 
const buildPageWindow = (current, total) => {
  const delta = 1;
  const range = [];
  const withDots = [];
  let prev = null;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  for (const i of range) {
    if (prev !== null) {
      if (i - prev === 2) withDots.push(prev + 1);
      else if (i - prev !== 1) withDots.push("…");
    }
    withDots.push(i);
    prev = i;
  }
  return withDots;
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const AllIssues = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const secureApi = useAxiosSecure();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const gridTopRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: issues = [],
    isLoading: loading,
    isError: fetchError,
    refetch: fetchIssues,
  } = useQuery({
    queryKey: ["issues"],
    queryFn: () => fetchAllIssues(api),
    staleTime: 30_000,
  });

  const handleUpvote = async (issue) => {
    if (!user?.email) return navigate("/login");
    if (!issue?._id || issue.postedBy?.email === user.email) return;

    const alreadyUpvoted = issue.upvotedUsers?.includes(user.email);
    if (alreadyUpvoted) return;

    // Optimistic update, with a snapshot to roll back to on failure
    const queryKey = ["issues"];
    const previousIssues = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (prev = []) =>
      prev.map((i) =>
        i._id === issue._id
          ? {
              ...i,
              upvotes: (i.upvotes || 0) + 1,
              upvotedUsers: [...(i.upvotedUsers || []), user.email],
            }
          : i
      )
    );

    try {
      const res = await secureApi.put(`/issues/${issue._id}/upvote`, {
        userEmail: user.email,
      });
      const updatedIssue = res?.data;
      if (updatedIssue?._id) {
        queryClient.setQueryData(queryKey, (prev = []) =>
          prev.map((item) => (item._id === updatedIssue._id ? updatedIssue : item))
        );
      }
    } catch (err) {
      console.error("Upvote Failed:", err);
      queryClient.setQueryData(queryKey, previousIssues);
    }
  };

  const filtered = useMemo(() => {
    let data = [...issues];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }
    if (category) data = data.filter((i) => i.category?.toLowerCase() === category.toLowerCase());
    if (status) data = data.filter((i) => normalizeStatus(i.status) === normalizeStatus(status));
    if (priority) data = data.filter((i) => i.priority?.toLowerCase() === priority.toLowerCase());

    data.sort((a, b) => {
      if (a.priority === "High" && b.priority !== "High") return -1;
      if (a.priority !== "High" && b.priority === "High") return 1;
      return (b.upvotes || 0) - (a.upvotes || 0);
    });
    return data;
  }, [issues, search, category, status, priority]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const indexOfLast = activePage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentIssues = filtered.slice(indexOfFirst, indexOfLast);

  const hasActiveFilters = search || category || status || priority;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setStatus("");
    setPriority("");
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    gridTopRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-4">
        <p className="text-error font-semibold">Couldn’t load issues. Check the API connection and try again.</p>
        <button type="button" onClick={() => fetchIssues()} className="btn btn-outline btn-sm gap-2">
          <HiOutlineRefresh size={18} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-base-200" ref={gridTopRef}>
      <h2 className="text-3xl font-bold text-center mb-8 text-primary">Explore Issues</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
          <input
            type="text"
            placeholder="Search by title, location, description..."
            aria-label="Search issues"
            className="input input-bordered w-full text-sm pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="select select-bordered text-sm"
          >
            <option value="">Category</option>
            <option>Electricity</option>
            <option>Water Supply</option>
            <option>Road</option>
            <option>Cleanliness</option>
          </select>

          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="select select-bordered text-sm"
          >
            <option value="">Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Rejected</option>
          </select>

          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="select select-bordered text-sm"
          >
            <option value="">Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Normal</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 text-sm text-base-content/60">
        <span>
          {filtered.length} {filtered.length === 1 ? "issue" : "issues"} found
        </span>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="link link-primary">
            Clear filters
          </button>
        )}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activePage}-${search}-${category}-${status}-${priority}`}
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {currentIssues.length ? (
            currentIssues.map((issue) => {
              const alreadyUpvoted = issue.upvotedUsers?.includes(user?.email);
              const isOwnIssue = issue.postedBy?.email === user?.email;
              return (
                <motion.div
                  key={issue._id}
                  variants={cardVariants}
                  className="group card bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
                >
                  <figure className="overflow-hidden bg-base-200">
                    <img
                      src={issue.image || NO_IMAGE_FALLBACK}
                      alt={issue.title || "Issue"}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = NO_IMAGE_FALLBACK;
                      }}
                    />
                  </figure>
                  <div className="card-body flex flex-col">
                    <h3 className="card-title text-base-content line-clamp-1">{issue.title}</h3>
                    <p className="text-sm text-base-content/60 truncate">{issue.location}</p>
                    <div className="flex gap-2 flex-wrap my-2">
                      <span className="badge badge-primary badge-outline">{issue.category}</span>
                      <span className={`badge ${statusBadgeClass(issue.status)}`}>{issue.status}</span>
                      <span className={`badge ${priorityBadgeClass(issue.priority)}`}>
                        {issue.priority || "Normal"}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-auto flex-wrap">
                      <button
                        onClick={() => handleUpvote(issue)}
                        className={`btn btn-sm gap-1 transition-all duration-300 ${
                          alreadyUpvoted ? "btn-success text-white" : "btn-outline"
                        }`}
                        disabled={isOwnIssue}
                        title={isOwnIssue ? "You can't upvote your own issue" : undefined}
                      >
                        <AiFillLike className={alreadyUpvoted ? "text-white" : "text-yellow-400"} size={18} />
                        {issue.upvotes || 0}
                      </button>
                      <Link
                        to={`/issues/${issue._id}`}
                        className="btn btn-sm btn-primary transition-transform duration-300 group-hover:scale-105"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center gap-3 py-16 text-base-content/60">
              <p className="font-medium">No issues match your filters.</p>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="btn btn-outline btn-sm">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-1 flex-wrap">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => goToPage(Math.max(1, activePage - 1))}
            disabled={activePage === 1}
            aria-label="Previous page"
          >
            <HiChevronLeft size={16} />
          </button>

          {buildPageWindow(activePage, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className="px-2 text-base-content/40">
                …
              </span>
            ) : (
              <button
                key={p}
                className={`btn btn-sm ${activePage === p ? "btn-primary" : "btn-outline"}`}
                onClick={() => goToPage(p)}
                aria-current={activePage === p ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            className="btn btn-sm btn-outline"
            onClick={() => goToPage(Math.min(totalPages, activePage + 1))}
            disabled={activePage === totalPages}
            aria-label="Next page"
          >
            <HiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllIssues;