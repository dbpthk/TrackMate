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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* User Info - card section */}
      <section
        className="profile-section p-4 sm:p-6"
        aria-labelledby="user-info-heading"
      >
        <h2
          id="user-info-heading"
          className="mb-4 text-base font-semibold leading-tight text-foreground sm:text-lg"
        >
          User Info
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
            <dd className="text-base leading-relaxed text-foreground">
              {formatValue(user.name)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="text-base leading-relaxed text-foreground break-all">
              {formatValue(user.email)}
            </dd>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">Goal</dt>
            <dd className="text-base leading-relaxed text-foreground">
              {formatValue(user.goal)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Experience Level
            </dt>
            <dd className="text-base leading-relaxed text-foreground">
              {user.experienceLevel
                ? capitalize(user.experienceLevel)
                : formatValue(null)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Body Stats - responsive grid */}
      <section
        className="profile-section p-4 sm:p-6"
        aria-labelledby="body-stats-heading"
      >
        <h2
          id="body-stats-heading"
          className="mb-4 text-base font-semibold leading-tight text-foreground sm:text-lg"
        >
          Body Stats
        </h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 sm:gap-x-6 sm:gap-y-4">
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Height ({heightUnit})
            </dt>
            <dd className="text-base leading-relaxed text-foreground">
              {formatValue(user.height)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Weight ({weightUnit})
            </dt>
            <dd className="text-base leading-relaxed text-foreground">
              {formatValue(user.weight)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Age</dt>
            <dd className="text-base leading-relaxed text-foreground">
              {formatValue(user.age)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Body Fat %
            </dt>
            <dd className="text-base leading-relaxed text-foreground">
              {formatValue(user.bodyFat)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Workout Preferences */}
      <section
        className="profile-section p-4 sm:p-6"
        aria-labelledby="workout-prefs-heading"
      >
        <h2
          id="workout-prefs-heading"
          className="mb-4 text-base font-semibold leading-tight text-foreground sm:text-lg"
        >
          Workout Preferences
        </h2>
        <dl className="space-y-4 sm:space-y-5">
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Training Split
            </dt>
            <dd className="text-base leading-relaxed text-foreground">
              {formatValue(user.trainingSplit)}
              {user.trainingSplit &&
                user.trainingSplit in TRAINING_SPLIT_DETAILS && (
                  <ul
                    className="mt-3 space-y-1.5 rounded-lg border border-border bg-surface-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground"
                    role="list"
                  >
                    {TRAINING_SPLIT_DETAILS[
                      user.trainingSplit as keyof typeof TRAINING_SPLIT_DETAILS
                    ].map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">
              Preferred Days
            </dt>
            <dd className="text-base leading-relaxed text-foreground">
              {preferredDaysList.length > 0
                ? preferredDaysList.join(", ")
                : formatValue(null)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Units</dt>
            <dd className="text-base leading-relaxed text-foreground">
              {user.units ? capitalize(user.units) : formatValue(null)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
