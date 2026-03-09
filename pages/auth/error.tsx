import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function AuthErrorPage() {
  const router = useRouter();
  const error = (router.query.error as string) ?? "Unknown error";

  return (
    <>
      <Head>
        <title>Auth error | TrackMate</title>
      </Head>
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
            {error}
          </p>
          <Link
            href="/auth/signin"
            className="inline-block rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Try again
          </Link>
        </div>
      </main>
    </>
  );
}
