import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { setSessionCookie } from "@/lib/api-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { Role } from "@/lib/types";

// 5 registrations per hour per IP.
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`register:${ip}`, REGISTER_LIMIT, REGISTER_WINDOW_MS);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const requestedRole: Role = body.role === "admin" ? "admin" : "citizen";

    // Prevent self-registration as admin. Admin accounts must be created
    // via the demo-accounts seed route or directly in the database.
    if (requestedRole === "admin") {
      return NextResponse.json(
        { error: "Officer accounts cannot be created via public registration. Use a demo account or contact an administrator." },
        { status: 403 },
      );
    }
    const role: Role = requestedRole;

    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const user = await registerUser(name, email, password, role);
    // Only public fields ever leave the server (never the password hash).
    const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const response = NextResponse.json({ user: publicUser }, { status: 201 });
    return setSessionCookie(response, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create the account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
