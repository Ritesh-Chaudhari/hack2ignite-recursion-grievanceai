import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { analyzeGrievance } from "@/lib/ai";
import { CATEGORIES, LANGUAGES } from "@/lib/constants";
import {
  findSimilarGrievances,
} from "@/lib/similarity";
import {
  getSession,
} from "@/lib/session";
import {
  insertGrievance,
  listAllGrievances,
  listGrievancesByUser,
} from "@/lib/store";
import type {
  Category,
  Grievance,
  GrievanceLanguage,
  SubmitGrievanceResponse,
} from "@/lib/types";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to submit a grievance." }, { status: 401 });
  }

  let body: { title?: string; description?: string; category?: string; location?: string; language?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = body.title?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const location = body.location?.trim() ?? "";
  const language = (body.language ?? "English") as GrievanceLanguage;
  const category = (body.category ?? "Other") as Category;

  if (title.length < 5) {
    return NextResponse.json({ error: "Title must be at least 5 characters." }, { status: 400 });
  }
  if (description.length < 20) {
    return NextResponse.json(
      { error: "Please describe the issue in at least 20 characters." },
      { status: 400 },
    );
  }
  if (location.length < 3) {
    return NextResponse.json({ error: "Please enter the location." }, { status: 400 });
  }
  if (!LANGUAGES.includes(language)) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Unsupported category." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { analysis, aiProcessed, aiError } = await analyzeGrievance(
    title,
    description,
    language,
    category,
  );
  if (aiError) {
    console.warn("[grievances] AI fallback used:", aiError);
  }

  const grievance: Grievance = {
    id: randomUUID(),
    title,
    description,
    language,
    category: analysis.category,
    priority: analysis.priority,
    status: "Pending",
    location,
    submittedBy: session.userId,
    submitterName: session.name,
    createdAt: now,
    updatedAt: now,
    aiSummary: analysis.summary,
    aiProcessed,
  };

  // Duplicate/similar detection against recent grievances in the same category.
  const pool = await listAllGrievances();
  const similarMatches = findSimilarGrievances(grievance, pool, 5);
  if (similarMatches.length > 0) {
    grievance.duplicateOf = similarMatches.map((m) => m.grievance.id);
  }

  await insertGrievance(grievance);

  const payload: SubmitGrievanceResponse = {
    grievance,
    similar: similarMatches.map((m) => ({
      id: m.grievance.id,
      title: m.grievance.title,
      location: m.grievance.location,
      createdAt: m.grievance.createdAt,
      reasons: m.reasons,
    })),
  };
  return NextResponse.json(payload, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const grievances =
    session.role === "admin"
      ? await listAllGrievances()
      : await listGrievancesByUser(session.userId);
  return NextResponse.json({ grievances });
}

export const runtime = "nodejs";
