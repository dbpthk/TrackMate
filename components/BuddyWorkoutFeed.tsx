import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export type BuddyWorkout = {
  id: number;
  userId: number;
  date: string;
  type: string;
  buddyName: string;
  buddyStreak?: number;
  exercises: Array<{
    id: number;
    name: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
    duration: number | null;
  }>;
};

type BuddyWorkoutFeedProps = {
  workouts: BuddyWorkout[];
};

export function BuddyWorkoutFeed({ workouts }: BuddyWorkoutFeedProps) {
  if (workouts.length === 0) {
    return (
      <section aria-labelledby="feed-heading">
        <h2 id="feed-heading" className="mb-4 text-lg font-semibold text-foreground">
          Buddy workouts
        </h2>
        <p className="rounded border border-border bg-surface p-6 text-center text-muted-foreground" role="status">
          No buddy workouts yet. Follow buddies to see their workouts here.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="feed-heading">
      <h2 id="feed-heading" className="mb-4 text-lg font-semibold text-foreground">
        Buddy workouts
      </h2>
      <ul
        className="space-y-4"
        role="list"
        aria-label="Workouts from buddies"
      >
        {workouts.map((w) => (
          <li key={w.id}>
            <Card
              as="article"
              aria-label={`${w.buddyName}'s workout: ${w.type} on ${w.date}`}
            >
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle as="h3">{w.type}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    by {w.buddyName}
                  </span>
                  {w.buddyStreak != null && w.buddyStreak > 0 && (
                    <span
                      className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
                      aria-label={`${w.buddyStreak} day streak`}
                    >
                      {w.buddyStreak} day streak
                    </span>
                  )}
                </div>
                <time
                  dateTime={w.date}
                  className="text-sm text-muted-foreground"
                >
                  {new Date(w.date + "T12:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </CardHeader>
              <CardContent>
                {(w.exercises ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No exercises</p>
                ) : (
                  <ul className="space-y-2" role="list">
                    {(w.exercises ?? []).map((ex) => (
                      <li
                        key={ex.id}
                        className="flex flex-wrap gap-x-4 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {ex.name}
                        </span>
                        <span className="text-muted-foreground">
                          {[
                            ex.sets != null && `${ex.sets} sets`,
                            ex.reps != null && `${ex.reps} reps`,
                            ex.weight != null && `${ex.weight} kg`,
                            ex.duration != null && `${ex.duration} min`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
