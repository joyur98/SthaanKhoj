// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { verifyToken } from "../services/api";
import { sendVerificationEmail } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Force token refresh so custom claims are up to date
          await firebaseUser.getIdToken(true);
          setUser(firebaseUser);

          // Only fetch role for verified users (avoids unnecessary API calls)
          if (firebaseUser.emailVerified) {
            const data = await verifyToken();
            setRole(data.role ?? null);
          } else {
            setRole(null);
          }
        } catch (err) {
          console.error("Failed to verify token:", err);
          setUser(firebaseUser);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Signs in with email/password.
   * ⚠️ If the user is unverified, they stay signed in (so polling on /verify-email works)
   * but throws { code: 'auth/email-not-verified' } so Login.jsx can redirect them.
   * ProtectedRoute blocks them from accessing protected pages.
   */
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    // Reload to get the most up-to-date emailVerified flag
    await firebaseUser.reload();
    const refreshedUser = auth.currentUser;

    if (!refreshedUser.emailVerified) {
      // Do NOT sign out — the user stays signed in so VerifyEmail page can poll
      // and resend without requiring a password re-entry.
      const err = new Error("Email not verified.");
      err.code = "auth/email-not-verified";
      throw err;
    }

    // Verified — proceed normally
    await refreshedUser.getIdToken(true);
    const data = await verifyToken();
    setRole(data.role ?? null);
    return result;
  };

  const logout = () => {
    setRole(null);
    return signOut(auth);
  };

  /**
   * Sends (or re-sends) a verification email to the currently signed-in user.
   */
  const sendVerification = async (firebaseUser) => {
    await sendVerificationEmail(firebaseUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, login, logout, sendVerification }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};