import axios from "axios";

export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://urban-fix-server.vercel.app"
).replace(/\/+$/, "");

const clientOptions = {
  baseURL: API_URL,
  timeout: 15000,
};

export const api = axios.create(clientOptions);
export const secureApi = axios.create(clientOptions);

export const readCollection = (payload) => {
  const collection = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.issues)
      ? payload.issues
      : payload?.data;

  if (!Array.isArray(collection)) {
    throw new Error("The service returned an unexpected response.");
  }

  return collection;
};

export const normalizeIssue = (issue) => {
  if (!issue || typeof issue !== "object" || Array.isArray(issue)) {
    return issue;
  }

  const upvoters = Array.isArray(issue.upvotes)
    ? issue.upvotes
    : Array.isArray(issue.upvotedUsers)
      ? issue.upvotedUsers
      : [];
  const reportedCount =
    issue.upvoteCount != null && Number.isFinite(Number(issue.upvoteCount))
      ? Number(issue.upvoteCount)
      : Array.isArray(issue.upvotes)
        ? upvoters.length
        : Number(issue.upvotes) || 0;

  return {
    ...issue,
    upvotes: reportedCount,
    upvotedUsers: upvoters.filter((email) => typeof email === "string"),
    timeline: Array.isArray(issue.timeline)
      ? issue.timeline.map((entry) => ({
          ...entry,
          date: entry?.date ?? entry?.timestamp ?? null,
        }))
      : issue.timeline,
  };
};

export const readIssueList = (payload) =>
  readCollection(payload)
    .filter((issue) => issue?._id)
    .map(normalizeIssue);

export const fetchAllPages = async (client, path, pageSize = 100) => {
  const fetchPage = (page) =>
    client.get(path, { params: { page, limit: pageSize } });
  const firstResponse = await fetchPage(1);
  const firstPageRecords = readCollection(firstResponse.data);
  const reportedPages = Number(
    firstResponse.data?.pagination?.totalPages ??
      firstResponse.data?.totalPages
  );
  const reportedTotal = Number(
    firstResponse.data?.pagination?.total ??
      firstResponse.data?.total
  );
  const totalPages = Number.isFinite(reportedPages)
    ? Math.max(1, Math.floor(reportedPages))
    : Number.isFinite(reportedTotal)
      ? Math.max(1, Math.ceil(reportedTotal / pageSize))
      : 1;
  const records = [...firstPageRecords];

  for (let firstPageNumber = 2; firstPageNumber <= totalPages; firstPageNumber += 4) {
    const pages = Array.from(
      { length: Math.min(4, totalPages - firstPageNumber + 1) },
      (_, index) => firstPageNumber + index
    );

    const responses = await Promise.all(
      pages.map(fetchPage)
    );

    records.push(
      ...responses.flatMap((response) => readCollection(response.data))
    );
  }

  return records;
};

export const fetchAllIssues = async (client) =>
  readIssueList(await fetchAllPages(client, "/issues"));

export const readRecord = (payload, key) => {
  const record = payload?.[key] ?? payload;

  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record)
  ) {
    throw new Error("The service returned an unexpected response.");
  }

  return record;
};