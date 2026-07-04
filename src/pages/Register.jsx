import React, { useEffect, useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import UseAuth from "../hooks/UseAuth";
import Swal from "sweetalert2";
import SocialLogin from "./SocialLogin";
import { FaUserCircle } from "react-icons/fa";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

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

const AvatarPreview = memo(function AvatarPreview({ src }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="w-24 h-24 rounded-full border border-base-300 flex items-center justify-center bg-base-200 overflow-hidden">
        {src ? (
          <img src={src} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <FaUserCircle className="text-6xl text-base-content/30" />
        )}
      </div>
    </div>
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
          autoComplete="new-password"
          className="input input-bordered w-full pr-10"
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "password-error" : undefined}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
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

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const { registerUser } = UseAuth();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const photoFile = watch("photo");

  useEffect(() => {
    const file = photoFile?.[0];
    if (!file) {
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("photo", { message: "Please choose an image file" });
      setPreview(null);
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError("photo", { message: "Image must be smaller than 5MB" });
      setPreview(null);
      return;
    }

    clearErrors("photo");
    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photoFile, setError, clearErrors]);

  const handleRegistration = useCallback(
    async (data) => {
      if (errors.photo) return;

      try {
        setLoading(true);

        Swal.fire({
          title: "Creating account...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const profileImg = data.photo?.[0] || null;
        const user = await registerUser(data.email, data.password, data.name, profileImg);

        Swal.fire({
          icon: "success",
          title: "Account created",
          text: `Welcome, ${user?.displayName || user?.email || "User"}`,
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Registration failed",
          text: err?.message || "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
    },
    [registerUser, navigate, errors.photo]
  );

  const handleDemoLogin = useCallback(() => {
    Swal.fire({
      icon: "info",
      title: "Demo Login",
      text: "This feature is for testing only",
      timer: 1500,
      showConfirmButton: false,
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-md bg-base-100 shadow-xl p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-base-content">
          Create Account
        </h1>

        <AvatarPreview src={preview} />

        <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4" noValidate>
          <div>
            <input
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              autoFocus
              className="input input-bordered w-full"
              disabled={loading}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
            />
            {errors.name && (
              <p id="name-error" className="text-error text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              className="input input-bordered w-full"
              disabled={loading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
              })}
            />
            {errors.email && (
              <p id="email-error" className="text-error text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              disabled={loading}
              {...register("photo")}
            />
            {errors.photo && (
              <p className="text-error text-xs mt-1">{errors.photo.message}</p>
            )}
          </div>

          <PasswordField register={register} error={errors.password} disabled={loading} />

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <button
          onClick={handleDemoLogin}
          className="btn btn-outline btn-primary w-full mt-3 text-sm"
          disabled={loading}
        >
          Demo Login
        </button>

        <p className="text-center mt-4 text-base-content">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center my-4 font-semibold text-base-content/50">OR</p>

        <SocialLogin />
      </div>
    </div>
  );
};

export default Register;