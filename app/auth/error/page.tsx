import Link from "next/link";

export const metadata = {
  title: "Auth error | TrackMate",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorCode = params.error ?? "Unknown error";
  const message =
    errorCode === "VerificationRequired"
      ? "Please verify your email before signing in."
      : errorCode;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4"
      role="main"
      aria-label="Authentication error page"
    >
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Authentication error
        </h1>
        <p className="mb-6 text-muted-foreground" role="alert">
          {message}
        </p>
        <Link
          href="/auth/signin"
          className="inline-block rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
