import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onIdTokenChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase.init";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { uploadImage } from "../lib/uploadImage";

const TOKEN_KEY = "access-token";
const DB_USER_CACHE_TTL = 15_000;

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const getErrorMessage = (error) => {
  const messages = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/email-not-verified":
      "Your email is not verified yet. We sent a new verification link; verify your address before signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account was found with this email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/weak-password": "Please use a stronger password.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
    "auth/too-many-requests":
      "Too many attempts. Please wait and try again.",
  };

  return (
    messages[error?.code] ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const extractDBUser = (responseData) => {
  if (!responseData || typeof responseData !== "object") return null;

  const candidate = responseData.user ?? responseData;

  return candidate &&
    typeof candidate === "object" &&
    (candidate.email || candidate.uid || candidate._id)
    ? candidate
    : null;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const axiosSecure = useAxiosSecure();

  const mountedRef = useRef(false);
  const authInitializedRef = useRef(false);
  const authEventRef = useRef(0);
  const pendingOperationsRef = useRef(0);
  const blockedAlertRef = useRef(false);

  const dbUserCacheRef = useRef(new Map());
  const dbUserRequestsRef = useRef(new Map());

  const googleProvider = useMemo(() => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
  }, []);

  // --------------------------------------------------
  // STORAGE HELPERS
  // --------------------------------------------------

  const clearFirebaseToken = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Authentication should still work if storage is unavailable.
    }
  }, []);

  const syncFirebaseToken = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();

      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Firebase token synchronization failed:", error);

      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // Ignore storage errors.
      }
    }
  }, []);

  // --------------------------------------------------
  // LOADING HELPERS
  // --------------------------------------------------

  const beginOperation = useCallback(() => {
    pendingOperationsRef.current += 1;

    if (mountedRef.current) {
      setLoading(true);
    }
  }, []);

  const endOperation = useCallback(() => {
    pendingOperationsRef.current = Math.max(
      0,
      pendingOperationsRef.current - 1
    );

    if (mountedRef.current) {
      setLoading(
        !authInitializedRef.current ||
          pendingOperationsRef.current > 0
      );
    }
  }, []);

  // --------------------------------------------------
  // BUILD APPLICATION USER
  // --------------------------------------------------

  const buildAppUser = useCallback((firebaseUser, dbUser = null) => {
    if (!firebaseUser) return null;

    const name =
      dbUser?.name ||
      firebaseUser.displayName ||
      "UrbanFix User";

    return {
      uid: firebaseUser.uid,
      email: normalizeEmail(firebaseUser.email || dbUser?.email || ""),
      displayName: name,
      name,
      photoURL: dbUser?.photoURL || firebaseUser.photoURL || "",
      phone: dbUser?.phone || "",
      role:
        typeof dbUser?.role === "string"
          ? dbUser.role.trim().toLowerCase()
          : "citizen",
      isBlocked: Boolean(dbUser?.isBlocked),
      isPremium: Boolean(dbUser?.isPremium),
      createdAt: dbUser?.createdAt || null,
      updatedAt: dbUser?.updatedAt || null,
      providerData: firebaseUser.providerData || [],
    };
  }, []);

  // --------------------------------------------------
  // CREATE / SYNCHRONIZE DATABASE USER
  // --------------------------------------------------

  const saveUserToDB = useCallback(
    async (firebaseUser) => {
      if (!firebaseUser?.email) {
        throw new Error("A verified Firebase email is required.");
      }

      const payload = {
        email: normalizeEmail(firebaseUser.email),
        name: firebaseUser.displayName || "UrbanFix User",
        photoURL: firebaseUser.photoURL || "",
      };

      try {
        const response = await axiosSecure.post("/users", payload);
        const dbUser = extractDBUser(response.data);

        if (!dbUser) {
          throw new Error("The service did not return the synchronized user.");
        }

        return dbUser;
      } catch (error) {
        console.error("Failed to synchronize UrbanFix user:", error);
        throw error;
      }
    },
    [axiosSecure]
  );

  const syncAndGetDBUser = useCallback(
    async (firebaseUser, { force = false } = {}) => {
      if (!firebaseUser?.email || !firebaseUser?.uid) return null;

      const uid = firebaseUser.uid;
      const cached = dbUserCacheRef.current.get(uid);

      if (
        !force &&
        cached &&
        Date.now() - cached.timestamp < DB_USER_CACHE_TTL
      ) {
        return cached.user;
      }

      const existingRequest = dbUserRequestsRef.current.get(uid);

      if (existingRequest) {
        return existingRequest;
      }

      const request = (async () => {
        const dbUser = await saveUserToDB(firebaseUser);
        dbUserCacheRef.current.set(uid, {
          user: dbUser,
          timestamp: Date.now(),
        });

        return dbUser;
      })();

      dbUserRequestsRef.current.set(uid, request);

      try {
        return await request;
      } finally {
        if (dbUserRequestsRef.current.get(uid) === request) {
          dbUserRequestsRef.current.delete(uid);
        }
      }
    },
    [saveUserToDB]
  );

  // --------------------------------------------------
  // HANDLE BLOCKED ACCOUNTS
  // --------------------------------------------------

  const handleBlockedUser = useCallback(
    async (dbUser) => {
      if (!dbUser?.isBlocked) return false;

      setUser(null);
      clearFirebaseToken();

      try {
        await signOut(auth);
      } catch (error) {
        console.error("Failed to sign out blocked account:", error);
      }

      if (!blockedAlertRef.current) {
        blockedAlertRef.current = true;

        try {
          await Swal.fire({
            icon: "error",
            title: "Account Blocked",
            text: "Your account has been blocked. Please contact support.",
            confirmButtonColor: "#ef4444",
          });
        } finally {
          blockedAlertRef.current = false;
        }
      }

      return true;
    },
    [clearFirebaseToken]
  );

  // --------------------------------------------------
  // REGISTER WITH EMAIL AND PASSWORD
  // --------------------------------------------------

  const registerUser = useCallback(
    async (email, password, name, profileImgFile) => {
      beginOperation();
      let createdUser = null;

      try {
        const normalizedEmail = normalizeEmail(email);
        const cleanName = name?.trim();

        if (!normalizedEmail || !password || !cleanName) {
          throw new Error("Name, email, and password are required.");
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );
        createdUser = result.user;

        await sendEmailVerification(result.user);

        let photoURL = "";

        if (profileImgFile) {
          photoURL = await uploadImage(profileImgFile);
        }

        await updateProfile(result.user, {
          displayName: cleanName,
          photoURL,
        });

        await result.user.reload();

        const firebaseUser = auth.currentUser || result.user;

        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          clearFirebaseToken();

          if (mountedRef.current) {
            setUser(null);
          }

          return {
            requiresEmailVerification: true,
            email: normalizedEmail,
          };
        }

        // Clear any stale cache before synchronizing the new profile.
        dbUserCacheRef.current.delete(firebaseUser.uid);

        const dbUser = await syncAndGetDBUser(firebaseUser, {
          force: true,
        });

        if (await handleBlockedUser(dbUser)) return null;

        const mergedUser = buildAppUser(firebaseUser, dbUser);

        if (mountedRef.current) {
          setUser(mergedUser);
        }

        await Swal.fire({
          icon: "success",
          title: "Registration Successful",
          timer: 1500,
          showConfirmButton: false,
        });

        return mergedUser;
      } catch (error) {
        if (createdUser && !createdUser.emailVerified) {
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.error("Could not sign out unverified account:", signOutError);
          }
          clearFirebaseToken();
        }

        throw error;
      } finally {
        endOperation();
      }
    },
    [
      beginOperation,
      endOperation,
      syncAndGetDBUser,
      handleBlockedUser,
      buildAppUser,
      clearFirebaseToken,
    ]
  );

  // --------------------------------------------------
  // EMAIL AND PASSWORD LOGIN
  // --------------------------------------------------

  const signInUser = useCallback(
    async (email, password) => {
      beginOperation();

      try {
        const result = await signInWithEmailAndPassword(
          auth,
          normalizeEmail(email),
          password
        );

        await result.user.reload();
        const firebaseUser = auth.currentUser || result.user;

        if (!firebaseUser.emailVerified) {
          let verificationError;

          try {
            await sendEmailVerification(firebaseUser);
          } catch (error) {
            verificationError = error;
          }

          await signOut(auth);
          clearFirebaseToken();

          if (verificationError) {
            throw verificationError;
          }

          const error = new Error(
            "Your email is not verified yet. We sent a new verification link; verify your address before signing in."
          );
          error.code = "auth/email-not-verified";
          throw error;
        }

        const dbUser = await syncAndGetDBUser(firebaseUser);

        if (await handleBlockedUser(dbUser)) return null;

        const mergedUser = buildAppUser(firebaseUser, dbUser);

        if (mountedRef.current) {
          setUser(mergedUser);
        }

        return mergedUser;
      } finally {
        endOperation();
      }
    },
    [
      beginOperation,
      endOperation,
      syncAndGetDBUser,
      handleBlockedUser,
      buildAppUser,
      clearFirebaseToken,
    ]
  );

  // --------------------------------------------------
  // GOOGLE LOGIN
  // --------------------------------------------------

  const signInGoogle = useCallback(async () => {
    beginOperation();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        clearFirebaseToken();
        throw new Error("A verified email address is required to sign in.");
      }

      const dbUser = await syncAndGetDBUser(firebaseUser);

      if (await handleBlockedUser(dbUser)) return null;

      const mergedUser = buildAppUser(firebaseUser, dbUser);

      if (mountedRef.current) {
        setUser(mergedUser);
      }

      return mergedUser;
    } finally {
      endOperation();
    }
  }, [
    beginOperation,
    endOperation,
    googleProvider,
    syncAndGetDBUser,
    handleBlockedUser,
    buildAppUser,
    clearFirebaseToken,
  ]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = useCallback(
    async (showAlert = true) => {
      beginOperation();

      try {
        await signOut(auth);

        clearFirebaseToken();
        dbUserCacheRef.current.clear();

        if (mountedRef.current) {
          setUser(null);
        }

        if (showAlert) {
          await Swal.fire({
            icon: "success",
            title: "Logged out",
            timer: 1200,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Logout failed:", error);

        if (showAlert) {
          await Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: getErrorMessage(error),
          });
        }

        throw error;
      } finally {
        endOperation();
      }
    },
    [beginOperation, endOperation, clearFirebaseToken]
  );

  // --------------------------------------------------
  // REFRESH USER PROFILE
  // --------------------------------------------------

  const refreshUser = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      if (mountedRef.current) setUser(null);
      return null;
    }

    try {
      await currentUser.reload();

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        if (mountedRef.current) setUser(null);
        return null;
      }

      await syncFirebaseToken(firebaseUser);

      dbUserCacheRef.current.delete(firebaseUser.uid);

      const dbUser = await syncAndGetDBUser(firebaseUser, {
        force: true,
      });

      if (await handleBlockedUser(dbUser)) return null;

      const mergedUser = buildAppUser(firebaseUser, dbUser);

      if (mountedRef.current) {
        setUser(mergedUser);
      }

      return mergedUser;
    } catch (error) {
      console.error("Failed to refresh UrbanFix user:", error);
      return null;
    }
  }, [
    syncFirebaseToken,
    syncAndGetDBUser,
    handleBlockedUser,
    buildAppUser,
  ]);

  // --------------------------------------------------
  // FIREBASE AUTH AND TOKEN LISTENER
  // --------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const currentEvent = ++authEventRef.current;

      try {
        if (!firebaseUser) {
          clearFirebaseToken();
          dbUserCacheRef.current.clear();

          if (mountedRef.current && currentEvent === authEventRef.current) {
            setUser(null);
          }

          return;
        }

        if (!firebaseUser.emailVerified) {
          clearFirebaseToken();

          if (mountedRef.current && currentEvent === authEventRef.current) {
            setUser(null);
          }

          return;
        }

        await syncFirebaseToken(firebaseUser);

        const dbUser = await syncAndGetDBUser(firebaseUser);

        if (currentEvent !== authEventRef.current) return;

        if (await handleBlockedUser(dbUser)) return;

        const mergedUser = buildAppUser(firebaseUser, dbUser);

        if (mountedRef.current && currentEvent === authEventRef.current) {
          setUser(mergedUser);
        }
      } catch (error) {
        console.error("Firebase authentication state error:", error);

        if (mountedRef.current && currentEvent === authEventRef.current) {
          setUser(null);
        }
      } finally {
        if (currentEvent === authEventRef.current) {
          authInitializedRef.current = true;

          if (mountedRef.current) {
            setLoading(pendingOperationsRef.current > 0);
          }
        }
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [
    clearFirebaseToken,
    syncFirebaseToken,
    syncAndGetDBUser,
    handleBlockedUser,
    buildAppUser,
  ]);

  // --------------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------------

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
    [
      user,
      loading,
      registerUser,
      signInUser,
      signInGoogle,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;