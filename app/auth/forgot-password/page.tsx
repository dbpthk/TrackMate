"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        data.message ??
          "If an account exists for this email, password reset instructions have been sent."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          Forgot password
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="forgot-email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {message && (
            <div className="rounded-lg border border-border bg-surface-muted/50 px-4 py-3 text-sm text-muted-foreground">
              <p>{message}</p>

              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                className="mt-2 inline-block font-medium text-primary underline"
              >
                Go to reset password
              </Link>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link
            href="/auth/signin"
            className="font-medium text-primary underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
