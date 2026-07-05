/**
 * Translation Service
 * Currently backed by MyMemory (free, no API key).
 * To upgrade later (e.g. Azure Translator), only this file needs to change —
 * the function signature `translateText(text, targetLang, sourceLang)` stays the same.
 */

const MYMEMORY_BASE_URL = "https://api.mymemory.translated.net/get";

// MyMemory expects lang codes like "en", "ne" — no locale suffix needed for these two
const LANG_CODE_MAP = {
  en: "en",
  ne: "ne",
};

/**
 * Translates text from sourceLang to targetLang.
 * Returns { translatedText, success, error }
 */
export async function translateText(text, targetLang, sourceLang = "en") {
  if (!text || !text.trim()) {
    return { translatedText: "", success: false, error: "Empty text" };
  }

  const from = LANG_CODE_MAP[sourceLang] || sourceLang;
  const to = LANG_CODE_MAP[targetLang] || targetLang;

  const langpair = `${from}|${to}`;
  const url = `${MYMEMORY_BASE_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`MyMemory API responded with status ${res.status}`);
    }

    const data = await res.json();

    if (data.responseStatus && String(data.responseStatus) !== "200") {
      throw new Error(data.responseDetails || "Translation failed");
    }

    const translatedText = data.responseData?.translatedText;
    if (!translatedText) {
      throw new Error("No translation returned");
    }

    return { translatedText, success: true, error: null };
  } catch (err) {
    console.error("[translationService] Translation failed:", err.message);
    return { translatedText: text, success: false, error: err.message };
  }
}

/**
 * Detects which of the two supported languages the text is likely in.
 * Very lightweight heuristic: checks for Devanagari script characters.
 * Good enough for routing en vs ne without needing a separate API call.
 */
export function detectLanguage(text) {
  const devanagariPattern = /[\u0900-\u097F]/;
  return devanagariPattern.test(text) ? "ne" : "en";
}