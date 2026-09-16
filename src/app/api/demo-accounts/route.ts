import { NextResponse } from "next/server";
import { getUserByEmail, saveUser } from "@/lib/store";
import { hashPassword } from "@/lib/auth";
import type { Role } from "@/lib/types";

/**
 * Prototype helper: ensures the demo accounts used by the login page exist.
 * Safe to call repeatedly — it only creates accounts that are missing.
 */
const DEMO_ACCOUNTS: Array<{ name: string; email: string; password: string; role: Role }> = [
  { name: "Demo Officer", email: "officer@grievance.ai", password: "demo1234", role: "admin" },
  { name: "Demo Citizen", email: "citizen@grievance.ai", password: "demo1234", role: "citizen" },
];

export async function POST() {
  const created: string[] = [];
  for (const acct of DEMO_ACCOUNTS) {
    const existing = await getUserByEmail(acct.email);
    if (!existing) {
      await saveUser({
        name: acct.name,
        email: acct.email,
        role: acct.role,
        passwordHash: await hashPassword(acct.password),
      });
      created.push(acct.email);
    }
  }
  return NextResponse.json({ ok: true, created });
}
