import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Home,
  LifeBuoy,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const PaymentCancel = () => {
  const reducedMotion = useReducedMotion();

  const animationProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35 },
      };

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-base-200/60 px-4 py-10 sm:px-6">
      <motion.section
        {...animationProps}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-base-300/70 bg-base-100 shadow-xl"
        aria-labelledby="payment-cancel-title"
        aria-describedby="payment-cancel-description"
      >
        {/* Header */}
        <div className="border-b border-base-300/70 px-6 py-5 sm:px-9">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-base-content/70 transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Return to UrbanFix home"
          >
            <ShieldCheck size={21} className="text-primary" />
            UrbanFix
          </Link>
        </div>

        {/* Main content */}
        <div
          className="px-6 py-9 text-center sm:px-9 sm:py-11"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-warning/10">
            <XCircle
              size={42}
              strokeWidth={1.8}
              className="text-warning"
              aria-hidden="true"
            />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-base-content/45">
            Checkout status
          </p>

          <h1
            id="payment-cancel-title"
            className="text-2xl font-extrabold tracking-tight text-base-content sm:text-3xl"
          >
            Payment not completed
          </h1>

          <p
            id="payment-cancel-description"
            className="mx-auto mt-3 max-w-sm text-sm leading-6 text-base-content/65 sm:text-base"
          >
            You left the checkout process before completing the payment. You
            can return to your account and try again whenever you're ready.
          </p>

          {/* Information panel */}
          <div className="mt-7 space-y-4 rounded-2xl border border-base-300 bg-base-200/40 p-4 text-left sm:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-base-100 text-base-content/65">
                <CreditCard size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-base-content">
                  Payment status
                </p>
                <p className="mt-1 text-sm leading-5 text-base-content/60">
                  Checkout cancelled or incomplete. Check your payment history
                  if you are unsure whether a transaction went through.
                </p>
              </div>
            </div>

            <div className="h-px bg-base-300" />

            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-base-100 text-base-content/65">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-base-content">
                  No need to start over immediately
                </p>
                <p className="mt-1 text-sm leading-5 text-base-content/60">
                  Review your existing payment records before retrying to avoid
                  accidentally making a duplicate payment.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard/my-payment"
              className="btn btn-primary flex-1 gap-2 rounded-xl"
            >
              View payments
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/"
              className="btn btn-outline flex-1 gap-2 rounded-xl"
            >
              <Home size={17} />
              Back to home
            </Link>
          </div>

          <Link
            to="/support"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-base-content/55 transition hover:text-primary"
          >
            <LifeBuoy size={16} />
            Need help with a payment?
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-base-300/70 px-6 py-4 text-center">
          <p className="text-xs leading-5 text-base-content/45">
            If your account was charged, check your payment history and contact
            support before attempting another payment.
          </p>
        </div>
      </motion.section>
    </main>
  );
};

export default PaymentCancel;