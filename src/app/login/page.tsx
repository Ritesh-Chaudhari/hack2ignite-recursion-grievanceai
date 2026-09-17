"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const DEMO_ACCOUNTS = [
  { label: "Demo Officer (Admin)", email: "officer@grievance.ai", password: "demo1234", icon: "🛡️" },
  { label: "Demo Citizen", email: "citizen@grievance.ai", password: "demo1234", icon: "👤" },
];

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Redirect immediately once user is set after login
  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === "admin" ? "/admin" : "/my-grievances");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      // Redirect is handled by the useEffect above
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  // Don't show login form if already logged in
  if (!loading && user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="animate-fade-up card p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
            🔐
          </div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">
            Log in to submit and track grievances.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="animate-pop rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <div className="animate-fade-up mt-5 card p-5" style={{ animationDelay: "80ms" }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Demo accounts (one-click)
        </p>
        <div className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((acct) => (
            <button
              key={acct.email}
              type="button"
              disabled={busy}
              onClick={() => {
                setEmail(acct.email);
                setPassword(acct.password);
                void (async () => {
                  setError(null);
                  setBusy(true);
                  try {
                    // Ensure demo accounts exist (idempotent), then log in.
                    await fetch("/api/demo-accounts", { method: "POST" });
                    await login(acct.email, acct.password);
                    // Redirect is handled by the useEffect above
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Login failed.");
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
              className="btn btn-ghost w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{acct.icon}</span>
                {acct.label}
              </span>
              <span className="text-xs text-muted">{acct.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
