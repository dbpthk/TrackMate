export default function BuddiesLoading() {
  return (
    <main
      className="min-h-screen bg-background px-4 py-8"
      role="main"
      aria-label="Loading buddies"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="h-9 w-32 animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="space-y-8">
          <div className="h-24 animate-pulse rounded-lg border border-border bg-surface" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg border border-border bg-surface"
              />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
        </div>
      </div>
    </main>
  );
}
