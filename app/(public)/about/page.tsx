import Link from "next/link";

export const metadata = {
  title: "About | TrackMate",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center bg-background px-4 pt-16 pb-12">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-primary hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          About TrackMate
        </h1>
        <div className="space-y-6 text-sm text-muted-foreground">
          <p>
            TrackMate is a simple fitness tracker to help you build splits, log
            workouts, and stay consistent. No fluff—just the tools you need to
            get stronger.
          </p>
          <section>
            <h2 className="mb-2 font-medium text-foreground">What it does</h2>
            <p>
              Create workout splits, customize muscle groups per day, log sets
              and reps, track progress with charts and PRs, and share with
              workout buddies.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-foreground">Created by</h2>
            <p>
              Built by Dhruv with ❤️. Questions or feedback?{" "}
              <a
                href="mailto:dpthk2024@gmail.com"
                className="text-primary hover:underline"
              >
                dpthk2024@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
