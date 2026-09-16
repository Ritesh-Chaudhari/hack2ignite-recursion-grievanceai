import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  getSession,
} from "@/lib/session";

/** Small helpers shared by the auth API routes. */

export async function setSessionCookie(
  response: NextResponse,
  payload: { userId: string; email: string; name: string; role: "citizen" | "admin" },
): Promise<NextResponse> {
  const token = await createSessionToken(payload);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function publicUserFrom(payload: {
  userId: string;
  name: string;
  email: string;
  role: "citizen" | "admin";
}) {
  return { id: payload.userId, name: payload.name, email: payload.email, role: payload.role };
}

export { getSession };
