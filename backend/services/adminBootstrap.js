import { auth, db } from "../firebase/firebaseAdmin.js";

export const DESIGNATED_ADMIN_EMAIL =
  (process.env.ADMIN_EMAIL || "gamingsiddharth2@gmail.com").toLowerCase();

export const DESIGNATED_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "admin123";

/**
 * Ensures the designated admin Firebase Auth account exists with the expected password.
 * Creates the account if missing; resets password if it already exists.
 */
export async function ensureDesignatedAdminAccount() {
  try {
    const existing = await auth.getUserByEmail(DESIGNATED_ADMIN_EMAIL);
    await auth.updateUser(existing.uid, { password: DESIGNATED_ADMIN_PASSWORD });
    return { uid: existing.uid, email: existing.email, created: false, passwordReset: true };
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;

    const created = await auth.createUser({
      email: DESIGNATED_ADMIN_EMAIL,
      password: DESIGNATED_ADMIN_PASSWORD,
      displayName: DESIGNATED_ADMIN_EMAIL.split("@")[0],
      emailVerified: true,
    });

    return { uid: created.uid, email: created.email, created: true, passwordReset: false };
  }
}

/**
 * Promotes the designated admin email to the admin role.
 * Safe to call on every verify-token — no-ops if already admin or wrong email.
 */
export async function promoteDesignatedAdmin(uid, email) {
  if (!email || email.toLowerCase() !== DESIGNATED_ADMIN_EMAIL) {
    return { promoted: false, role: null };
  }

  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const currentRole = userSnap.exists ? userSnap.data().role : null;

  if (currentRole === "admin") {
    return { promoted: false, role: "admin" };
  }

  const now = new Date().toISOString();

  await auth.setCustomUserClaims(uid, { role: "admin" });

  const profile = {
    uid,
    email,
    role: "admin",
    isActive: true,
    updatedAt: now,
    ...(userSnap.exists ? {} : { createdAt: now, fullName: email.split("@")[0] }),
  };

  await userRef.set(profile, { merge: true });
  await db.collection("admins").doc(uid).set({ ...profile, permissions: ["all"] }, { merge: true });

  return { promoted: true, role: "admin" };
}
