import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { setSessionCookie } from "@/lib/api-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// 10 login attempts per 15 minutes per IP.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await loginUser(email, password);
    // Only public fields ever leave the server (never the password hash).
    const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const response = NextResponse.json({ user: publicUser });
    return setSessionCookie(response, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
