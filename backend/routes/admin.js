import { Router } from "express";
import { db, auth } from "../firebase/firebaseAdmin.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireAdmin);

const ALLOWED_ROLES = ["student", "landlord", "admin"];

/**
 * GET /api/admin/stats
 */
router.get("/stats", async (req, res, next) => {
  try {
    const [students, landlords, properties, bookings, fraudAlerts, flaggedLandlords] = await Promise.all([
      db.collection("students").count().get(),
      db.collection("landlords").count().get(),
      db.collection("properties").where("isActive", "==", true).count().get(),
      db.collection("bookings").count().get(),
      db.collection("fraudAlerts").where("resolved", "==", false).count().get(),
      db.collection("landlords").where("isFlagged", "==", true).count().get(),
    ]);

    res.json({
      students: students.data().count,
      landlords: landlords.data().count,
      properties: properties.data().count,
      bookings: bookings.data().count,
      openFraudAlerts: fraudAlerts.data().count,
      flaggedLandlords: flaggedLandlords.data().count,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users
 */
router.get("/users", async (req, res, next) => {
  try {
    const snap = await db.collection("users").orderBy("createdAt", "desc").limit(100).get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:uid/disable
 */
router.patch("/users/:uid/disable", async (req, res, next) => {
  try {
    const { disabled } = req.body;
    await auth.updateUser(req.params.uid, { disabled: !!disabled });
    await db.collection("users").doc(req.params.uid).update({
      isActive: !disabled,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: `User ${disabled ? "disabled" : "enabled"}.` });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:uid/role
 */
router.patch("/users/:uid/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }

    const uid = req.params.uid;
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    await auth.setCustomUserClaims(uid, { role });
    await db.collection("users").doc(uid).update({ role, updatedAt: new Date().toISOString() });

    if (role === "admin") {
      await db.collection("admins").doc(uid).set(
        { uid, role, email: userSnap.data().email, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }

    res.json({ message: `Role updated to '${role}'.` });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/properties
 */
router.get("/properties", async (req, res, next) => {
  try {
    const snap = await db.collection("properties").orderBy("createdAt", "desc").limit(100).get();
    const properties = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const landlordIds = [...new Set(properties.map((p) => p.landlordId).filter(Boolean))];
    const landlordMap = {};
    if (landlordIds.length > 0) {
      const landlordSnaps = await db.getAll(...landlordIds.map((id) => db.collection("users").doc(id)));
      landlordSnaps.forEach((s) => {
        if (s.exists) {
          const data = s.data();
          landlordMap[s.id] = data.fullName || data.displayName || data.email;
        }
      });
    }

    res.json(
      properties.map((p) => ({
        ...p,
        landlordName: landlordMap[p.landlordId] || "Unknown",
      }))
    );
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/properties/:id
 */
router.patch("/properties/:id", async (req, res, next) => {
  try {
    const ref = db.collection("properties").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Property not found." });

    const allowed = ["isActive", "isAvailable", "title", "price", "location"];
    const update = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });
    update.updatedAt = new Date().toISOString();

    await ref.update(update);
    res.json({ message: "Property updated.", id: req.params.id, ...update });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/properties/:id
 */
router.delete("/properties/:id", async (req, res, next) => {
  try {
    await db.collection("properties").doc(req.params.id).delete();
    res.json({ message: "Property permanently deleted." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/bookings
 */
router.get("/bookings", async (req, res, next) => {
  try {
    const snap = await db.collection("bookings").orderBy("createdAt", "desc").limit(100).get();
    const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const propertyIds = [...new Set(bookings.map((b) => b.propertyId).filter(Boolean))];
    const propertyMap = {};
    if (propertyIds.length > 0) {
      const propSnaps = await db.getAll(...propertyIds.map((id) => db.collection("properties").doc(id)));
      propSnaps.forEach((s) => {
        if (s.exists) propertyMap[s.id] = s.data().title;
      });
    }

    res.json(
      bookings.map((b) => ({
        ...b,
        propertyTitle: propertyMap[b.propertyId] || "Unknown property",
      }))
    );
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/bookings/:id/status
 */
router.patch("/bookings/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "accepted", "rejected", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    }

    const ref = db.collection("bookings").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Booking not found." });

    await ref.update({ status, updatedAt: new Date().toISOString() });

    if (status === "accepted" && snap.data().propertyId) {
      await db.collection("properties").doc(snap.data().propertyId).update({
        isAvailable: false,
        updatedAt: new Date().toISOString(),
      });
    }

    res.json({ message: `Booking marked as ${status}.` });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/landlords
 */
router.get("/landlords", async (req, res, next) => {
  try {
    const snap = await db.collection("landlords").orderBy("createdAt", "desc").limit(100).get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/landlords/:id/verify
 */
router.patch("/landlords/:id/verify", async (req, res, next) => {
  try {
    await db.collection("landlords").doc(req.params.id).update({
      verified: true,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: "Landlord verified." });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/landlords/:id/unflag
 */
router.patch("/landlords/:id/unflag", async (req, res, next) => {
  try {
    await db.collection("landlords").doc(req.params.id).update({
      isFlagged: false,
      fraudFlags: [],
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: "Landlord unflagged." });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/fraud-alerts
 */
router.get("/fraud-alerts", async (req, res, next) => {
  try {
    const snap = await db.collection("fraudAlerts").orderBy("createdAt", "desc").limit(100).get();
    const alerts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const landlordIds = [...new Set(alerts.map((a) => a.landlordId).filter(Boolean))];
    const landlordMap = {};
    if (landlordIds.length > 0) {
      const landlordSnaps = await db.getAll(...landlordIds.map((id) => db.collection("users").doc(id)));
      landlordSnaps.forEach((s) => {
        if (s.exists) {
          const data = s.data();
          landlordMap[s.id] = data.fullName || data.email;
        }
      });
    }

    res.json(
      alerts.map((a) => ({
        ...a,
        landlordName: landlordMap[a.landlordId] || "Unknown",
      }))
    );
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/fraud-alerts/:id/resolve
 */
router.patch("/fraud-alerts/:id/resolve", async (req, res, next) => {
  try {
    const ref = db.collection("fraudAlerts").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Alert not found." });

    await ref.update({
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy: req.user.uid,
    });
    res.json({ message: "Fraud alert resolved." });
  } catch (err) {
    next(err);
  }
});

export default router;
