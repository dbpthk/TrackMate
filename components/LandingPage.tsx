"use client";

import Link from "next/link";

const FEATURES = [
  {
    icon: "📋",
    title: "Smart Workout Splits",
    description:
      "Choose your split (3–6 days), customize muscle groups per day, and build your ideal routine.",
  },
  {
    icon: "📊",
    title: "Track Progress",
    description:
      "Log sets, reps, and weights. Watch your strength grow with charts, PRs, and volume stats.",
  },
  {
    icon: "🔥",
    title: "Stay Consistent",
    description:
      "Weekly progress, streaks, and today's focus keep you accountable and motivated.",
  },
  {
    icon: "🤝",
    title: "Share with Buddies",
    description:
      "Add workout buddies, share personal records, and push each other to new heights.",
  },
];

export function LandingPage() {
  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] overflow-hidden"
      style={{
        fontFamily: "'Source Sans 3', system-ui, sans-serif",
      }}
    >
      {/* Hero */}
      <section className="relative px-4 pt-12 pb-20 sm:pt-20 sm:pb-28 md:pt-28 md:pb-36">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-primary), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <span
            className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Free to start • No credit card
          </span>
          <h1
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            style={{
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Your workouts.
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Tracked. Simple.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Build splits, log sets, hit PRs, and stay consistent. The fitness
            tracker that gets out of your way so you can focus on lifting.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/auth/signup"
              className="inline-flex min-h-[3rem] min-w-[12rem] items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Get started free
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex min-h-[3rem] min-w-[12rem] items-center justify-center rounded-xl border-2 border-border bg-surface px-8 py-3 text-base font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-surface-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-surface-muted/30 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl md:text-4xl"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Everything you need to get stronger
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <span className="text-3xl" aria-hidden>
                  {f.icon}
                </span>
                <h3
                  className="mt-4 text-lg font-bold text-foreground"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-muted to-primary/5 px-8 py-12 text-center sm:px-12 sm:py-16 dark:from-primary/20 dark:to-primary/10">
          <h2
            className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Ready to level up your training?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join TrackMate and start building the body you want.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>
            <Link href="/about" className="text-primary hover:underline">
              About
            </Link>
          </div>
          <p className="mt-4">© {new Date().getFullYear()} TrackMate</p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            Created by Dhruv{" "}
            <span className="inline-flex items-center text-xs opacity-80">
              ❤️
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
