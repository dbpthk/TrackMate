import Link from "next/link";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4"
      role="main"
    >
      <h1 className="text-2xl font-semibold text-foreground">
        Welcome to TrackMate
      </h1>
      <nav className="flex gap-4" aria-label="Auth navigation">
        <Link
          href="/auth/signin"
          className="text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Sign up
        </Link>
        <Link
          href="/profile"
          className="text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Profile
        </Link>
      </nav>
    </main>
  );
}
