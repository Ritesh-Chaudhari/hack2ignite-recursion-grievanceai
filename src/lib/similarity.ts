import type { Grievance } from "@/lib/types";

/**
 * Lightweight duplicate/similar complaint detection.
 *
 * Two grievances are considered similar when they share a category and any of:
 *  - overlapping location tokens ("near Ward 12 market" vs "Ward 12 market area")
 *  - overlapping title tokens
 *
 * This is deliberately simple (token overlap) — good enough for a prototype
 * demo and easy to swap for embeddings later.
 */

const STOPWORDS = new Set([
  "the","and","for","near","from","with","this","that","area","road","street","ward","sector",
  "नगर","के","की","का","में","से","और","है","हैं","च्या","चे","आहे","मध्ये","आणि","ता","ला",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function overlapRatio(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let common = 0;
  for (const token of setA) if (setB.has(token)) common += 1;
  return common / Math.min(setA.size, setB.size);
}

export interface SimilarGrievance {
  grievance: Grievance;
  score: number;
  reasons: string[];
}

/**
 * Find existing grievances similar to `candidate`, most similar first.
 * Similarity requires the same category plus a location/title signal.
 */
export function findSimilarGrievances(
  candidate: Pick<Grievance, "id" | "title" | "location" | "category">,
  pool: Grievance[],
  limit = 5,
): SimilarGrievance[] {
  const candidateTitleTokens = tokenize(candidate.title);
  const candidateLocationTokens = tokenize(candidate.location);

  const matches: SimilarGrievance[] = [];
  for (const g of pool) {
    if (g.id === candidate.id || g.category !== candidate.category) continue;

    const reasons: string[] = [];
    let score = 0;

    const locationOverlap = overlapRatio(
      candidateLocationTokens,
      tokenize(g.location),
    );
    if (locationOverlap >= 0.34) {
      reasons.push("similar location");
      score += locationOverlap;
    }

    const titleOverlap = overlapRatio(candidateTitleTokens, tokenize(g.title));
    if (titleOverlap >= 0.35) {
      reasons.push("similar title");
      score += titleOverlap;
    }

    if (reasons.length > 0) {
      matches.push({ grievance: g, score, reasons });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
