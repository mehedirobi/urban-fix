import React, { useEffect, useState, useMemo } from "react";
import { AuthContext } from "./AuthContext";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase/firebase.init";
import Swal from "sweetalert2";
import axios from "axios";
import useAxiosSecure from "../hooks/useAxiosSecure";

const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const axiosSecure = useAxiosSecure();

  // Google provider
  const googleProvider = useMemo(() => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
  }, []);

  // =========================
  // SAVE / SYNC USER TO DB
  // =========================
  const saveUserToDB = async (firebaseUser) => {
    if (!firebaseUser?.email) return;

    const payload = {
      email: firebaseUser.email,
      name: firebaseUser.displayName || "User",
      photoURL: firebaseUser.photoURL || "",
    };

    try {
      await axiosSecure.post("/users", payload);
    } catch (err) {
      console.error("User sync failed:", err);
    }
  };

  // =========================
  // FETCH USER FROM DB
  // =========================
  const fetchDBUser = async (email) => {
    if (!email) return null;

    try {
      const res = await axiosSecure.get(`/users/${email}`);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch DB user:", error);
      return null;
    }
  };

  // =========================
  // REGISTER
  // =========================
  const registerUser = async (email, password, name, profileImgFile) => {
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      let photoURL = "";

      // Upload image if exists
      if (profileImgFile) {
        const formData = new FormData();
        formData.append("image", profileImgFile);

        const imageApi = `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_image_host
        }`;

        const imgRes = await axios.post(imageApi, formData);
        photoURL = imgRes.data?.data?.url || "";
      }

      // Update Firebase profile
      await updateProfile(result.user, {
        displayName: name,
        photoURL,
      });

      // Fresh firebase user object
      const updatedFirebaseUser = {
        ...result.user,
        displayName: name,
        photoURL,
      };

      // Save to DB
      await saveUserToDB(updatedFirebaseUser);

      // Fetch DB user after save
      const dbUserData = await fetchDBUser(updatedFirebaseUser.email);

      setFirebaseUser(updatedFirebaseUser);
      setDbUser(dbUserData);

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        timer: 1500,
        showConfirmButton: false,
      });

      return updatedFirebaseUser;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN
  // =========================
  const signInUser = async (email, password) => {
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await saveUserToDB(result.user);
      const dbUserData = await fetchDBUser(result.user.email);

      setFirebaseUser(result.user);
      setDbUser(dbUserData);

      return result.user;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================
  const signInGoogle = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);

      await saveUserToDB(result.user);
      const dbUserData = await fetchDBUser(result.user.email);

      setFirebaseUser(result.user);
      setDbUser(dbUserData);

      return result.user;
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: err.message,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    setLoading(true);

    try {
      await signOut(auth);
      setFirebaseUser(null);
      setDbUser(null);

      Swal.fire({
        icon: "success",
        title: "Logged out",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REFRESH USER
  // =========================
  const refreshUser = async () => {
    if (!auth.currentUser) return;

    await auth.currentUser.reload();
    const refreshedFirebaseUser = auth.currentUser;

    setFirebaseUser(refreshedFirebaseUser);

    if (refreshedFirebaseUser?.email) {
      const dbUserData = await fetchDBUser(refreshedFirebaseUser.email);
      setDbUser(dbUserData);
    }
  };

  // =========================
  // AUTH STATE LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (!currentUser) {
        setFirebaseUser(null);
        setDbUser(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(currentUser);

      // ensure user exists in DB
      await saveUserToDB(currentUser);

      // fetch DB user
      const dbUserData = await fetchDBUser(currentUser.email);
      setDbUser(dbUserData);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // MERGED FINAL USER
  // =========================
  const user = useMemo(() => {
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: dbUser?.name || firebaseUser.displayName || "User",
      photoURL: dbUser?.photoURL || firebaseUser.photoURL || "",
      role: dbUser?.role || "citizen",
      phone: dbUser?.phone || "",
      isBlocked: dbUser?.isBlocked || false,
      isPremium: dbUser?.isPremium || false,
      createdAt: dbUser?.createdAt || null,
    };
  }, [firebaseUser, dbUser]);

  // =========================
  // CONTEXT VALUE
  // =========================
  const value = useMemo(
    () => ({
      user,
      loading,
      registerUser,
      signInUser,
      signInGoogle,
      logout,
      refreshUser,
      dbUser,
    }),
    [user, loading, dbUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;