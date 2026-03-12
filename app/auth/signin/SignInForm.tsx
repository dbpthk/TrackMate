"use client";

import { useState, useEffect, useRef } from "react";
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
  const [hasSentCode, setHasSentCode] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const err = searchParams.get("error");
    const reason = searchParams.get("reason");
    if (verified === "true") {
      setSuccess("Email verified! You can now sign in.");
    }
    if (err === "Invalid token" || err === "Token expired") {
      setError("Verification link is invalid or expired. Please request a new one.");
    }
    if (err === "DemoLoginFailed") {
      const isDev = process.env.NODE_ENV === "development";
      setError(
        isDev && reason
          ? `Demo login failed (${reason})`
          : "Demo login failed. Please try again."
      );
    }
  }, [searchParams]);

  const demoAttempted = useRef(false);
  useEffect(() => {
    if (demoAttempted.current) return;
    if (searchParams.get("demo") === "user") {
      demoAttempted.current = true;
      window.location.href = "/api/auth/demo-login";
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
        if (res.error === "VerificationRequired") {
          setError("");
          setShowVerifyCode(true);
        } else {
          setError("Invalid email or password");
        }
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
      setHasSentCode(true);
    } catch {
      setError("Failed to resend");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12"
      role="main"
      aria-label="Sign in page"
    >
      <div className="w-full max-w-sm sm:max-w-md">
        <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">
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
          {success && !showVerifyCode && (
            <div
              id="signin-success"
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
            >
              {success}
            </div>
          )}
          {error && (
            <div
              id="signin-error"
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
            >
              {error}
            </div>
          )}
          {showVerifyCode && (
            <div
              role="group"
              aria-label="Verification code"
              className="rounded-xl border border-border bg-surface shadow-sm"
            >
              <div className="border-b border-border bg-surface-muted/30 px-4 py-3 sm:px-5">
                <p className="text-sm font-medium text-foreground sm:text-base">
                  Verify your email
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Please verify your email before signing in.
                </p>
              </div>
              <div className="space-y-4 p-4 sm:p-5">
                {success && (
                  <div
                    role="status"
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                  >
                    {success}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="signin-code"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Verification code
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <input
                      id="signin-code"
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
                      className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-center font-mono text-lg tracking-[0.4em] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:tracking-[0.5em]"
                    />
                    <button
                      type="button"
                      onClick={(e) =>
                        handleVerifyCode(e as unknown as React.FormEvent)
                      }
                      disabled={verifyLoading || code.length !== 6}
                      className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                    >
                      {verifyLoading ? "Verifying…" : "Verify"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerifyCode(false);
                      setCode("");
                      setError("");
                      setSuccess("");
                      setHasSentCode(false);
                    }}
                    className="order-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:order-1 sm:text-left"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="order-1 text-center text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50 sm:order-2 sm:text-right"
                  >
                    {resendLoading ? "Sending…" : hasSentCode ? "Resend verification code" : "Send verification code"}
                  </button>
                </div>
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
