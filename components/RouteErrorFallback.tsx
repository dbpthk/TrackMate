"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "./Button";

type RouteErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  routeName?: string;
};

/** Next.js error.tsx fallback. Catches errors in route segments. */
export function RouteErrorFallback({
  error,
  reset,
  routeName = "this page",
}: RouteErrorFallbackProps) {
  useEffect(() => {
    console.error("[RouteError]", routeName, error);
  }, [error, routeName]);

  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-4 py-8"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-surface-muted hover:border-muted-foreground/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
