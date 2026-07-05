import express from "express";
import { translateText } from "../services/translationService.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/translate
 * Body: { text: string, targetLang: "en" | "ne", sourceLang?: "en" | "ne" }
 */
router.post("/", authenticate, async (req, res) => {
  const { text, targetLang, sourceLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "text and targetLang are required" });
  }

  if (!["en", "ne"].includes(targetLang)) {
    return res.status(400).json({ error: "targetLang must be 'en' or 'ne'" });
  }

  const result = await translateText(text, targetLang, sourceLang || "en");

  if (!result.success) {
    // Return 200 with the original text as fallback rather than failing the request —
    // the frontend/caller can still function, just without translation for now
    return res.status(200).json({
      translatedText: result.translatedText,
      translated: false,
      warning: result.error,
    });
  }

  return res.status(200).json({
    translatedText: result.translatedText,
    translated: true,
  });
});

export default router;