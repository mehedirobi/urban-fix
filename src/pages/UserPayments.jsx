import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  CreditCard,
  Download,
  Filter,
  History,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Swal from "sweetalert2";

import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { readCollection } from "../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const QUERY_KEY = "payments";
const CURRENCY = "USD";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const normalizeStatus = (status) =>
  String(status || "Unknown").trim().toLowerCase();

const getStatusClass = (status) => {
  switch (normalizeStatus(status)) {
    case "paid":
    case "succeeded":
    case "successful":
    case "completed":
      return "badge-success";

    case "pending":
    case "processing":
      return "badge-warning";

    case "failed":
    case "cancelled":
    case "canceled":
    case "refunded":
      return "badge-error";

    default:
      return "badge-ghost";
  }
};

const getPaymentAmount = (payment) => {
  const amount = Number(payment?.amount);
  return Number.isFinite(amount) ? amount : 0;
};

/* ---------------- Chart ---------------- */

const PaymentsChart = memo(function PaymentsChart({ data }) {
  const chartData = useMemo(
    () => ({
      labels: data.map((item) => item.month),
      datasets: [
        {
          label: "Payment amount",
          data: data.map((item) => item.amount),
          backgroundColor: "rgba(8, 127, 91, 0.72)",
          hoverBackgroundColor: "rgba(8, 127, 91, 0.92)",
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 48,
        },
      ],
    }),
    [data]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              ` ${formatCurrency(context.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "rgba(120, 120, 120, 0.9)",
          },
          border: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(120, 120, 120, 0.9)",
            callback: (value) => formatCurrency(value),
          },
          grid: {
            color: "rgba(120, 120, 120, 0.12)",
          },
          border: {
            display: false,
            dash: [4, 4],
          },
        },
      },
    }),
    []
  );

  if (!data.length) return null;

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold sm:text-xl">
            Payment activity
          </h3>
          <p className="mt-1 text-sm text-base-content/60">
            Monthly payment amounts for the selected filters.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-base-200 px-3 py-2 text-xs font-medium text-base-content/70">
          <Activity size={15} aria-hidden="true" />
          Monthly overview
        </div>
      </div>

      <div className="relative h-64 w-full sm:h-80">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
});

/* ---------------- Invoice ---------------- */

const PaymentRow = memo(function PaymentRow({ payment }) {
  const [downloading, setDownloading] = useState(false);

  const downloadInvoice = useCallback(async () => {
    if (downloading) return;

    setDownloading(true);

    let objectUrl;

    try {
      const [{ pdf }, { default: InvoicePDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../components/InvoicePDF"),
      ]);

      const blob = await pdf(
        <InvoicePDF payment={payment} />
      ).toBlob();

      objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Invoice-${payment._id || "payment"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Invoice download failed:", error);

      await Swal.fire({
        icon: "error",
        title: "Invoice unavailable",
        text: "The invoice could not be generated. Please try again.",
        confirmButtonText: "Close",
      });
    } finally {
      if (objectUrl) {
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }

      setDownloading(false);
    }
  }, [downloading, payment]);

  return (
    <tr className="transition-colors hover:bg-base-200/50">
      <td className="whitespace-nowrap text-sm">
        {formatDate(payment.createdAt)}
      </td>

      <td className="whitespace-nowrap font-semibold">
        {formatCurrency(getPaymentAmount(payment))}
      </td>

      <td className="min-w-36 max-w-56">
        <span
          className="block truncate font-mono text-xs text-base-content/70"
          title={payment.transactionId || "No transaction ID"}
        >
          {payment.transactionId || "—"}
        </span>
      </td>

      <td>
        <span
          className={`badge ${getStatusClass(payment.status)} badge-sm whitespace-nowrap`}
        >
          {payment.status || "Unknown"}
        </span>
      </td>

      <td>
        <button
          type="button"
          onClick={downloadInvoice}
          disabled={downloading}
          className="btn btn-ghost btn-sm gap-2"
          aria-label={`Download invoice for payment ${payment._id || ""}`}
        >
          {downloading ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}

          <span>{downloading ? "Preparing" : "Invoice"}</span>
        </button>
      </td>
    </tr>
  );
});

/* ---------------- States ---------------- */

function PaymentsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="skeleton mx-auto h-9 w-48" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>

      <div className="skeleton h-80 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}

function EmptyState({ onReset, hasFilters }) {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 px-5 py-14 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/60">
        <ReceiptText size={26} />
      </div>

      <h3 className="text-lg font-bold">No payments found</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-content/60">
        {hasFilters
          ? "No payments match your current filters. Try changing or clearing your filters."
          : "Your payment history will appear here after a payment record is created."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline btn-sm mt-5"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ---------------- Main ---------------- */

const UserPayments = () => {
  const { user } = UseAuth();
  const secureApi = useAxiosSecure();
  const queryClient = useQueryClient();

  const email = user?.email?.trim();

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMethod, setFilterMethod] = useState("All");

  const attemptedSessionRef = useRef(null);

  const [sessionId, setSessionId] = useState(() => {
    if (typeof window === "undefined") return null;

    return new URLSearchParams(window.location.search).get("session_id");
  });

  const queryKey = useMemo(
    () => [QUERY_KEY, email],
    [email]
  );

  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    enabled: Boolean(email),
    queryFn: async () => {
      const response = await secureApi.get(
        `/payments/${encodeURIComponent(email)}`
      );

      const records = readCollection(response.data);

      return Array.isArray(records) ? records : [];
    },
    staleTime: 30_000,
    retry: 1,
  });

  /* Verify a Stripe Checkout Session returned in the URL. */
  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId || !email) {
        throw new Error("A checkout session and signed-in user are required.");
      }

      const response = await secureApi.post("/payments/verify", {
        sessionId,
        email,
      });

      return response.data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard-overview", email],
        }),
      ]);

      const url = new URL(window.location.href);
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());

      setSessionId(null);
      attemptedSessionRef.current = null;

      await Swal.fire({
        icon: "success",
        title: "Payment verification completed",
        text: "Your payment verification request was processed. Check your payment history for the confirmed status.",
        confirmButtonText: "Continue",
      });
    },

    onError: async (err) => {
      console.error("Payment verification failed:", err);

      await Swal.fire({
        icon: "error",
        title: "Could not verify payment",
        text:
          "The checkout session could not be verified. If you were charged, check your payment history or contact support before trying again.",
        confirmButtonText: "Understood",
      });
    },
  });

  useEffect(() => {
    if (!sessionId || !email) return;
    if (verifyMutation.isPending) return;
    if (attemptedSessionRef.current === sessionId) return;

    attemptedSessionRef.current = sessionId;
    verifyMutation.mutate();
  }, [sessionId, email, verifyMutation.isPending, verifyMutation.mutate]);

  /* Keep the existing checkout endpoint. The backend must determine
     the actual amount and must not trust a client-supplied price. */
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error("Please sign in before starting checkout.");
      }

      return secureApi.post("/create-checkout-session", {
        cost: 100,
        userEmail: email,
      });
    },

    onSuccess: (response) => {
      const checkoutUrl = response.data?.url;

      if (!checkoutUrl) {
        Swal.fire({
          icon: "error",
          title: "Checkout unavailable",
          text: "A checkout link was not returned. Please try again later.",
        });
        return;
      }

      try {
        const url = new URL(checkoutUrl);

        if (url.protocol !== "https:") {
          throw new Error("Invalid checkout URL");
        }

        window.location.assign(url.toString());
      } catch (error) {
        console.error("Invalid checkout URL:", error);

        Swal.fire({
          icon: "error",
          title: "Checkout unavailable",
          text: "The checkout link is invalid. Please contact support.",
        });
      }
    },

    onError: (err) => {
      console.error("Checkout creation failed:", err);

      Swal.fire({
        icon: "error",
        title: "Could not start checkout",
        text: "Please try again. If the problem continues, contact support.",
      });
    },
  });

  const statusOptions = useMemo(
    () => [
      "All",
      ...new Set(
        payments.map((payment) => payment.status).filter(Boolean)
      ),
    ],
    [payments]
  );

  const methodOptions = useMemo(
    () => [
      "All",
      ...new Set(
        payments.map((payment) => payment.method).filter(Boolean)
      ),
    ],
    [payments]
  );

  const filteredPayments = useMemo(
    () =>
      payments
        .filter((payment) =>
          filterStatus === "All"
            ? true
            : payment.status === filterStatus
        )
        .filter((payment) =>
          filterMethod === "All"
            ? true
            : payment.method === filterMethod
        )
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();

          return dateB - dateA;
        }),
    [payments, filterStatus, filterMethod]
  );

  const summary = useMemo(() => {
    const paidPayments = filteredPayments.filter((payment) =>
      ["paid", "succeeded", "successful", "completed"].includes(
        normalizeStatus(payment.status)
      )
    );

    return {
      total: filteredPayments.length,
      paid: paidPayments.length,
      amount: paidPayments.reduce(
        (sum, payment) => sum + getPaymentAmount(payment),
        0
      ),
    };
  }, [filteredPayments]);

  const chartData = useMemo(() => {
    const grouped = new Map();

    filteredPayments.forEach((payment) => {
      if (!payment.createdAt) return;

      const date = new Date(payment.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const month = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!grouped.has(key)) {
        grouped.set(key, { month, amount: 0 });
      }

      const entry = grouped.get(key);
      entry.amount += getPaymentAmount(payment);
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);
  }, [filteredPayments]);

  const hasFilters =
    filterStatus !== "All" || filterMethod !== "All";

  const resetFilters = useCallback(() => {
    setFilterStatus("All");
    setFilterMethod("All");
  }, []);

  if (!email) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/60">
          <ShieldCheck size={30} />
        </div>

        <h2 className="text-2xl font-bold">Sign in to view payments</h2>

        <p className="mt-2 text-sm leading-6 text-base-content/60">
          Your payment history is available after you sign in to your account.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <PaymentsSkeleton />;
  }

  if (isError) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-error/10 text-error">
          <AlertCircle size={28} />
        </div>

        <h2 className="text-xl font-bold">Unable to load payments</h2>

        <p className="mt-2 text-sm leading-6 text-base-content/60">
          {error?.response?.status === 401 ||
          error?.response?.status === 403
            ? "Your session may have expired or you may not have permission to view these records."
            : "Something went wrong while loading your payment history."}
        </p>

        <button
          type="button"
          className="btn btn-primary mt-5 gap-2"
          onClick={() => refetch()}
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Wallet size={17} />
              Account billing
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Payments
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/60">
              Review your transactions, track payment statuses, and download invoices.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary gap-2 self-start sm:self-auto"
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending || verifyMutation.isPending}
          >
            {checkoutMutation.isPending ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <CreditCard size={17} />
            )}

            {checkoutMutation.isPending
              ? "Starting checkout..."
              : "Pay Now"}
          </button>
        </header>

        {/* Verification status */}
        {verifyMutation.isPending && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-info/20 bg-info/10 p-4 text-sm"
          >
            <LoaderCircle
              size={19}
              className="shrink-0 animate-spin text-info"
            />
            <span>
              Verifying your checkout session. Please do not retry the payment while verification is in progress.
            </span>
          </div>
        )}

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-base-content/60">
                Payments shown
              </p>
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <History size={19} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold tabular-nums">
              {summary.total}
            </p>

            <p className="mt-1 text-xs text-base-content/50">
              Matching your current filters
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-base-content/60">
                Successful payments
              </p>
              <div className="rounded-xl bg-success/10 p-2 text-success">
                <ShieldCheck size={19} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold tabular-nums">
              {summary.paid}
            </p>

            <p className="mt-1 text-xs text-base-content/50">
              Confirmed successful statuses
            </p>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-base-content/60">
                Successful amount
              </p>
              <div className="rounded-xl bg-success/10 p-2 text-success">
                <Wallet size={19} />
              </div>
            </div>

            <p className="mt-3 break-words text-2xl font-bold tabular-nums sm:text-3xl">
              {formatCurrency(summary.amount)}
            </p>

            <p className="mt-1 text-xs text-base-content/50">
              Based on the displayed payment records
            </p>
          </div>
        </section>

        {/* Chart */}
        {chartData.length > 0 && <PaymentsChart data={chartData} />}

        {/* Payment history */}
        <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-base-300 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Transaction history</h2>
                <p className="mt-1 text-sm text-base-content/60">
                  {filteredPayments.length}{" "}
                  {filteredPayments.length === 1
                    ? "transaction"
                    : "transactions"}
                  {isFetching ? " · Refreshing..." : ""}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm gap-2"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  size={15}
                  className={isFetching ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="form-control w-full sm:max-w-xs">
                <span className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Payment status
                  </span>
                </span>

                <select
                  className="select select-bordered w-full"
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control w-full sm:max-w-xs">
                <span className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Payment method
                  </span>
                </span>

                <select
                  className="select select-bordered w-full"
                  value={filterMethod}
                  onChange={(event) => setFilterMethod(event.target.value)}
                >
                  {methodOptions.map((method) => (
                    <option key={method} value={method}>
                      {method === "All" ? "All methods" : method}
                    </option>
                  ))}
                </select>
              </label>

              {hasFilters && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-auto gap-2 self-start sm:self-end"
                  onClick={resetFilters}
                >
                  <Filter size={15} />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {filteredPayments.length === 0 ? (
              <EmptyState
                onReset={resetFilters}
                hasFilters={hasFilters}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-base-content/60">
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.map((payment, index) => (
                      <PaymentRow
                        key={
                          payment._id ||
                          payment.transactionId ||
                          `${payment.createdAt}-${index}`
                        }
                        payment={payment}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <footer className="flex flex-col gap-2 rounded-xl border border-base-300 bg-base-100/70 p-4 text-xs leading-5 text-base-content/60 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} className="shrink-0 text-success" />
            Payment records are loaded from your account.
          </span>

          <span>
            Need help? Contact support before retrying a payment with an uncertain status.
          </span>
        </footer>
      </div>
    </main>
  );
};

export default UserPayments;