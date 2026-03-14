export default function WorkoutLoading() {
  return (
    <main
      className="min-h-screen bg-background px-4 py-8"
      role="main"
      aria-label="Loading workout split"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 h-9 w-56 animate-pulse rounded bg-surface-muted" />
        <div className="mb-6 h-10 w-full animate-pulse rounded-lg bg-surface-muted" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="mb-3 h-6 w-24 animate-pulse rounded bg-surface-muted" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-14 animate-pulse rounded bg-surface-muted"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
