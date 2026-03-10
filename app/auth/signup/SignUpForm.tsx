"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        return;
      }
      setSignupSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess(false);
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
        setError("Account verified but sign in failed. Please sign in.");
        router.push("/auth/signin");
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
    setResendSuccess(false);
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
      setResendSuccess(true);
    } catch {
      setError("Failed to resend");
    } finally {
      setResendLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center bg-background px-4"
        role="main"
        aria-label="Sign up page"
      >
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-2xl font-semibold text-foreground">
            Verify your email
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Please verify your email before signing in. Check your email for the
            verification code.
          </p>
          <form
            onSubmit={handleVerifyCode}
            className="flex flex-col gap-4"
            aria-label="Verification form"
          >
            <div>
              <label
                htmlFor="signup-code"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Verification code
              </label>
              <input
                id="signup-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                aria-required="true"
                aria-invalid={!!error}
                className="w-full rounded border border-border bg-surface px-3 py-2 text-center text-lg font-mono tracking-[0.5em] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {resendSuccess && (
              <p
                role="status"
                className="text-sm text-green-600 dark:text-green-400"
              >
                Verification code sent. Check your email.
              </p>
            )}
            <button
              type="submit"
              disabled={verifyLoading || code.length !== 6}
              aria-busy={verifyLoading}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {verifyLoading ? "Verifying…" : "Verify and sign in"}
            </button>
          </form>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="mt-4 w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Sending…" : "Resend verification code"}
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/auth/signin" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4"
      role="main"
      aria-label="Sign up page"
    >
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          Sign up
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          aria-label="Sign up form"
          noValidate
        >
          <div>
            <label
              htmlFor="signup-name"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "signup-error" : undefined}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="signup-email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "signup-error" : undefined}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="signup-password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "signup-error" : undefined}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              At least 8 characters
            </p>
          </div>
          {error && (
            <p
              id="signup-error"
              role="alert"
              className="text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
