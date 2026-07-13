import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const axiosSecure = useAxiosSecure();

  // =========================
  // GOOGLE PROVIDER
  // =========================
  const googleProvider = useMemo(() => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
  }, []);

  // =========================
  // HELPERS
  // =========================
  const normalizeEmail = (email = "") => email.toLowerCase().trim();

  // 🔑 Save Firebase ID token to localStorage so axiosSecure can attach it
  const saveFirebaseToken = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return null;

    try {
      const token = await firebaseUser.getIdToken(true);
      localStorage.setItem("access-token", token);
      return token;
    } catch (error) {
      console.error("Failed to save Firebase token:", error);
      return null;
    }
  }, []);

  const clearFirebaseToken = useCallback(() => {
    localStorage.removeItem("access-token");
  }, []);

  const buildAppUser = useCallback((firebaseUser, dbUser = null) => {
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: normalizeEmail(firebaseUser.email || dbUser?.email || ""),
      displayName:
        dbUser?.name || firebaseUser.displayName || "UrbanFix User",
      name: dbUser?.name || firebaseUser.displayName || "UrbanFix User",
      photoURL: dbUser?.photoURL || firebaseUser.photoURL || "",
      phone: dbUser?.phone || "",
      role: (dbUser?.role || "citizen").toLowerCase().trim(),
      isBlocked: Boolean(dbUser?.isBlocked),
      isPremium: Boolean(dbUser?.isPremium),
      createdAt: dbUser?.createdAt || null,
      updatedAt: dbUser?.updatedAt || null,
      providerData: firebaseUser.providerData || [],
    };
  }, []);

  // =========================
  // SAVE USER TO DB
  // =========================
  const saveUserToDB = useCallback(
    async (firebaseUser) => {
      if (!firebaseUser?.email) return null;

      const payload = {
        email: normalizeEmail(firebaseUser.email),
        name: firebaseUser.displayName || "User",
        photoURL: firebaseUser.photoURL || "",
      };

      try {
        const res = await axiosSecure.post("/users", payload);
        return res.data;
      } catch (err) {
        console.error("User sync failed:", err);
        return null;
      }
    },
    [axiosSecure]
  );

  // =========================
  // GET USER FROM DB
  // =========================
  const getUserFromDB = useCallback(
    async (email) => {
      if (!email) return null;

      try {
        const res = await axiosSecure.get(`/users/${normalizeEmail(email)}`);
        return res.data;
      } catch (err) {
        console.error("Failed to fetch user from DB:", err);
        return null;
      }
    },
    [axiosSecure]
  );

  // =========================
  // SYNC USER + FETCH DB USER
  // =========================
  const syncAndGetDBUser = useCallback(
    async (firebaseUser) => {
      if (!firebaseUser?.email) return null;

      // ✅ token localStorage-e save howa nishchit kora hocche
      // je kono DB call (post/get) korar age
      await saveFirebaseToken(firebaseUser);

      await saveUserToDB(firebaseUser);
      const dbUser = await getUserFromDB(firebaseUser.email);
      return dbUser;
    },
    [saveFirebaseToken, saveUserToDB, getUserFromDB]
  );

  // =========================
  // HANDLE BLOCKED USER
  // =========================
  const handleBlockedUser = useCallback(
    async (dbUser) => {
      if (!dbUser?.isBlocked) return false;

      await signOut(auth);
      clearFirebaseToken();
      setUser(null);

      Swal.fire({
        icon: "error",
        title: "Account Blocked",
        text: "Your account has been blocked. Please contact support.",
        confirmButtonColor: "#ef4444",
      });

      return true;
    },
    [clearFirebaseToken]
  );

  // =========================
  // REGISTER
  // =========================
  const registerUser = async (email, password, name, profileImgFile) => {
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      let photoURL = "";

      if (profileImgFile) {
        const formData = new FormData();
        formData.append("image", profileImgFile);

        const imageApi = `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_image_host
        }`;

        const imgRes = await axios.post(imageApi, formData);
        photoURL = imgRes.data?.data?.url || "";
      }

      await updateProfile(result.user, {
        displayName: name,
        photoURL,
      });

      await auth.currentUser?.reload();
      const firebaseUser = auth.currentUser || result.user;

      // ✅ token save (registration flow-e explicit call, safety-r jonno)
      await saveFirebaseToken(firebaseUser);

      const dbUser = await syncAndGetDBUser({
        ...firebaseUser,
        displayName: name,
        photoURL,
      });

      if (await handleBlockedUser(dbUser)) return null;

      const mergedUser = buildAppUser(
        {
          ...firebaseUser,
          displayName: name,
          photoURL,
        },
        dbUser
      );

      setUser(mergedUser);

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        timer: 1500,
        showConfirmButton: false,
      });

      return mergedUser;
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
      const firebaseUser = result.user;

      // ✅ token save
      await saveFirebaseToken(firebaseUser);

      const dbUser = await syncAndGetDBUser(firebaseUser);

      if (await handleBlockedUser(dbUser)) return null;

      const mergedUser = buildAppUser(firebaseUser, dbUser);
      setUser(mergedUser);

      return mergedUser;
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
      const firebaseUser = result.user;

      // ✅ token save
      await saveFirebaseToken(firebaseUser);

      const dbUser = await syncAndGetDBUser(firebaseUser);

      if (await handleBlockedUser(dbUser)) return null;

      const mergedUser = buildAppUser(firebaseUser, dbUser);
      setUser(mergedUser);

      return mergedUser;
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
  const logout = async (showAlert = true) => {
    setLoading(true);

    try {
      await signOut(auth);
      clearFirebaseToken(); // ✅ token clear
      setUser(null);

      if (showAlert) {
        Swal.fire({
          icon: "success",
          title: "Logged out",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REFRESH USER
  // =========================
  const refreshUser = async () => {
    if (!auth.currentUser?.email) return null;

    try {
      setLoading(true);

      await auth.currentUser.reload();
      const firebaseUser = auth.currentUser;

      // ✅ token refresh + save
      await saveFirebaseToken(firebaseUser);

      const dbUser = await getUserFromDB(firebaseUser.email);

      if (await handleBlockedUser(dbUser)) return null;

      const mergedUser = buildAppUser(firebaseUser, dbUser);
      setUser(mergedUser);

      return mergedUser;
    } catch (error) {
      console.error("Refresh user failed:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // AUTH STATE LISTENER
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          clearFirebaseToken(); // ✅ logged out obosthay token clear thakbe
          setUser(null);
          setLoading(false);
          return;
        }

        // ✅ token save — DB call korar AGE, sobar age
        await saveFirebaseToken(currentUser);

        const dbUser = await syncAndGetDBUser(currentUser);

        if (await handleBlockedUser(dbUser)) {
          setLoading(false);
          return;
        }

        const mergedUser = buildAppUser(currentUser, dbUser);
        setUser(mergedUser);
      } catch (error) {
        console.error("Auth state sync error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [saveFirebaseToken, clearFirebaseToken, syncAndGetDBUser, buildAppUser, handleBlockedUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      registerUser,
      signInUser,
      signInGoogle,
      logout,
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;