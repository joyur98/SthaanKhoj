import { Router } from "express";
import rateLimit from "express-rate-limit";
import { auth, db } from "../firebase/firebaseAdmin.js";
import { authenticate } from "../middleware/auth.js";
import { registerRules, validate } from "../middleware/validate.js";

const router = Router();

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
  try {
    const { email, password, fullName, role, phone } = req.body;

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
      phoneNumber: phone || undefined,
    });

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
      // role-specific defaults
      ...(role === "student"  ? { savedProperties: [], bookings: [] } : {}),
      ...(role === "landlord" ? { properties: [], verified: false }   : {}),
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
    next(err);
  }
});

router.post("/google-signin", async (req, res, next) => {
  try {
    const { email, fullName, role, uid, phone } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Set custom claim for role
    await auth.setCustomUserClaims(uid, { role });

    // Create/Update Firestore profile
    const now = new Date().toISOString();
    const profile = {
      uid,
      email,
      fullName: fullName || email.split('@')[0],
      role,
      phone: phone || null,
      isActive: true,
      updatedAt: now,
    };

    await db.collection("users").doc(uid).set(profile, { merge: true });

    // Create role-specific sub-document
    const subCollection = role === "student" ? "students" : "landlords";
    const subProfile = {
      uid,
      email,
      fullName: fullName || email.split('@')[0],
      role,
      updatedAt: now,
      ...(role === "student" ? { savedProperties: [], bookings: [] } : {}),
      ...(role === "landlord" ? { properties: [], verified: false } : {}),
    };

    await db.collection(subCollection).doc(uid).set(subProfile, { merge: true });

    res.json({
      message: "Google user synced successfully.",
      uid,
      role,
    });
  } catch (err) {
    console.error("Google sign-in error:", err);
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
    role:  req.user.role || req.userDoc?.role,
  });
});

/**
 * POST /api/auth/set-role   (Admin use only — call from a trusted server context)
 * Re-issues custom claims for a user.
 */
router.post("/set-role", authenticate, async (req, res, next) => {
  try {
    const { targetUid, role } = req.body;
    const callerRole = req.user.role || req.userDoc?.role;
    if (callerRole !== "admin") {
      return res.status(403).json({ error: "Only admins can set roles." });
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
 */
router.delete("/delete-account", authenticate, async (req, res, next) => {
  try {
    const { uid, role } = req.user;
    await auth.deleteUser(uid);
    await db.collection("users").doc(uid).delete();
    const sub = role === "student" ? "students" : "landlords";
    await db.collection(sub).doc(uid).delete();
    res.json({ message: "Account deleted successfully." });
  } catch (err) {
    next(err);
  }
});

export default router;
//auth.js