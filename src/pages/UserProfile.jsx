import { memo, useEffect, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  Crown,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Save,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { updateProfile } from "firebase/auth";

import UseAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Loader from "../components/Loader";
import { auth } from "../firebase/firebase.init";
import { readRecord } from "../lib/api";

const PLACEHOLDER_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=e5e7eb&color=374151&size=256";

const MAX_NAME_LENGTH = 80;
const MAX_PHOTO_URL_LENGTH = 2048;

const getAvatar = (name, photoURL) => {
  if (photoURL?.trim()) return photoURL.trim();

  if (name?.trim()) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name.trim()
    )}&background=e5e7eb&color=374151&size=256`;
  }

  return PLACEHOLDER_AVATAR;
};

const isValidPhotoURL = (value) => {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

/* ---------------- Avatar ---------------- */

const AvatarInput = memo(function AvatarInput({
  name,
  photoURL,
  onChange,
  disabled,
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photoURL, name]);

  const avatarSrc = imageError
    ? getAvatar(name, "")
    : getAvatar(name, photoURL);

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-base-300 bg-base-200/40 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="relative shrink-0">
        <img
          src={avatarSrc}
          alt={`${name || "User"}'s profile`}
          className="size-24 rounded-full border-4 border-base-100 object-cover shadow-md sm:size-28"
          onError={() => setImageError(true)}
        />

        <div className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-base-100 bg-primary text-primary-content">
          <Camera size={15} />
        </div>
      </div>

      <div className="w-full min-w-0">
        <h3 className="font-semibold">Profile photo</h3>
        <p className="mt-1 text-sm leading-5 text-base-content/60">
          Add a publicly accessible image URL to personalize your account.
        </p>

        <label className="form-control mt-4 w-full">
          <span className="label pb-1">
            <span className="label-text text-xs font-medium">
              Photo URL
            </span>
          </span>

          <input
            type="url"
            value={photoURL}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="input input-bordered w-full"
            maxLength={MAX_PHOTO_URL_LENGTH}
            disabled={disabled}
            autoComplete="url"
          />
        </label>

        {photoURL && (
          <button
            type="button"
            className="btn btn-ghost btn-xs mt-2 gap-1 text-base-content/60"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <X size={13} />
            Remove photo
          </button>
        )}
      </div>
    </div>
  );
});

/* ---------------- Profile Form ---------------- */

const ProfileForm = memo(function ProfileForm({
  initialData,
  email,
  saving,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    photoURL: initialData.photoURL || "",
  });

  const [errors, setErrors] = useState({});

  // Keep the form synchronized when refreshed server data changes.
  useEffect(() => {
    setForm({
      name: initialData.name || "",
      photoURL: initialData.photoURL || "",
    });
    setErrors({});
  }, [initialData.name, initialData.photoURL]);

  const updateField = useCallback((field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  }, []);

  const isDirty =
    form.name.trim() !== (initialData.name || "").trim() ||
    form.photoURL.trim() !== (initialData.photoURL || "").trim();

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const photoURL = form.photoURL.trim();
    const nextErrors = {};

    if (!name) {
      nextErrors.name = "Please enter your full name.";
    } else if (name.length > MAX_NAME_LENGTH) {
      nextErrors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
    }

    if (photoURL.length > MAX_PHOTO_URL_LENGTH) {
      nextErrors.photoURL = "The photo URL is too long.";
    } else if (!isValidPhotoURL(photoURL)) {
      nextErrors.photoURL = "Enter a valid HTTP or HTTPS image URL.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ name, photoURL });
  };

  const resetForm = () => {
    setForm({
      name: initialData.name || "",
      photoURL: initialData.photoURL || "",
    });
    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
    >
      <div className="border-b border-base-300 p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRound size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold">Personal information</h2>
            <p className="mt-1 text-sm text-base-content/60">
              Keep your account details up to date.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <AvatarInput
            name={form.name}
            photoURL={form.photoURL}
            onChange={(value) => updateField("photoURL", value)}
            disabled={saving}
          />

          <label className="form-control w-full">
            <span className="label pb-2">
              <span className="label-text font-semibold">Full name</span>
            </span>

            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Enter your full name"
              className={`input input-bordered w-full ${
                errors.name ? "input-error" : ""
              }`}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="name"
              required
              disabled={saving}
              aria-invalid={Boolean(errors.name)}
            />

            <div className="label">
              {errors.name ? (
                <span className="label-text-alt text-error">
                  {errors.name}
                </span>
              ) : (
                <span className="label-text-alt text-base-content/50">
                  Use the name you want displayed on your account.
                </span>
              )}

              <span className="label-text-alt text-base-content/50">
                {form.name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </label>

          <label className="form-control w-full">
            <span className="label pb-2">
              <span className="label-text font-semibold">Email address</span>
            </span>

            <div className="relative">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              />

              <input
                type="email"
                value={email}
                readOnly
                className="input input-bordered w-full cursor-not-allowed pl-10 opacity-75"
                autoComplete="email"
                aria-label="Account email address"
              />
            </div>

            <span className="label">
              <span className="label-text-alt text-base-content/50">
                Your email is managed by your authentication account.
              </span>
            </span>
          </label>

          {errors.photoURL && (
            <p role="alert" className="text-sm text-error">
              {errors.photoURL}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 bg-base-200/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <button
          type="button"
          onClick={resetForm}
          className="btn btn-ghost gap-2"
          disabled={saving || !isDirty}
        >
          <RefreshCw size={16} />
          Reset changes
        </button>

        <button
          type="submit"
          className="btn btn-primary gap-2"
          disabled={saving || !isDirty}
        >
          {saving ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Saving changes...
            </>
          ) : (
            <>
              <Save size={17} />
              Save profile
            </>
          )}
        </button>
      </div>
    </form>
  );
});

/* ---------------- Account Status ---------------- */

const AccountStatus = memo(function AccountStatus({ userInfo }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={19} className="text-primary" />
        <h2 className="text-lg font-bold">Account status</h2>
      </div>

      {userInfo.isBlocked && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 p-4"
        >
          <ShieldAlert size={21} className="mt-0.5 shrink-0 text-error" />

          <div>
            <h3 className="font-semibold text-error">Account restricted</h3>
            <p className="mt-1 text-sm leading-6 text-base-content/70">
              Your account is currently blocked. Contact support for assistance.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <UserRound size={19} />
          </div>

          <div>
            <p className="text-sm text-base-content/60">Account type</p>
            <p className="mt-1 font-semibold">
              {userInfo.isPremium ? "Premium user" : "Free user"}
            </p>
            <p className="mt-1 text-xs text-base-content/50">
              Based on your account record
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
          <div
            className={`rounded-lg p-2 ${
              userInfo.isBlocked
                ? "bg-error/10 text-error"
                : "bg-success/10 text-success"
            }`}
          >
            {userInfo.isBlocked ? (
              <ShieldAlert size={19} />
            ) : (
              <CheckCircle2 size={19} />
            )}
          </div>

          <div>
            <p className="text-sm text-base-content/60">Account access</p>
            <p className="mt-1 font-semibold">
              {userInfo.isBlocked ? "Restricted" : "Not blocked"}
            </p>
            <p className="mt-1 text-xs text-base-content/50">
              {userInfo.isBlocked
                ? "Contact support to review the restriction."
                : "No block is recorded on your account."}
            </p>
          </div>
        </div>

        {userInfo.isPremium && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4 sm:col-span-2">
            <div className="rounded-lg bg-warning/15 p-2 text-warning">
              <Crown size={19} />
            </div>

            <div>
              <p className="font-semibold">Premium account</p>
              <p className="mt-1 text-sm leading-6 text-base-content/60">
                Your account is marked as premium. Available features depend on your application's permissions and plan configuration.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

/* ---------------- Main Component ---------------- */

const UserProfile = () => {
  const { user, refreshUser } = UseAuth();
  const secureApi = useAxiosSecure();
  const queryClient = useQueryClient();

  const email = user?.email?.trim().toLowerCase();

  const queryKey = ["user-profile", email];

  const {
    data: userInfo,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    enabled: Boolean(email),
    queryFn: async () => {
      const response = await secureApi.get(
        `/users/${encodeURIComponent(email)}`
      );

      const data = readRecord(response.data, "user");

      if (!data) {
        throw new Error("Profile data was not returned.");
      }

      return {
        name: data.name || user?.displayName || "",
        photoURL: data.photoURL || user?.photoURL || "",
        isPremium: Boolean(data.isPremium),
        isBlocked: Boolean(data.isBlocked),
      };
    },
    staleTime: 60_000,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ name, photoURL }) => {
      if (!auth.currentUser) {
        throw new Error("Your authentication session has expired. Sign in again.");
      }

      // Update the server first. The backend must verify the Firebase ID token
      // and only allow the authenticated user to update permitted fields.
      await secureApi.patch(
        `/users/${encodeURIComponent(email)}`,
        { name, photoURL }
      );

      // Keep Firebase profile details synchronized.
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL || null,
      });

      return { name, photoURL };
    },

    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKey, (previous) => ({
        ...previous,
        ...updated,
      }));

      try {
        await refreshUser?.();
      } catch (error) {
        // The server and Firebase profile were updated already.
        console.error("Could not refresh auth context:", error);
      }

      await queryClient.invalidateQueries({
        queryKey: ["user-profile", email],
      });

      await Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your profile information has been saved.",
        timer: 1800,
        showConfirmButton: false,
      });
    },

    onError: async (error) => {
      console.error("Profile update failed:", error);

      await Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while updating your profile.",
        confirmButtonText: "Close",
      });

      // Re-fetch because the server update may have succeeded before a
      // subsequent Firebase profile update failed.
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSubmit = useCallback(
    (form) => {
      updateMutation.mutate(form);
    },
    [updateMutation.mutate]
  );

  if (!email) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/60">
          <UserRound size={27} />
        </div>

        <h2 className="text-xl font-bold">Sign in to view your profile</h2>
        <p className="mt-2 text-sm leading-6 text-base-content/60">
          Your account information will appear here after you sign in.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader />;

  if (isError || !userInfo) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-error/10 text-error">
          <ShieldAlert size={27} />
        </div>

        <h2 className="text-xl font-bold">Unable to load your profile</h2>

        <p className="mt-2 text-sm leading-6 text-base-content/60">
          Check your connection or account permissions, then try again.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-primary mt-5 gap-2"
        >
          {isFetching ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Try again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200/40">
      <div className="mx-auto max-w-4xl space-y-7 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header>
          <p className="mb-2 text-sm font-semibold text-primary">
            ACCOUNT SETTINGS
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/60">
            Manage your personal details and review your account status.
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <img
            src={getAvatar(userInfo.name, userInfo.photoURL)}
            alt=""
            className="size-16 rounded-full border border-base-300 object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getAvatar(userInfo.name, "");
            }}
          />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold">
              {userInfo.name || "User"}
            </h2>

            <p className="mt-1 break-all text-sm text-base-content/60">
              {email}
            </p>
          </div>

          <span
            className={`badge ${
              userInfo.isBlocked ? "badge-error" : "badge-success"
            } gap-1 self-start sm:self-center`}
          >
            {userInfo.isBlocked ? (
              <ShieldAlert size={13} />
            ) : (
              <CheckCircle2 size={13} />
            )}
            {userInfo.isBlocked ? "Restricted" : "Account active"}
          </span>
        </section>

        <ProfileForm
          initialData={userInfo}
          email={email}
          saving={updateMutation.isPending}
          onSubmit={handleSubmit}
        />

        <AccountStatus userInfo={userInfo} />
      </div>
    </main>
  );
};

export default UserProfile;