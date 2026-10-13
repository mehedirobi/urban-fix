import { createContext, useContext } from "react";

/**
 * Shared authentication context for UrbanFix.
 * The AuthProvider supplies the current user and authentication methods.
 */
export const AuthContext = createContext(undefined);

/**
 * Access authentication state and methods.
 *
 * Must be used inside <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth() must be used within an AuthProvider. " +
        "Wrap your component tree with <AuthProvider>."
    );
  }

  return context;
};

export default AuthContext;