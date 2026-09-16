"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "/submit", label: "Submit Grievance" },
  { href: "/my-grievances", label: "My Grievances" },
  { href: "/admin", label: "Admin Dashboard" },
];

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-black text-white shadow-md shadow-primary/30">
            ग
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            Grievance<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-primary-soft text-primary-dark"
                    : "text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="skeleton h-9 w-24" />
          ) : user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold leading-4 text-ink">{user.name}</p>
                <p className="text-xs capitalize leading-4 text-muted">{user.role}</p>
              </div>
              <button onClick={() => void logout()} className="btn btn-ghost !px-4 !py-2">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !px-4 !py-2">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary !px-4 !py-2">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-line bg-white px-4 py-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-line pt-3">
              {user ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                  className="btn btn-ghost w-full"
                >
                  Log out ({user.name})
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="btn btn-ghost flex-1" onClick={() => setMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/signup" className="btn btn-primary flex-1" onClick={() => setMenuOpen(false)}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
