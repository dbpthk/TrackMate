import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";

export type WorkoutDayExerciseWithExercise = {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  sets: number | null;
  reps: string | null;
  order: number;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: string | null;
  };
};

export type WeightLogEntry = {
  id: number;
  date: string;
  type: string;
  exercises: Array<{
    id: number;
    name: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
  }>;
};

type WorkoutDayCardProps = {
  dayName: string;
  exercises: WorkoutDayExerciseWithExercise[];
  weightLogs?: WeightLogEntry[];
  onAddExercise: () => void;
  onLogWorkout?: () => void;
  onRemoveExercise?: (id: string) => void;
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkoutDayCard({
  dayName,
  exercises,
  weightLogs = [],
  onAddExercise,
  onLogWorkout,
  onRemoveExercise,
}: WorkoutDayCardProps) {
  const exercisesByGroup = useMemo(() => {
    const map: Record<string, WorkoutDayExerciseWithExercise[]> = {};
    for (const we of exercises) {
      const mg = we.exercise.muscleGroup;
      if (!map[mg]) map[mg] = [];
      map[mg].push(we);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [exercises]);

  const weightLogsToShow = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const withWeight = weightLogs.filter((log) =>
      log.exercises.some((e) => e.weight != null && e.weight > 0)
    );
    const sorted = [...withWeight].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const todayLog = sorted.find((log) => log.date === today);
    const oldLog = sorted.find((log) => log.date !== today);
    const result: WeightLogEntry[] = [];
    if (todayLog) result.push(todayLog);
    if (oldLog) result.push(oldLog);
    return result;
  }, [weightLogs]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle as="h2">{dayName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exercises yet</p>
        ) : (
          <div className="space-y-3">
            {exercisesByGroup.map(([group, exs]) => (
              <div key={group}>
                <span className="text-xs font-medium capitalize text-muted-foreground">
                  {group}
                </span>
                <ul className="mt-1 space-y-1" role="list">
                  {exs.map((we) => (
                    <li
                      key={we.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <span className="text-foreground">
                        {we.exercise.name}
                        {(we.sets != null || we.reps) && (
                          <span className="ml-2 text-muted-foreground">
                            — {we.sets ?? "?"} × {we.reps ?? "?"}
                          </span>
                        )}
                      </span>
                      {onRemoveExercise && (
                        <button
                          type="button"
                          onClick={() => onRemoveExercise(we.id)}
                          className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-surface-muted hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Remove ${we.exercise.name}`}
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {weightLogsToShow.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Weight logs
            </span>
            <ul className="space-y-2" role="list">
              {weightLogsToShow.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-lg border border-border bg-surface-muted/50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {formatDate(log.date)}
                    </span>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground">
                      {log.exercises
                        .filter((e) => e.weight != null && e.weight > 0)
                        .map((ex) => (
                          <li key={ex.id}>
                            {ex.name}
                            <span className="ml-2">
                              — {ex.sets ?? "?"}×{ex.reps ?? "?"} @ {ex.weight} kg
                            </span>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2">
          {onLogWorkout && exercises.length > 0 && (
            <Button
              size="sm"
              onClick={onLogWorkout}
              className="flex-1"
              aria-label={`Log workout for ${dayName}`}
            >
              Log Workout
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onAddExercise}
            className={onLogWorkout && exercises.length > 0 ? "flex-1" : "w-full"}
            aria-label={`Add exercise to ${dayName}`}
          >
            + Add Exercise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
