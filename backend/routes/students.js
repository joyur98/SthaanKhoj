import { Router } from "express";
import { db } from "../firebase/firebaseAdmin.js";
import { authenticate, requireStudent, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All student routes require authentication
router.use(authenticate);

/**
 * GET /api/students/me
 * Get the current student's profile.
 */
router.get("/me", requireStudent, async (req, res, next) => {
  try {
    const snap = await db.collection("students").doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ error: "Student profile not found." });
    res.json(snap.data());
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/students/me
 * Update the current student's profile.
 */
router.put("/me", requireStudent, async (req, res, next) => {
  try {
    const allowed = ["fullName", "phone", "university", "bio", "preferences"];
    const update  = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    update.updatedAt = new Date().toISOString();

    await db.collection("students").doc(req.user.uid).update(update);
    await db.collection("users").doc(req.user.uid).update(update);
    res.json({ message: "Profile updated.", ...update });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/students/saved-properties
 * Get properties the student has saved/bookmarked.
 */
router.get("/saved-properties", requireStudent, async (req, res, next) => {
  try {
    const snap = await db.collection("students").doc(req.user.uid).get();
    const saved = snap.data()?.savedProperties || [];
    if (!saved.length) return res.json([]);

    // Batch-read property docs
    const chunks = [];
    for (let i = 0; i < saved.length; i += 10) chunks.push(saved.slice(i, i + 10));
    const properties = [];
    for (const chunk of chunks) {
      const docs = await db.getAll(...chunk.map((id) => db.collection("properties").doc(id)));
      docs.forEach((d) => { if (d.exists) properties.push({ id: d.id, ...d.data() }); });
    }
    res.json(properties);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/students/saved-properties/:propertyId
 * Save / unsave a property (toggle).
 */
router.post("/saved-properties/:propertyId", requireStudent, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const ref  = db.collection("students").doc(req.user.uid);
    const snap = await ref.get();
    const saved = snap.data()?.savedProperties || [];
    const idx   = saved.indexOf(propertyId);
    let action;
    if (idx === -1) { saved.push(propertyId); action = "saved"; }
    else            { saved.splice(idx, 1);   action = "removed"; }
    await ref.update({ savedProperties: saved, updatedAt: new Date().toISOString() });
    res.json({ message: `Property ${action}.`, savedProperties: saved });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/students/:id   (admin only)
 */
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const snap = await db.collection("students").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Student not found." });
    res.json(snap.data());
  } catch (err) {
    next(err);
  }
});

export default router;
//students.js