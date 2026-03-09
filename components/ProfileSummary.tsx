import Link from "next/link";

export type ProfileSummaryProps = {
  user: {
    name: string;
    goal: string;
    experienceLevel: string;
    trainingSplit: string;
    preferredDays: string;
    height: string | number | null;
    weight: string | number | null;
    units: string;
  };
};

function formatValue(value: string | number | undefined | null): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ProfileSummary({ user }: ProfileSummaryProps) {
  const isMetric = user.units !== "imperial";
  const heightUnit = isMetric ? "cm" : "in";
  const weightUnit = isMetric ? "kg" : "lbs";
  const preferredDaysList = user.preferredDays
    ? user.preferredDays.split(/[,\s]+/).filter(Boolean)
    : [];

  return (
    <section
      className="rounded-lg border border-border bg-surface p-4"
      aria-label="Profile summary"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Your Profile</h2>
        <Link
          href="/profile"
          className="text-sm font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 hover:decoration-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          Edit profile
        </Link>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-medium text-foreground">
            {formatValue(user.name)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Goal</dt>
          <dd className="font-medium text-foreground">
            {formatValue(user.goal)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Experience</dt>
          <dd className="font-medium text-foreground">
            {user.experienceLevel
              ? capitalize(user.experienceLevel)
              : formatValue(null)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Training Split</dt>
          <dd className="font-medium text-foreground">
            {formatValue(user.trainingSplit)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Preferred Days</dt>
          <dd className="font-medium text-foreground">
            {preferredDaysList.length > 0
              ? preferredDaysList.join(", ")
              : formatValue(null)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Height / Weight</dt>
          <dd className="font-medium text-foreground">
            {formatValue(user.height)} {heightUnit} / {formatValue(user.weight)}{" "}
            {weightUnit}
          </dd>
        </div>
      </dl>
    </section>
  );
}
