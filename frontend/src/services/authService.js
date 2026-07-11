// frontend/src/services/authService.js
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
export const getAuthErrorMessage = (code) => {
  const messages = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/email-already-in-use":
      "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 8 characters.",
    "auth/email-not-verified":
      "Please verify your email before logging in. Check your inbox.",
    "auth/popup-closed-by-user": "",
  };
  return messages[code] || null;
};

/**
 * Sends a Firebase email verification to the given user.
 */
export const sendVerificationEmail = async (user) => {
  await sendEmailVerification(user, {
    url: window.location.origin + "/login",
    handleCodeInApp: false,
  });
};

/**
 * Reloads the Firebase user profile and returns current emailVerified status.
 */
export const reloadAndCheckVerification = async (user) => {
  await user.reload();
  // After reload, re-read from auth.currentUser which is the refreshed object
  return auth.currentUser?.emailVerified ?? false;
};

/**
 * Signs in silently to get a user object, sends a verification email,
 * then signs out again. Used for resending verification from the verify page.
 */
export const resendVerificationForEmail = async (email, password) => {
  let tempUser = null;
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    tempUser = credential.user;
    if (tempUser.emailVerified) {
      // Already verified — no need to send
      return { alreadyVerified: true };
    }
    await sendVerificationEmail(tempUser);
    return { alreadyVerified: false };
  } finally {
    // Always sign out after the operation to keep the user "logged out" until verified
    if (tempUser && !tempUser.emailVerified) {
      await signOut(auth);
    }
  }
};
