import { Router } from "express";
import { db, auth } from "../firebase/firebaseAdmin.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/users
 * List all users (paginated, max 100 per call).
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
 * Disable / enable a Firebase Auth user.
 */
router.patch("/users/:uid/disable", async (req, res, next) => {
  try {
    const { disabled } = req.body; // boolean
    await auth.updateUser(req.params.uid, { disabled: !!disabled });
    await db.collection("users").doc(req.params.uid).update({
      isActive:  !disabled,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: `User ${disabled ? "disabled" : "enabled"}.` });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/stats
 * Quick dashboard numbers.
 */
router.get("/stats", async (req, res, next) => {
  try {
    const [students, landlords, properties, bookings] = await Promise.all([
      db.collection("students").count().get(),
      db.collection("landlords").count().get(),
      db.collection("properties").where("isActive", "==", true).count().get(),
      db.collection("bookings").count().get(),
    ]);

    res.json({
      students:   students.data().count,
      landlords:  landlords.data().count,
      properties: properties.data().count,
      bookings:   bookings.data().count,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/properties/:id
 * Hard delete a property (admin override).
 */
router.delete("/properties/:id", async (req, res, next) => {
  try {
    await db.collection("properties").doc(req.params.id).delete();
    res.json({ message: "Property permanently deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
//admin.js