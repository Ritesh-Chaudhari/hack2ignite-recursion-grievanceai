"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState<"citizen" | "admin">("citizen");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(name, email, password, role);
      router.push("/my-grievances");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="animate-fade-up card p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
            👤
          </div>
          <h1 className="text-2xl font-black tracking-tight text-ink">
            Join as a Citizen
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create an account to report and track civic issues.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              className="field"
              placeholder="Asha Patil"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              required
              className="field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="field"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-teal-accent/25 bg-teal-soft/50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">👤</span>
              <div>
                <span className="block text-sm font-bold text-ink">Citizen Account</span>
                <span className="block mt-1 text-xs text-muted">
                  File grievances, track status, and help improve your city.
                </span>
              </div>
            </div>
          </div>

          {error && (
            <p className="animate-pop rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? "Creating account…" : "Create citizen account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {/* Info card for officers */}
      <div className="animate-fade-up mt-5 card p-5" style={{ animationDelay: "80ms" }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="text-sm font-bold text-ink">Are you an Officer?</p>
            <p className="mt-1 text-xs text-muted">
              Officer accounts are provided by administrators.{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Use demo login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
