import { NextResponse } from "next/server";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { findGrievanceById, updateGrievance } from "@/lib/store";
import type { Category, Priority, Status } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const grievance = await findGrievanceById(id);
  if (!grievance) {
    return NextResponse.json({ error: "Grievance not found." }, { status: 404 });
  }
  if (session.role !== "admin" && grievance.submittedBy !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ grievance });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can update grievances." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    priority?: string;
    category?: string;
  };

  const patch: {
    status?: Status;
    priority?: Priority;
    category?: Category;
    updatedAt: string;
  } = { updatedAt: new Date().toISOString() };

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as Status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status as Status;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority as Priority)) {
      return NextResponse.json({ error: "Invalid priority." }, { status: 400 });
    }
    patch.priority = body.priority as Priority;
  }
  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category as Category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    patch.category = body.category as Category;
  }

  const updated = await updateGrievance(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Grievance not found." }, { status: 404 });
  }
  return NextResponse.json({ grievance: updated });
}
