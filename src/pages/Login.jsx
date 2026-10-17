import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  CircleCheck,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";

import useAuth from "../hooks/UseAuth";
import { auth } from "../firebase/firebase.init";
import SocialLogin from "./SocialLogin";

const getFirebaseErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/email-not-verified":
      return "Your email is not verified yet. We sent a new verification link; verify your address before signing in.";

    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect. Check your details and try again.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait a while before trying again.";

    case "auth/user-disabled":
      return "This account has been disabled. Contact support for assistance.";

    case "auth/network-request-failed":
      return "A network error occurred. Check your internet connection and try again.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/operation-not-allowed":
      return "Email and password login is currently unavailable.";

    default:
      return (
        error?.response?.data?.message ||
        "Something went wrong. Please try again."
      );
  }
};

const getResetErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-not-found":
      return "If an account exists for this email, you may receive a reset email.";

    case "auth/too-many-requests":
      return "Too many requests. Please wait before trying again.";

    case "auth/network-request-failed":
      return "Check your internet connection and try again.";

    default:
      return "We couldn't process your request. Please try again later.";
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { signInUser } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: "easeOut" },
      };

  const handleLogin = useCallback(
    async (data) => {
      if (loading || resetLoading) return;

      setLoading(true);

      try {
        const signedInUser = await signInUser(data.email.trim(), data.password);

        if (!signedInUser) return;

        await Swal.fire({
          icon: "success",
          title: "Welcome back",
          text: "You have signed in successfully.",
          timer: 1300,
          showConfirmButton: false,
        });

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Login failed:", error);

        await Swal.fire({
          icon: "error",
          title: "Login unsuccessful",
          text: getFirebaseErrorMessage(error),
          confirmButtonColor: "#087f5b",
        });
      } finally {
        setLoading(false);
      }
    },
    [signInUser, navigate, loading, resetLoading]
  );

  const handlePasswordReset = async () => {
    if (loading || resetLoading) return;

    const email = getValues("email")?.trim();

    if (!email) {
      setError("email", {
        type: "manual",
        message: "Enter your email address first.",
      });

      document.getElementById("login-email")?.focus();
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      setError("email", {
        type: "manual",
        message: "Enter a valid email address.",
      });

      document.getElementById("login-email")?.focus();
      return;
    }

    clearErrors("email");
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      await Swal.fire({
        icon: "success",
        title: "Check your inbox",
        text: "If an account exists for this email, password-reset instructions will be sent.",
        confirmButtonColor: "#087f5b",
      });
    } catch (error) {
      console.error("Password reset failed:", error);

      await Swal.fire({
        icon: "error",
        title: "Password reset unsuccessful",
        text: getResetErrorMessage(error),
        confirmButtonColor: "#087f5b",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const emailRegistration = register("email", {
    required: "Email address is required.",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address.",
    },
    maxLength: {
      value: 254,
      message: "Email address is too long.",
    },
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-200/70 px-4 py-8 text-base-content sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left information panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-content lg:flex xl:p-12">
          <div
            aria-hidden="true"
            className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/15"
          />
          <div
            aria-hidden="true"
            className="absolute -right-10 top-36 h-44 w-44 rounded-full border border-white/15"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10"
          />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="UrbanFix home"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck size={25} />
              </span>

              <span className="text-2xl font-bold tracking-tight">
                UrbanFix
              </span>
            </Link>
          </div>

          <div className="relative z-10 my-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
              <CircleCheck size={14} />
              Building better communities
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight xl:text-5xl">
              Better cities start with
              <span className="mt-1 block text-white/75">
                people like you.
              </span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-primary-content/80 xl:text-base">
              Report local infrastructure problems, follow progress, and help
              make your community a better place to live.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Report community issues",
                "Track updates and progress",
                "See resolved problems",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <CircleCheck size={15} />
                  </span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-primary-content/65">
            A more connected community begins with one report.
          </p>
        </section>

        {/* Login form */}
        <motion.section
          {...animationProps}
          aria-labelledby="login-heading"
          className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-10 xl:p-12"
        >
          <div className="mb-8 lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-primary"
            >
              <ShieldCheck size={27} />
              UrbanFix
            </Link>
          </div>

          <Link
            to="/"
            className="mb-7 hidden w-fit items-center gap-2 text-sm text-base-content/55 transition-colors hover:text-primary lg:inline-flex"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Welcome back
            </p>

            <h2
              id="login-heading"
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Sign in to UrbanFix
            </h2>

            <p className="mt-3 text-sm leading-6 text-base-content/60">
              Access your account to manage reports and follow issue updates.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="space-y-5"
            noValidate
          >
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-sm font-semibold"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                />

                <input
                  {...emailRegistration}
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={loading || resetLoading}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "login-email-error" : undefined
                  }
                  className={`input input-bordered h-12 w-full rounded-xl pl-11 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${
                    errors.email ? "input-error" : ""
                  }`}
                />
              </div>

              {errors.email && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-xs leading-5 text-error"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-sm font-semibold"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                />

                <input
                  id="login-password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading || resetLoading}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                  className={`input input-bordered h-12 w-full rounded-xl pl-11 pr-12 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${
                    errors.password ? "input-error" : ""
                  }`}
                  {...register("password", {
                    required: "Password is required.",
                  })}
                />

                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  disabled={loading || resetLoading}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-base-content/50 transition-colors hover:bg-base-200 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  aria-pressed={passwordVisible}
                >
                  {passwordVisible ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  id="login-password-error"
                  role="alert"
                  className="text-xs leading-5 text-error"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password recovery */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={loading || resetLoading}
                className="text-sm font-semibold text-primary transition-colors hover:text-primary/75 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetLoading ? "Sending instructions..." : "Forgot password?"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || resetLoading}
              className="btn btn-primary h-12 min-h-12 w-full rounded-xl text-sm font-semibold normal-case shadow-sm transition-transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-base-300" />
            <span className="text-xs font-medium uppercase tracking-wider text-base-content/45">
              Or continue with
            </span>
            <span className="h-px flex-1 bg-base-300" />
          </div>

          <div className="[&>button]:w-full">
            <SocialLogin />
          </div>

          <p className="mt-7 text-center text-sm text-base-content/65">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-5 text-base-content/45">
            By signing in, you can access and manage your UrbanFix reports.
          </p>
        </motion.section>
      </div>
    </main>
  );
};

export default Login;