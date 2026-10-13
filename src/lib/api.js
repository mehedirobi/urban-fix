import axios from "axios";

export const API_URL = (
  import.meta.env.VITE_API_URL || "https://urban-fix-server.vercel.app"
).replace(/\/+$/, "");

const clientOptions = {
  baseURL: API_URL,
  timeout: 15000,
};

export const api = axios.create(clientOptions);
export const secureApi = axios.create(clientOptions);

export const readCollection = (payload) => {
  const collection = [
    payload,
    payload?.data,
    payload?.data?.issues,
    payload?.data?.users,
    payload?.data?.payments,
    payload?.data?.items,
    payload?.items,
  ].find(Array.isArray);

  if (!collection) {
    throw new Error("The service returned an unexpected response.");
  }

  return collection;
};

export const readIssueList = (payload) =>
  readCollection(payload).filter((issue) => issue?._id);

export const fetchAllIssues = async (client) => {
  const pageSize = 100;
  const firstResponse = await client.get("/issues", {
    params: { page: 1, limit: pageSize },
  });
  const issues = readIssueList(firstResponse.data);
  const reportedPages = Number(firstResponse.data?.pagination?.totalPages);
  const totalPages = Number.isFinite(reportedPages)
    ? Math.max(1, Math.floor(reportedPages))
    : 1;

  for (let firstPage = 2; firstPage <= totalPages; firstPage += 4) {
    const pages = Array.from(
      { length: Math.min(4, totalPages - firstPage + 1) },
      (_, index) => firstPage + index
    );
    const responses = await Promise.all(
      pages.map((page) =>
        client.get("/issues", { params: { page, limit: pageSize } })
      )
    );
    issues.push(...responses.flatMap((response) => readIssueList(response.data)));
  }

  return issues;
};

export const readRecord = (payload, key) => {
  const record = payload?.[key] ?? payload?.data?.[key] ?? payload?.data ?? payload;
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("The service returned an unexpected response.");
  }
  return record;
};
