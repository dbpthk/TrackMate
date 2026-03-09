import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export type SharedPR = {
  id: number;
  sharerId: number;
  sharerName: string;
  sharedAt: string;
  records: Array<{
    exerciseName: string;
    weight: number;
    reps: number | null;
    date: string;
  }>;
};

type SharedPersonalRecordsFeedProps = {
  shared: SharedPR[];
};

function formatDate(d: string) {
  const date = d.includes("T") ? new Date(d) : new Date(d + "T12:00:00");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SharedPersonalRecordsFeed({ shared }: SharedPersonalRecordsFeedProps) {
  return (
    <section aria-labelledby="shared-pr-heading">
      <h2 id="shared-pr-heading" className="mb-4 text-lg font-semibold text-foreground">
        Shared Personal Records
      </h2>
      {shared.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
          Workouts are private. Only personal records shared by buddies from their Stats page appear here.
        </p>
      ) : (
      <ul className="space-y-4" role="list" aria-label="Personal records shared by buddies">
        {shared.map((s) => (
          <li key={s.id}>
            <Card as="article" aria-label={`${s.sharerName}'s personal records`}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle as="h3">{s.sharerName}</CardTitle>
                  <time
                    dateTime={s.sharedAt}
                    className="text-sm text-muted-foreground"
                  >
                    shared {formatDate(s.sharedAt)}
                  </time>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {s.records.map((pr, i) => (
                    <li
                      key={`${pr.exerciseName}-${pr.weight}-${i}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-foreground">{pr.exerciseName}</span>
                      <span className="font-medium text-primary">
                        {pr.weight} kg
                        {pr.reps != null ? ` × ${pr.reps}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}
