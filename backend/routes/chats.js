import { Router } from "express";
import admin from "../firebase/firebaseAdmin.js";
import { db } from "../firebase/firebaseAdmin.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const FieldValue = admin.firestore.FieldValue;

router.use(authenticate);

/**
 * POST /api/chats/get-or-create
 * Creates or retrieves a chat between two users for a property.
 * Uses Firebase Admin SDK so it bypasses client-side Firestore security rules.
 */
router.post("/get-or-create", async (req, res, next) => {
  try {
    const { studentId: reqStudentId, landlordId, propertyId, propertyTitle } = req.body;

    if (!landlordId || !propertyId) {
      return res.status(400).json({ error: "Missing landlordId or propertyId." });
    }

    // The caller must be one of the two participants
    const callerUid = req.user.uid;
    const studentId = reqStudentId || callerUid;

    if (callerUid !== studentId && callerUid !== landlordId) {
      return res.status(403).json({ error: "You are not a participant in this chat." });
    }

    const chatId = `${studentId}_${propertyId}`;
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    if (!chatSnap.exists) {
      const now = FieldValue.serverTimestamp();
      await chatRef.set({
        chatId,
        studentId,
        landlordId,
        propertyId,
        propertyTitle: propertyTitle || "Room",
        participants: [studentId, landlordId],
        lastMessage: "",
        lastMessageTime: now,
        lastSenderId: "",
        unreadStudent: 0,
        unreadLandlord: 0,
        typingStudent: false,
        typingLandlord: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    res.json({ chatId });
  } catch (err) {
    next(err);
  }
});

export default router;
