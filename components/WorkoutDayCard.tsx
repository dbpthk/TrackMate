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

type WorkoutDayCardProps = {
  dayName: string;
  exercises: WorkoutDayExerciseWithExercise[];
  onAddExercise: () => void;
  onRemoveExercise?: (id: string) => void;
};

export function WorkoutDayCard({
  dayName,
  exercises,
  onAddExercise,
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
        <Button
          variant="outline"
          size="sm"
          onClick={onAddExercise}
          className="w-full"
          aria-label={`Add exercise to ${dayName}`}
        >
          + Add Exercise
        </Button>
      </CardContent>
    </Card>
  );
}
