import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { setSessionCookie } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
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
