import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";
import { setSessionCookie } from "@/lib/api-auth";
import type { Role } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const role: Role = body.role === "admin" ? "admin" : "citizen";

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
    const response = NextResponse.json({ user }, { status: 201 });
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
