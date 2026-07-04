import React, { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import UseAuth from "../hooks/UseAuth";
import Swal from "sweetalert2";
import SocialLogin from "./SocialLogin";

const EyeIcon = memo(function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 4 10 8-.32 1.2-.86 2.32-1.57 3.31M6.53 6.53C4.6 7.9 3.13 9.8 2 12c1 4 5 8 10 8 1.6 0 3.11-.36 4.44-1" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

const PasswordField = memo(function PasswordField({ register, error, disabled }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          placeholder="Password"
          autoComplete="current-password"
          className="input input-bordered w-full pr-10"
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "password-error" : undefined}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters required" },
          })}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-3 flex items-center text-base-content/50 hover:text-base-content"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {error && (
        <p id="password-error" className="text-error text-xs mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
});

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const { signInUser } = UseAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (data) => {
      if (loading) return;

      try {
        setLoading(true);
        await signInUser(data.email, data.password);

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Welcome back!",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: err?.message || "Please try again",
        });
      } finally {
        setLoading(false);
      }
    },
    [signInUser, navigate, loading]
  );

  const handleDemoLogin = useCallback(() => {
    Swal.fire({
      icon: "info",
      title: "Demo Mode",
      text: "This is a UI-only demo login",
      timer: 1500,
      showConfirmButton: false,
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 shadow-xl p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-base-content">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4" noValidate>
          <div>
            <input
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              autoFocus
              className="input input-bordered w-full"
              disabled={loading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && (
              <p id="email-error" className="text-error text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <PasswordField register={register} error={errors.password} disabled={loading} />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-base-content">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>

        <p className="text-center my-4 font-semibold text-base-content/50">OR</p>

        <SocialLogin />
      </div>
    </div>
  );
};

export default Login;