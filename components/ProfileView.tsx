import type { ProfileFormValues } from "@/components/ProfileForm";
import { TRAINING_SPLIT_DETAILS } from "@/drizzle/schema";

export type ProfileViewProps = {
  user: ProfileFormValues;
};

function formatValue(value: string | undefined | null): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ProfileView({ user }: ProfileViewProps) {
  const isMetric = user.units !== "imperial";
  const heightUnit = isMetric ? "cm" : "in";
  const weightUnit = isMetric ? "kg" : "lbs";
  const preferredDaysList = user.preferredDays
    ? user.preferredDays.split(/[,\s]+/).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">User Info</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
            <dd className="text-foreground">{formatValue(user.name)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="text-foreground">{formatValue(user.email)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Goal</dt>
            <dd className="text-foreground">{formatValue(user.goal)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Experience Level
            </dt>
            <dd className="text-foreground">
              {user.experienceLevel
                ? capitalize(user.experienceLevel)
                : formatValue(null)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Body Stats</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Height ({heightUnit})
            </dt>
            <dd className="text-foreground">{formatValue(user.height)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Weight ({weightUnit})
            </dt>
            <dd className="text-foreground">{formatValue(user.weight)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Age</dt>
            <dd className="text-foreground">{formatValue(user.age)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Body Fat %
            </dt>
            <dd className="text-foreground">{formatValue(user.bodyFat)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Workout Preferences
        </h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Training Split
            </dt>
            <dd className="text-foreground">
              {formatValue(user.trainingSplit)}
              {user.trainingSplit &&
                user.trainingSplit in TRAINING_SPLIT_DETAILS && (
                  <ul className="mt-2 space-y-1 rounded border border-border bg-surface-muted/50 px-4 py-3 text-sm text-foreground">
                    {TRAINING_SPLIT_DETAILS[
                      user.trainingSplit as keyof typeof TRAINING_SPLIT_DETAILS
                    ].map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Preferred Days
            </dt>
            <dd className="text-foreground">
              {preferredDaysList.length > 0
                ? preferredDaysList.join(", ")
                : formatValue(null)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Units</dt>
            <dd className="text-foreground">
              {user.units ? capitalize(user.units) : formatValue(null)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
