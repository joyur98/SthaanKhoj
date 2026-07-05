import { Router } from "express";
import rateLimit from "express-rate-limit";
import { auth, db } from "../firebase/firebaseAdmin.js";
import { authenticate } from "../middleware/auth.js";
import { registerRules, validate } from "../middleware/validate.js";

const router = Router();

const ALLOWED_SELF_ROLES = ["student", "landlord"]; // never "admin" — admins are bootstrapped out-of-band
const ALLOWED_ROLES = ["student", "landlord", "admin"];

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many auth attempts, please try again later." },
});

/**
 * POST /api/auth/register
 * Creates Firebase Auth user + Firestore profile.
 * Password hashing is handled by Firebase Auth internally.
 */
router.post("/register", authLimiter, registerRules, validate, async (req, res, next) => {
  let createdUid = null;
  try {
    const { email, password, fullName, role, phone } = req.body;

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
      phoneNumber: phone || undefined,
    });
    createdUid = userRecord.uid;

    // Set custom claim so role is available in JWT
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Create Firestore profile
    const now = new Date().toISOString();
    const profile = {
      uid:       userRecord.uid,
      email,
      fullName,
      role,
      phone:     phone || null,
      isActive:  true,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("users").doc(userRecord.uid).set(profile);

    // Create role-specific sub-document
    const subCollection = role === "student" ? "students" : "landlords";
    await db.collection(subCollection).doc(userRecord.uid).set({
      uid: userRecord.uid,
      ...profile,
      ...(role === "student"  ? { savedProperties: [], bookings: [] } : {}),
      ...(role === "landlord" ? { properties: [], verified: false, isFlagged: false, fraudFlags: [] } : {}),
    });

    res.status(201).json({
      message: "Account created successfully.",
      uid:  userRecord.uid,
      role,
    });
  } catch (err) {
    // Surface Firebase duplicate-email error clearly
    if (err.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Best-effort rollback so a mid-failure doesn't leave an orphaned Auth user
    // with no matching Firestore profile (which would break login/role checks later).
    if (createdUid) {
      try {
        await auth.deleteUser(createdUid);
      } catch (cleanupErr) {
        console.error("[register] Rollback failed for uid", createdUid, cleanupErr.message);
      }
    }
    next(err);
  }
});

/**
 * POST /api/auth/google-signin
 * Syncs a Google-authenticated Firebase user into Firestore.
 *
 * SECURITY: uid/email MUST come from the verified ID token (req.user),
 * never from the request body — otherwise any caller could impersonate
 * an arbitrary uid or self-assign an arbitrary role, including "admin".
 *
 * ROLE HANDLING:
 * - Existing users: role is never taken from the request; it's read from
 *   their existing profile, full stop.
 * - New users: role MUST be present and MUST be "student" or "landlord".
 *   If it's missing or invalid, the request is rejected with 400 rather
 *   than silently defaulting — a wrong/garbled role should not result in
 *   a half-created account that then behaves unexpectedly at login.
 */
router.post("/google-signin", authLimiter, authenticate, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ error: "Token did not contain an email address." });
    }

    const { fullName, role, phone } = req.body;
    const now = new Date().toISOString();

    // Check if user already exists
    const existing = await db.collection("users").doc(uid).get();

    let finalRole;
    if (existing.exists) {
      // Existing users keep their current role — never trust the client to change it here.
      finalRole = existing.data().role;
    } else {
      // New user: role must be explicitly valid. No silent fallback.
      if (!ALLOWED_SELF_ROLES.includes(role)) {
        return res.status(400).json({
          error: `A valid role is required for new accounts. role must be one of: ${ALLOWED_SELF_ROLES.join(", ")}`,
        });
      }
      finalRole = role;
    }

    await auth.setCustomUserClaims(uid, { role: finalRole });

    const profile = {
      uid, email,
      fullName: (fullName || email.split("@")[0]).toString().slice(0, 150),
      role: finalRole,
      phone: phone ? phone.toString().slice(0, 30) : null,
      isActive: true,
      updatedAt: now,
      ...(!existing.exists ? { createdAt: now } : {}),
    };

    await db.collection("users").doc(uid).set(profile, { merge: true });

    const subCollection = finalRole === "student" ? "students" : "landlords";
    await db.collection(subCollection).doc(uid).set({
      ...profile,
      ...(finalRole === "student" ? { savedProperties: [], bookings: [] } : {}),
      ...(finalRole === "landlord" ? { properties: [], verified: false, isFlagged: false, fraudFlags: [] } : {}),
    }, { merge: true });

    res.json({ message: "Google user synced successfully.", uid, role: finalRole });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/verify-token
 * Lightweight endpoint the frontend can use to validate a token and get user info.
 */
router.post("/verify-token", authenticate, async (req, res) => {
  res.json({
    uid:   req.user.uid,
    email: req.user.email,
    role:  req.user.role || req.userDoc?.role || req.resolvedRole,
  });
});

/**
 * POST /api/auth/set-role   (Admin use only — call from a trusted server context)
 * Re-issues custom claims for a user.
 */
router.post("/set-role", authenticate, async (req, res, next) => {
  try {
    const { targetUid, role } = req.body;
    const callerRole = req.user.role || req.userDoc?.role || req.resolvedRole;

    if (callerRole !== "admin") {
      return res.status(403).json({ error: "Only admins can set roles." });
    }
    if (!targetUid || typeof targetUid !== "string") {
      return res.status(400).json({ error: "targetUid is required." });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }

    const targetSnap = await db.collection("users").doc(targetUid).get();
    if (!targetSnap.exists) {
      return res.status(404).json({ error: "Target user not found." });
    }

    await auth.setCustomUserClaims(targetUid, { role });
    await db.collection("users").doc(targetUid).update({ role, updatedAt: new Date().toISOString() });

    res.json({ message: `Role updated to '${role}' for user ${targetUid}.` });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/auth/delete-account
 * Deletes Firebase Auth user + Firestore documents.
 *
 * Deletes from both students/ and landlords/ unconditionally rather than
 * branching on a resolved role — Firestore's delete() is a harmless no-op
 * on a document that doesn't exist, and this avoids ever orphaning a
 * profile if role resolution is ever stale or missing.
 */
router.delete("/delete-account", authenticate, async (req, res, next) => {
  try {
    const { uid } = req.user;

    await auth.deleteUser(uid);
    await db.collection("users").doc(uid).delete();
    await db.collection("students").doc(uid).delete();
    await db.collection("landlords").doc(uid).delete();

    res.json({ message: "Account deleted successfully." });
  } catch (err) {
    next(err);
  }
});

export default router;