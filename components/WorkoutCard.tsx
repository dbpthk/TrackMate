import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export type WorkoutWithExercises = {
  id: number;
  userId: number;
  date: string;
  type: string;
  exercises?: Array<{
    id: number;
    name: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
    duration: number | null;
  }>;
};

type WorkoutCardProps = {
  workout: WorkoutWithExercises;
  onEdit?: (workout: WorkoutWithExercises) => void;
};

export function WorkoutCard({ workout, onEdit }: WorkoutCardProps) {
  const exercises = workout.exercises ?? [];

  return (
    <Card
      as="article"
      className="transition-shadow hover:shadow-md"
      aria-label={`Workout ${workout.type} on ${workout.date}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle as="h3">{workout.type}</CardTitle>
          <time
            dateTime={workout.date}
            className="text-sm text-muted-foreground"
          >
            {new Date(workout.date + "T12:00:00").toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(workout)}
            className="rounded px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Edit workout ${workout.type}`}
          >
            Edit
          </button>
        )}
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exercises logged</p>
        ) : (
          <ul className="space-y-2" role="list">
            {exercises.map((ex) => (
              <li
                key={ex.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
              >
                <span className="font-medium text-foreground">{ex.name}</span>
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
  );
}
