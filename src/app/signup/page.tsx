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
  const [role, setRole] = useState<"citizen" | "admin">("citizen");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(name, email, password, role);
      router.push(role === "admin" ? "/admin" : "/my-grievances");
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
        <h1 className="text-2xl font-black tracking-tight text-ink">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted">
          Join GrievanceAI as a citizen or an officer.
        </p>

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

          <div>
            <span className="label">I am a</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "citizen", label: "Citizen", hint: "Report & track issues" },
                  { value: "admin", label: "Officer", hint: "Triage & resolve" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    role === opt.value
                      ? "border-primary bg-primary-soft ring-2 ring-primary/20"
                      : "border-line bg-white hover:border-primary/40"
                  }`}
                >
                  <span className="block text-sm font-bold text-ink">{opt.label}</span>
                  <span className="block text-xs text-muted">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="animate-pop rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
