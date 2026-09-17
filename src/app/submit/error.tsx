"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SubmitError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SubmitError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="card animate-pop p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-2xl">
          ⚠️
        </div>
        <h1 className="text-xl font-black text-primary">Submission Error</h1>
        <p className="mt-2 text-sm text-primary/70">
          The grievance submission form encountered an error. Please try again.
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
