"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const err = searchParams.get("error");
    if (verified === "true") {
      setSuccess("Email verified! You can now sign in.");
    }
    if (err === "Invalid token" || err === "Token expired") {
      setError("Verification link is invalid or expired. Please request a new one.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError(
          res.error === "VerificationRequired"
            ? "Please verify your email before signing in, or check your email for verification code."
            : "Invalid email or password"
        );
        if (res.error === "VerificationRequired") setShowVerifyCode(true);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code");
        return;
      }
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Account verified. Please sign in again.");
        setShowVerifyCode(false);
        setCode("");
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to resend");
        return;
      }
      setSuccess("Verification code sent. Check your email.");
    } catch {
      setError("Failed to resend");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4"
      role="main"
      aria-label="Sign in page"
    >
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          Sign in
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          aria-label="Sign in form"
          noValidate
        >
          <div>
            <label
              htmlFor="signin-email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "signin-error" : undefined}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="signin-password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "signin-error" : undefined}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {success && (
            <p
              id="signin-success"
              role="status"
              className="text-sm text-green-600 dark:text-green-400"
            >
              {success}
            </p>
          )}
          {error && (
            <p
              id="signin-error"
              role="alert"
              className="text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
          {showVerifyCode && (
            <div
              role="group"
              aria-label="Verification code"
              className="rounded-lg border border-border bg-surface-muted/50 p-4"
            >
              <p className="mb-3 text-sm font-medium text-foreground">
                Enter verification code
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVerifyCode(e as unknown as React.FormEvent);
                    }
                  }}
                  className="flex-1 rounded border border-border bg-surface px-3 py-2 text-center font-mono tracking-widest text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={(e) =>
                    handleVerifyCode(e as unknown as React.FormEvent)
                  }
                  disabled={verifyLoading || code.length !== 6}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {verifyLoading ? "Verifying…" : "Verify"}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyCode(false);
                    setCode("");
                    setError("");
                  }}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {resendLoading ? "Sending…" : "Resend verification code"}
                </button>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
