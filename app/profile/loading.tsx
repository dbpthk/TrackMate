export default function ProfileLoading() {
  return (
    <main
      className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:mx-auto lg:max-w-2xl lg:px-0"
      role="main"
      aria-label="Loading profile"
    >
      <div className="space-y-6 sm:space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
          <div className="h-11 w-28 animate-pulse rounded-lg bg-surface-muted" />
        </header>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
