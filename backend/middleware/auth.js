import { auth, db } from "../firebase/firebaseAdmin.js";

/**
 * Verifies the Firebase ID token in the Authorization header.
 * Attaches `req.user` (Firebase decoded token) and `req.userDoc` (Firestore user record).
 */
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed Authorization header." });
    }

    const token = header.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    // Attach decoded token (contains uid, email, custom claims like role)
    req.user = decoded;

    // Optionally attach the Firestore profile
    const snap = await db.collection("users").doc(decoded.uid).get();
    if (snap.exists) req.userDoc = snap.data();

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * Role-based access control factory.
 * Usage: requireRole('admin') or requireRole('landlord', 'admin')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated." });
    const userRole = req.user.role || req.userDoc?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: "You do not have permission for this action." });
    }
    next();
  };
};

export const requireStudent  = requireRole("student");
export const requireLandlord = requireRole("landlord");
export const requireAdmin    = requireRole("admin");
export const requireLandlordOrAdmin = requireRole("landlord", "admin");
export const requireAnyRole  = requireRole("student", "landlord", "admin");
//auth.js