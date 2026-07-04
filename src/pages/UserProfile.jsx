import React, { useState, useEffect, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UseAuth from "../hooks/UseAuth";
import axios from "axios";
import Swal from "sweetalert2";
import Loader from "../components/Loader";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebase.init";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://urban-fix-server.vercel.app",
});

const PLACEHOLDER_AVATAR = "https://via.placeholder.com/100";

/* ---------------- Avatar Input ---------------- */

const AvatarInput = memo(function AvatarInput({ photoURL, onChange }) {
  const [imgSrc, setImgSrc] = useState(photoURL || PLACEHOLDER_AVATAR);

  useEffect(() => {
    setImgSrc(photoURL || PLACEHOLDER_AVATAR);
  }, [photoURL]);

  return (
    <div className="flex items-center gap-4">
      <img
        src={imgSrc}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border"
        onError={() => setImgSrc(PLACEHOLDER_AVATAR)}
      />

      <input
        type="text"
        value={photoURL}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Photo URL"
        className="input input-bordered w-full"
      />
    </div>
  );
});

/* ---------------- Profile Form ---------------- */

const ProfileForm = memo(function ProfileForm({ initialData, email, saving, onSubmit }) {
  const [form, setForm] = useState({
    name: initialData.name,
    photoURL: initialData.photoURL,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-base-100 p-6 shadow-xl rounded-lg">
      <AvatarInput
        photoURL={form.photoURL}
        onChange={(value) => setForm((prev) => ({ ...prev, photoURL: value }))}
      />

      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Full Name"
        className="input input-bordered w-full"
        required
      />

      <input type="email" value={email} disabled className="input input-bordered w-full bg-gray-200" />

      <div className="flex justify-between text-sm text-gray-700">
        <p>
          <strong>Status:</strong> {initialData.isPremium ? "Premium User" : "Free User"}
        </p>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={saving}>
        {saving ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
});

/* ---------------- Main Component ---------------- */

const UserProfile = () => {
  const { user, refreshUser } = UseAuth();
  const queryClient = useQueryClient();
  const email = user?.email?.toLowerCase();
  const queryKey = ["user-profile", email];

  const {
    data: userInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    enabled: !!email,
    queryFn: async () => {
      const res = await api.get(`/users/${encodeURIComponent(email)}`);
      const data = res.data || {};
      return {
        name: data.name || "",
        photoURL: data.photoURL || "",
        isPremium: Boolean(data.isPremium),
        isBlocked: Boolean(data.isBlocked),
      };
    },
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ name, photoURL }) => {
      await api.put(`/users/${encodeURIComponent(email)}`, { name, photoURL });

      if (!auth.currentUser) throw new Error("User not authenticated");
      await updateProfile(auth.currentUser, { displayName: name, photoURL });
      await refreshUser();

      return { name, photoURL };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, (old) => ({ ...old, ...updated }));
      Swal.fire({ icon: "success", title: "Profile Updated", timer: 1500, showConfirmButton: false });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err?.response?.data?.message || err?.message || "Something went wrong",
      });
    },
  });

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <p className="text-center py-10 text-red-500">
        Failed to load profile.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl text-center font-bold mb-8 text-primary">My Profile</h2>

      {userInfo.isBlocked && (
        <p className="text-red-500 font-semibold mb-4 text-center">
          Your account is blocked. Contact support.
        </p>
      )}

      <ProfileForm
        initialData={userInfo}
        email={user?.email || ""}
        saving={updateMutation.isPending}
        onSubmit={(form) => updateMutation.mutate(form)}
      />
    </div>
  );
};

export default UserProfile;