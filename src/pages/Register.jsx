import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import UseAuth from "../hooks/UseAuth";
import SocialLogin from "./SocialLogin";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getRegistrationErrorMessage = (error) => {
  const messages = {
    "auth/email-already-in-use":
      "An account with this email already exists. Try logging in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password":
      "Your password is too weak. Please choose a stronger password.",
    "auth/operation-not-allowed":
      "Email and password registration is currently unavailable.",
    "auth/network-request-failed":
      "Network error. Check your internet connection and try again.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment before trying again.",
    "auth/invalid-api-key":
      "Authentication is temporarily unavailable. Please try again later.",
  };

  return (
    messages[error?.code] ||
    error?.message ||
    "We couldn't create your account. Please try again."
  );
};

const getAnimationProps = (reducedMotion, delay = 0) =>
  reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay },
      };

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    setFocus,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      photo: undefined,
    },
  });

  const { registerUser } = UseAuth();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const photoFiles = watch("photo");
  const selectedPhoto = photoFiles?.[0];

  useEffect(() => {
    if (!selectedPhoto) {
      setPreview("");
      clearErrors("photo");
      return undefined;
    }

    if (!selectedPhoto.type.startsWith("image/")) {
      setPreview("");
      setError("photo", {
        type: "validate",
        message: "Please select a valid image file.",
      });
      return undefined;
    }

    if (selectedPhoto.size > MAX_PHOTO_SIZE) {
      setPreview("");
      setError("photo", {
        type: "validate",
        message: "Your profile image must be 5 MB or smaller.",
      });
      return undefined;
    }

    clearErrors("photo");

    const objectUrl = URL.createObjectURL(selectedPhoto);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhoto, setError, clearErrors]);

  const handleRegistration = useCallback(
    async (data) => {
      if (loading) return;

      const photo = data.photo?.[0] || null;

      if (photo && !photo.type.startsWith("image/")) {
        setError("photo", {
          type: "validate",
          message: "Please select a valid image file.",
        });
        return;
      }

      if (photo && photo.size > MAX_PHOTO_SIZE) {
        setError("photo", {
          type: "validate",
          message: "Your profile image must be 5 MB or smaller.",
        });
        return;
      }

      setLoading(true);

      try {
        Swal.fire({
          title: "Creating your account",
          text: "Please wait while we set up your profile.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading(),
        });

        const user = await registerUser(
          data.email.trim(),
          data.password,
          data.name.trim(),
          photo
        );

        await Swal.fire({
          icon: "success",
          title: "Account created",
          text: `Welcome, ${
            user?.displayName || data.name.trim() || user?.email || "User"
          }!`,
          timer: 1800,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Registration failed:", error);

        await Swal.fire({
          icon: "error",
          title: "Registration failed",
          text: getRegistrationErrorMessage(error),
          confirmButtonText: "Try again",
          confirmButtonColor: "#087f5b",
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, registerUser, navigate, setError]
  );

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      clearErrors("photo");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("photo", {
        type: "validate",
        message: "Please select a valid image file.",
      });
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError("photo", {
        type: "validate",
        message: "Your profile image must be 5 MB or smaller.",
      });
      return;
    }

    clearErrors("photo");
  };

  return (
    <main className="min-h-screen bg-base-200/60 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-base-300/70 bg-base-100 shadow-xl lg:min-h-[720px] lg:grid-cols-2">
        {/* Branding panel */}
        <motion.section
          {...getAnimationProps(reducedMotion)}
          className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-content lg:flex xl:p-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full border-[48px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full border-[60px] border-white/10"
          />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label="UrbanFix home"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                <ShieldCheck size={28} />
              </span>
              <span className="text-2xl font-extrabold tracking-tight">
                UrbanFix
              </span>
            </Link>

            <div className="mt-24 max-w-md">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium">
                <Users size={16} />
                Built for better communities
              </p>

              <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                Make your community a better place.
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-primary-content/80">
                Create an account to report civic issues, follow progress, and
                help bring attention to problems in your neighborhood.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 space-y-5">
            {[
              "Report problems in your area",
              "Track issue status and updates",
              "Help build a better community",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="shrink-0" size={20} />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}

            <p className="border-t border-white/20 pt-6 text-sm text-primary-content/70">
              Small reports. Meaningful change.
            </p>
          </div>
        </motion.section>

        {/* Registration form */}
        <section className="flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <motion.div
            {...getAnimationProps(reducedMotion, 0.05)}
            className="w-full max-w-md"
          >
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 transition hover:text-primary lg:hidden"
            >
              <ShieldCheck size={20} className="text-primary" />
              UrbanFix
            </Link>

            <div className="mb-7">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <UserRoundPlus size={25} />
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
                Create account
              </h2>

              <p className="mt-2 text-sm leading-6 text-base-content/60 sm:text-base">
                Join UrbanFix and help improve your community.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleRegistration)}
              className="space-y-4"
              noValidate
            >
              {/* Profile photo */}
              <div>
                <label
                  htmlFor="register-photo"
                  className="mb-2 block text-sm font-semibold text-base-content"
                >
                  Profile photo{" "}
                  <span className="font-normal text-base-content/50">
                    (optional)
                  </span>
                </label>

                <div className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-200/30 p-3">
                  <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-base-300 bg-base-200">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Selected profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound
                        size={30}
                        className="text-base-content/35"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="register-photo"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
                    >
                      <ImagePlus size={16} />
                      Choose image
                    </label>

                    <p className="mt-1.5 text-xs text-base-content/50">
                      JPG, PNG, or another supported image · Max 5 MB
                    </p>
                  </div>

                  {preview && (
                    <button
                      type="button"
                      aria-label="Remove selected profile photo"
                      disabled={loading}
                      onClick={() => {
                        const input = document.getElementById("register-photo");
                        if (input) {
                          input.value = "";
                          input.dispatchEvent(
                            new Event("change", { bubbles: true })
                          );
                        }
                        setPreview("");
                        clearErrors("photo");
                      }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base-content/50 transition hover:bg-base-200 hover:text-error"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>

                <input
                  id="register-photo"
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  aria-describedby={errors.photo ? "register-photo-error" : undefined}
                  className="sr-only"
                  {...register("photo", {
                    onChange: handlePhotoChange,
                  })}
                />

                {errors.photo && (
                  <p
                    id="register-photo-error"
                    role="alert"
                    className="mt-1.5 text-xs text-error"
                  >
                    {errors.photo.message}
                  </p>
                )}
              </div>

              {/* Full name */}
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-1.5 block text-sm font-semibold text-base-content"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    autoFocus
                    disabled={loading}
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? "register-name-error" : undefined
                    }
                    className={`input input-bordered w-full pl-11 ${
                      errors.name ? "input-error" : "focus:border-primary"
                    }`}
                    {...register("name", {
                      required: "Your name is required.",
                      minLength: {
                        value: 2,
                        message: "Name must contain at least 2 characters.",
                      },
                      maxLength: {
                        value: 80,
                        message: "Name must be 80 characters or fewer.",
                      },
                      validate: (value) =>
                        value.trim().length >= 2 ||
                        "Please enter a valid name.",
                    })}
                  />
                </div>

                {errors.name && (
                  <p
                    id="register-name-error"
                    role="alert"
                    className="mt-1.5 text-xs text-error"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-1.5 block text-sm font-semibold text-base-content"
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
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "register-email-error" : undefined
                    }
                    className={`input input-bordered w-full pl-11 ${
                      errors.email ? "input-error" : "focus:border-primary"
                    }`}
                    {...register("email", {
                      required: "Your email address is required.",
                      pattern: {
                        value: EMAIL_PATTERN,
                        message: "Please enter a valid email address.",
                      },
                      setValueAs: (value) => value.trim(),
                    })}
                  />
                </div>

                {errors.email && (
                  <p
                    id="register-email-error"
                    role="alert"
                    className="mt-1.5 text-xs text-error"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-1.5 block text-sm font-semibold text-base-content"
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
                    id="register-password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    disabled={loading}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password
                        ? "register-password-error"
                        : "register-password-hint"
                    }
                    className={`input input-bordered w-full px-11 ${
                      errors.password ? "input-error" : "focus:border-primary"
                    }`}
                    {...register("password", {
                      required: "A password is required.",
                      minLength: {
                        value: 6,
                        message: "Password must contain at least 6 characters.",
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    disabled={loading}
                    aria-label={
                      passwordVisible ? "Hide password" : "Show password"
                    }
                    aria-pressed={passwordVisible}
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-base-content/50 transition hover:bg-base-200 hover:text-base-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {passwordVisible ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password ? (
                  <p
                    id="register-password-error"
                    role="alert"
                    className="mt-1.5 text-xs text-error"
                  >
                    {errors.password.message}
                  </p>
                ) : (
                  <p
                    id="register-password-hint"
                    className="mt-1.5 text-xs text-base-content/50"
                  >
                    Use at least 6 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary mt-2 w-full gap-2 rounded-xl text-base font-semibold shadow-sm transition hover:shadow-md"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-sm leading-6 text-base-content/60">
                By creating an account, you agree to use UrbanFix responsibly
                and provide accurate information.
              </p>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-base-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-base-300" />
            </div>

            <div className={loading ? "pointer-events-none opacity-60" : ""}>
              <SocialLogin />
            </div>

            <p className="mt-7 text-center text-sm text-base-content/70">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-primary transition hover:underline"
              >
                Log in
              </Link>
            </p>

            <p className="mt-5 text-center text-xs text-base-content/40">
              © {new Date().getFullYear()} UrbanFix. Building better communities.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
};

export default Register;