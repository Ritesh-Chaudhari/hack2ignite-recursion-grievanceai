import { GoogleGenAI, Type } from "@google/genai";
import {
  CATEGORIES,
  DEPARTMENTS,
  PRIORITIES,
} from "@/lib/constants";
import type {
  Category,
  GrievanceAnalysis,
  GrievanceLanguage,
  Priority,
} from "@/lib/types";

/**
 * Gemini-powered grievance analysis.
 *
 * One structured-output call per submission returns the detected language,
 * category, priority and a short English summary. If Gemini is unavailable,
 * times out, or errors, we degrade gracefully to a keyword heuristic so the
 * grievance is still stored and triaged (marked aiProcessed: false).
 */

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const TIMEOUT_MS = 15_000;

const SYSTEM_INSTRUCTION = `You are the triage engine for an Indian municipal grievance portal.
Citizens submit complaints in English, Hindi, or Marathi (Devanagari script).

For every grievance you must:
1. detectedLanguage — detect the language actually used in the text. One of: "English", "Hindi", "Marathi".
2. category — classify into exactly one of: ${CATEGORIES.join(", ")}. Pick "Other" only if nothing fits.
3. priority — judge urgency from impact, scale and safety risk. One of: "Low", "Medium", "High", "Urgent".
   Guidance: Urgent = immediate danger to life/health (live wire, contaminated water, collapse risk, fire).
   High = severe disruption for many people (major road damage, area-wide outage, sewage overflow).
   Medium = recurring or multi-day single-area issues. Low = cosmetic or minor inconveniences.
4. summary — a neutral 1-2 sentence English summary of the complaint, regardless of input language.
   Mention what, where, and the impact. Never invent facts not present in the complaint.

Respond with JSON only, matching the provided schema.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    detectedLanguage: {
      type: Type.STRING,
      enum: ["English", "Hindi", "Marathi"],
    },
    category: { type: Type.STRING, enum: [...CATEGORIES] },
    priority: { type: Type.STRING, enum: [...PRIORITIES] },
    summary: { type: Type.STRING },
  },
  required: ["detectedLanguage", "category", "priority", "summary"],
} as const;

export interface AnalysisResult {
  analysis: GrievanceAnalysis;
  aiProcessed: boolean;
  aiError?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Gemini request timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer!));
}

function callGemini(apiKey: string, title: string, description: string) {
  const ai = new GoogleGenAI({ apiKey });
  return ai.models.generateContent({
    model: MODEL,
    contents: `Grievance title: ${title}\n\nGrievance description:\n${description}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 512,
    },
  });
}

// ---------------------------------------------------------------------------
// Heuristic fallback (no network) — keeps the product usable without a key.
// ---------------------------------------------------------------------------

const DEVANAGARI_RE = /[\u0900-\u097F]/;

const MARATHI_MARKERS = [
  "आहे","आहेत","नाही","करा","करणे","होते","पाणी","रस्ता","बिजली","कचरा","दवंडी",
  "गटार","उजेड","त्रास","लोक","इथे","तिथे","असल्याने","सुरु","झाले","आमच्या",
];
const HINDI_MARKERS = [
  "है","हैं","नहीं","करो","करना","पानी","सड़क","बिजली","कूड़ा","गंदगी","नाली",
  "रोशनी","परेशान","लोग","यहाँ","वहाँ","हो रहा","कृपया","समस्या","में",
];

function detectLanguageHeuristic(
  text: string,
  selected: GrievanceLanguage,
): GrievanceLanguage {
  if (!DEVANAGARI_RE.test(text)) return "English";
  const lower = text;
  const score = (markers: string[]) =>
    markers.reduce((acc, m) => acc + (lower.includes(m) ? 1 : 0), 0);
  const hi = score(HINDI_MARKERS);
  const mr = score(MARATHI_MARKERS);
  if (mr > hi) return "Marathi";
  if (hi > mr) return "Hindi";
  return selected === "English" ? "Hindi" : selected;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Water: ["water", "pipe", "leak", "tap", "supply", "sewage", "drainage", "paani", "पानी", "नल", "रिसाव", "गटार", "पाणी", "नळ", "गळती"],
  Roads: ["road", "pothole", "footpath", "street", "divider", "flyover", "sadak", "सड़क", "रास्ता", "गड्ढा", "रस्ता", "खड्डा", "फुटपाथ"],
  Electricity: ["electricity", "power", "light", "outage", "transformer", "wire", "bijli", "बिजली", "करंट", "बत्ती", "उजेड", "वीज", "प्रकाश"],
  Sanitation: ["garbage", "trash", "waste", "toilet", "cleaning", "dustbin", "kooda", "कूड़ा", "कचरा", "सफाई", "गंदगी", "शौचालय", "दवंडी", "स्वच्छता"],
  Safety: ["safety", "accident", "fire", "crime", "harassment", "danger", "unsafe", "सुरक्षा", "दुर्घटना", "आग", "अपराध", "खतरा", "धोका"],
  Other: [],
};

const URGENT_KEYWORDS = ["fire", "death", "dying", "electrocution", "live wire", "collapse", "contaminated", "emergency", "आग", "मौत", "जान", "आपत्कालीन", "संकटग्रस्त", "धोक्याची", "प्राण"];
const HIGH_KEYWORDS = ["outage", "overflow", "no water", "blocked", "flood", "major accident", "बंद", "भरा हुआ", "पूर", "नाली बंद", "वीज नाही", "उघड", "ओव्हरफ्लो"];
const LOW_KEYWORDS = ["cosmetic", "paint", "minor", "small", "सजावटी", "रंग", "थोड", "छोट"];

function classifyHeuristic(
  title: string,
  description: string,
  selectedCategory: Category,
): Category {
  const text = `${title} ${description}`.toLowerCase();
  let best: Category = selectedCategory;
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    Category,
    string[],
  ][]) {
    const score = keywords.reduce(
      (acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return best;
}

function priorityHeuristic(
  title: string,
  description: string,
): Priority {
  const text = `${title} ${description}`.toLowerCase();
  if (URGENT_KEYWORDS.some((kw) => text.includes(kw))) return "Urgent";
  if (HIGH_KEYWORDS.some((kw) => text.includes(kw))) return "High";
  if (LOW_KEYWORDS.some((kw) => text.includes(kw))) return "Low";
  return "Medium";
}

function fallbackAnalysis(
  title: string,
  description: string,
  selectedLanguage: GrievanceLanguage,
  selectedCategory: Category,
): GrievanceAnalysis {
  return {
    detectedLanguage: detectLanguageHeuristic(`${title} ${description}`, selectedLanguage),
    category: classifyHeuristic(title, description, selectedCategory),
    priority: priorityHeuristic(title, description),
    summary: `${title} — reported at the citizen's location. Pending officer review; routed to the ${
      DEPARTMENTS[selectedCategory]
    }.`,
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function analyzeGrievance(
  title: string,
  description: string,
  selectedLanguage: GrievanceLanguage,
  selectedCategory: Category,
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      analysis: fallbackAnalysis(title, description, selectedLanguage, selectedCategory),
      aiProcessed: false,
      aiError: "GEMINI_API_KEY not configured — used heuristic triage.",
    };
  }

  try {
    const response = await withTimeout(
      callGemini(apiKey, title, description),
      TIMEOUT_MS,
    );
    const raw = response.text?.trim();
    if (!raw) throw new Error("Empty Gemini response");
    const parsed = JSON.parse(raw) as Partial<GrievanceAnalysis>;

    const category = CATEGORIES.includes(parsed.category as Category)
      ? (parsed.category as Category)
      : selectedCategory;
    const priority = PRIORITIES.includes(parsed.priority as Priority)
      ? (parsed.priority as Priority)
      : "Medium";
    const detectedLanguage: GrievanceLanguage = (["English", "Hindi", "Marathi"] as const).includes(
      parsed.detectedLanguage as GrievanceLanguage,
    )
      ? (parsed.detectedLanguage as GrievanceLanguage)
      : selectedLanguage;
    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim().length > 0
        ? parsed.summary.trim()
        : fallbackAnalysis(title, description, selectedLanguage, category).summary;

    return {
      analysis: { detectedLanguage, category, priority, summary },
      aiProcessed: true,
    };
  } catch (err) {
    console.error("[ai] Gemini analysis failed:", err);
    return {
      analysis: fallbackAnalysis(title, description, selectedLanguage, selectedCategory),
      aiProcessed: false,
      aiError: err instanceof Error ? err.message : "Unknown Gemini error",
    };
  }
}
