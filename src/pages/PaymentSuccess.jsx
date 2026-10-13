import { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, LoaderCircle, XCircle } from "lucide-react";
import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);
  const attemptedSession = useRef(null);
  const { user, refreshUser } = UseAuth();
  const api = useAxiosSecure();
  const queryClient = useQueryClient();

  const {
    mutate: verifyPayment,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: (checkoutSessionId) =>
      api.post("/payments/verify", { sessionId: checkoutSessionId, email: user.email }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments", user?.email] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-overview", user?.email] }),
        refreshUser(),
      ]);
    },
  });

  useEffect(() => {
    if (sessionId && user?.email && attemptedSession.current !== sessionId) {
      attemptedSession.current = sessionId;
      verifyPayment(sessionId);
    }
  }, [sessionId, user?.email, verifyPayment]);

  const verificationMessage = isPending
    ? "Verifying your payment securely with Stripe…"
    : isSuccess
      ? "Your payment is verified and has been recorded."
      : isError
        ? "We couldn't verify this payment. If you were charged, contact support before trying again."
        : "This checkout link does not include a payment session.";

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-base-200 px-4 py-10">
      <main
        className="bg-base-100 border border-base-300 max-w-md w-full rounded-2xl shadow-xl p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex justify-center mb-4">
          {isPending ? (
            <LoaderCircle className="w-20 h-20 text-primary animate-spin" aria-hidden="true" />
          ) : isSuccess ? (
            <CheckCircle className="w-20 h-20 text-success" aria-hidden="true" />
          ) : isError || !sessionId ? (
            <XCircle className="w-20 h-20 text-error" aria-hidden="true" />
          ) : null}
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {isPending ? "Verifying Payment" : isSuccess ? "Payment Verified" : "Payment Not Verified"}
        </h1>

        <p className="text-base-content/70 mb-6 leading-relaxed">{verificationMessage}</p>

        {sessionId && (
          <p className="break-all text-sm text-base-content/60 mb-6">
            Checkout reference: <span className="font-medium">{sessionId}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard/my-payment" className="btn btn-primary flex-1">
            View Payments
          </Link>
          {isError && sessionId && (
            <button
              type="button"
              onClick={() => verifyPayment(sessionId)}
              className="btn btn-outline flex-1"
            >
              Retry verification
            </button>
          )}
          <Link to="/dashboard" className="btn btn-outline flex-1">
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
