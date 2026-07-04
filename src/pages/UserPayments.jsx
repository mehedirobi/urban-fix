import React, { useEffect, useMemo, useState, memo } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UseAuth from "../hooks/UseAuth";
import axios from "axios";
import Swal from "sweetalert2";
import InvoicePDF from "../components/InvoicePDF";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://urban-fix-server.vercel.app",
});

/* ---------------- Chart ---------------- */

const PaymentsChart = memo(function PaymentsChart({ data }) {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.month),
      datasets: [
        {
          label: "Payment Amount",
          data: data.map((d) => d.amount),
          backgroundColor: "rgba(59, 130, 246, 0.7)",
        },
      ],
    }),
    [data]
  );

  return <Bar data={chartData} />;
});

/* ---------------- Row ---------------- */

const PaymentRow = memo(function PaymentRow({ payment }) {
  return (
    <tr>
      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
      <td>${payment.amount}</td>
      <td>{payment.transactionId}</td>
      <td>
        <span className="badge badge-success">{payment.status}</span>
      </td>
      <td>
        <PDFDownloadLink
          document={<InvoicePDF payment={payment} />}
          fileName={`Invoice-${payment._id}.pdf`}
        >
          {({ loading }) => (loading ? "Preparing..." : "Download")}
        </PDFDownloadLink>
      </td>
    </tr>
  );
});

/* ---------------- Main ---------------- */

const UserPayments = () => {
  const { user } = UseAuth();
  const queryClient = useQueryClient();
  const email = user?.email;
  const queryKey = ["payments", email];

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMethod, setFilterMethod] = useState("All");

  const sessionId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session_id");
  }, []);

  const {
    data: payments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    enabled: !!email,
    queryFn: async () => {
      const res = await api.get(`/payments/${email}`);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.post("/payments/verify", { sessionId, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      // Strip session_id so a page refresh doesn't re-verify.
      const url = new URL(window.location.href);
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    },
    onError: (err) => {
      console.error("Payment verification error:", err);
      Swal.fire("Error", "Failed to verify payment. Please contact support if you were charged.", "error");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => api.post("/create-checkout-session", { cost: 100, userEmail: email }),
    onSuccess: (res) => {
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        Swal.fire("Error", "Could not start checkout. Please try again.", "error");
      }
    },
    onError: (err) => {
      console.error("Stripe error:", err);
      Swal.fire("Error", "Could not start checkout. Please try again.", "error");
    },
  });

  // Verify Stripe session exactly once when present.
  useEffect(() => {
    if (sessionId && email && !verifyMutation.isPending && !verifyMutation.isSuccess) {
      verifyMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, email]);

  const statusOptions = useMemo(
    () => ["All", ...new Set(payments.map((p) => p.status).filter(Boolean))],
    [payments]
  );
  const methodOptions = useMemo(
    () => ["All", ...new Set(payments.map((p) => p.method).filter(Boolean))],
    [payments]
  );

  const filteredPayments = useMemo(
    () =>
      payments
        .filter((p) => (filterStatus === "All" ? true : p.status === filterStatus))
        .filter((p) => (filterMethod === "All" ? true : p.method === filterMethod)),
    [payments, filterStatus, filterMethod]
  );

  const chartData = useMemo(() => {
    const grouped = {};
    filteredPayments.forEach((p) => {
      const month = new Date(p.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      grouped[month] = (grouped[month] || 0) + (p.amount || 0);
    });
    return Object.entries(grouped).map(([month, amount]) => ({ month, amount }));
  }, [filteredPayments]);

  if (!email) {
    return <p className="text-center py-10">Login first</p>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center py-10 text-red-500">Failed to load payments</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl text-center font-bold mb-8 text-primary">My Payments</h2>

      <div className="flex gap-3 justify-center mb-6 flex-wrap">
        <button
          onClick={() => checkoutMutation.mutate()}
          className="btn btn-primary"
          disabled={checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? "Redirecting..." : "Pay Now"}
        </button>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select">
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="select">
          {methodOptions.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {filteredPayments.length > 0 && <PaymentsChart data={chartData} />}

      {filteredPayments.length === 0 ? (
        <p className="text-center mt-6">No payments found</p>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Transaction</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <PaymentRow key={p._id} payment={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserPayments;