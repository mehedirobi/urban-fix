import { useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";

const getErrorMessage = (error) => {
  const status = error?.response?.status;

  if (!error?.response) {
    return "We couldn't reach the payment service. Check your connection and try again.";
  }

  if (status === 401 || status === 403) {
    return "Your session may have expired. Log in again before verifying this payment.";
  }

  if (status === 404) {
    return "We couldn't find this checkout session. Confirm that you returned from the correct payment link.";
  }

  if (status === 409) {
    return "This payment could not be verified in its current state. Contact support if you were charged.";
  }

  return (
    error?.response?.data?.message ||
    "We couldn't verify this payment. If you were charged, contact support before paying again."
  );
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { user, refreshUser } = UseAuth();
  const api = useAxiosSecure();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();

  const attemptedSession = useRef(null);

  const {
    mutate: verifyPayment,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  } = useMutation({
    mutationFn: async (checkoutSessionId) => {
      if (!user?.email) {
        throw new Error("Please log in to verify your payment.");
      }

      const response = await api.post("/payments/verify", {
        sessionId: checkoutSessionId,
        email: user.email,
      });

      return response.data;
    },

    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({
          queryKey: ["payments", user?.email],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard-overview", user?.email],
        }),
        Promise.resolve().then(() => refreshUser?.()),
      ]);
    },
  });

  const startVerification = useCallback(() => {
    if (!sessionId || !user?.email || isPending) return;

    reset();
    attemptedSession.current = sessionId;
    verifyPayment(sessionId);
  }, [sessionId, user?.email, isPending, reset, verifyPayment]);

  useEffect(() => {
    if (!sessionId || !user?.email) return;
    if (attemptedSession.current === sessionId) return;

    attemptedSession.current = sessionId;
    verifyPayment(sessionId);
  }, [sessionId, user?.email, verifyPayment]);

  const status = !sessionId
    ? "missing"
    : isPending
      ? "pending"
      : isSuccess
        ? "success"
        : isError
          ? "error"
          : !user?.email
            ? "loading-user"
            : "pending";

  const statusConfig = {
    missing: {
      title: "Payment session not found",
      description:
        "This page is missing the checkout reference needed to verify your payment.",
      icon: CircleHelp,
      iconClass: "text-warning",
      iconBg: "bg-warning/10",
    },
    "loading-user": {
      title: "Preparing verification",
      description:
        "We're loading your account before checking the payment status.",
      icon: LoaderCircle,
      iconClass: "animate-spin text-primary",
      iconBg: "bg-primary/10",
    },
    pending: {
      title: "Verifying your payment",
      description:
        "We're checking the checkout session with the payment server. Please keep this page open.",
      icon: LoaderCircle,
      iconClass: "animate-spin text-primary",
      iconBg: "bg-primary/10",
    },
    success: {
      title: "Payment verified",
      description:
        "Your payment has been verified. Your payment records are being refreshed.",
      icon: CheckCircle2,
      iconClass: "text-success",
      iconBg: "bg-success/10",
    },
    error: {
      title: "Verification unsuccessful",
      description: getErrorMessage(error),
      icon: XCircle,
      iconClass: "text-error",
      iconBg: "bg-error/10",
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  const animationProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35 },
      };

  const maskedSession = sessionId
    ? `${sessionId.slice(0, 12)}••••••••${sessionId.slice(-6)}`
    : null;

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-base-200/60 px-4 py-10 sm:px-6">
      <motion.section
        {...animationProps}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-base-300/70 bg-base-100 shadow-xl"
        aria-labelledby="payment-status-title"
        aria-live="polite"
      >
        <div className="border-b border-base-300/70 px-6 py-5 sm:px-9">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-base-content/70 transition hover:text-primary"
          >
            <ShieldCheck size={20} className="text-primary" />
            UrbanFix
          </Link>
        </div>

        <div className="px-6 py-9 text-center sm:px-9 sm:py-11">
          <div
            className={`mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full ${statusConfig.iconBg}`}
          >
            <StatusIcon
              size={42}
              strokeWidth={1.8}
              className={statusConfig.iconClass}
              aria-hidden="true"
            />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-base-content/45">
            Payment status
          </p>

          <h1
            id="payment-status-title"
            className="text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl"
          >
            {statusConfig.title}
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-base-content/65 sm:text-base">
            {statusConfig.description}
          </p>

          {sessionId && (
            <div className="mt-7 rounded-2xl border border-base-300 bg-base-200/50 p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-base-100 text-base-content/65">
                  <CreditCard size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-base-content/50">
                    Checkout reference
                  </p>
                  <p
                    className="mt-1 break-all font-mono text-sm font-medium text-base-content"
                    title="Partially masked checkout reference"
                  >
                    {maskedSession}
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-success/10 p-4 text-left text-sm text-base-content">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-success"
              />
              <p className="leading-6">
                Verification succeeded. You can view your payment history for
                the recorded transaction.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="mt-5 rounded-xl border border-error/20 bg-error/5 p-4 text-left">
              <p className="text-sm font-semibold text-base-content">
                What should you do?
              </p>
              <p className="mt-1 text-sm leading-6 text-base-content/65">
                Don't make another payment just because verification failed.
                Check your payment history or contact support if money was
                deducted.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard/my-payment"
              className="btn btn-primary flex-1 gap-2 rounded-xl"
            >
              View payments
              <ArrowRight size={17} />
            </Link>

            {status === "error" && sessionId && user?.email && (
              <button
                type="button"
                onClick={startVerification}
                disabled={isPending}
                className="btn btn-outline flex-1 gap-2 rounded-xl"
              >
                <RefreshCw size={17} />
                Try again
              </button>
            )}

            {status === "missing" && (
              <Link
                to="/dashboard"
                className="btn btn-outline flex-1 gap-2 rounded-xl"
              >
                <ArrowLeft size={17} />
                Dashboard
              </Link>
            )}
          </div>

          {(status === "pending" || status === "loading-user") && (
            <p className="mt-5 text-xs leading-5 text-base-content/45">
              <LoaderCircle
                size={13}
                className="mr-1 inline animate-spin"
                aria-hidden="true"
              />
              Secure verification in progress. Avoid refreshing repeatedly.
            </p>
          )}
        </div>

        <div className="border-t border-base-300/70 px-6 py-4 text-center">
          <p className="text-xs text-base-content/45">
            Never share your payment details or account credentials with
            anyone.
          </p>
        </div>
      </motion.section>
    </main>
  );
};

export default PaymentSuccess;