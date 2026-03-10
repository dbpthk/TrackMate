export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen bg-background px-4 py-8"
      role="main"
      aria-label="Loading stats"
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 h-9 w-48 animate-pulse rounded bg-surface-muted" />
        <section className="mb-8">
          <h2 className="mb-4 h-6 w-32 animate-pulse rounded bg-surface-muted" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-border bg-surface"
              />
            ))}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="mb-4 h-6 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
        </section>
        <section>
          <h2 className="mb-4 h-6 w-24 animate-pulse rounded bg-surface-muted" />
          <div className="h-48 animate-pulse rounded-lg border border-border bg-surface" />
        </section>
      </div>
    </main>
  );
}
