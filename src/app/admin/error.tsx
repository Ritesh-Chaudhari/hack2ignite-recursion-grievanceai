"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="card animate-pop p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-2xl">
          🛡️
        </div>
        <h1 className="text-xl font-black text-primary">Dashboard Error</h1>
        <p className="mt-2 text-sm text-primary/70">
          The admin dashboard encountered an error. Please try refreshing.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="btn btn-primary flex-1">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost flex-1">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
