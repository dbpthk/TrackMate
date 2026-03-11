export default function Loading() {
  return (
    <main
      className="min-h-[calc(100vh-3.5rem)] bg-background pb-6 md:pb-8"
      role="main"
      aria-label="Loading"
    >
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:py-8">
        <section>
          <div className="h-9 w-56 animate-pulse rounded bg-surface-muted" />
          <div className="mt-2 h-5 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
          </div>
          <div className="mt-1.5 h-2 animate-pulse rounded-full bg-surface-muted" />
        </section>
        <section className="rounded-lg border border-border bg-surface shadow-md">
          <div className="border-b border-border px-4 py-3 sm:px-6">
            <div className="h-6 w-36 animate-pulse rounded bg-surface-muted" />
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="h-5 w-full animate-pulse rounded bg-surface-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-surface-muted" />
          </div>
        </section>
        <section>
          <div className="mb-3 h-6 w-24 animate-pulse rounded bg-surface-muted" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-20 min-w-[4.5rem] shrink-0 animate-pulse rounded-lg border border-border bg-surface"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
