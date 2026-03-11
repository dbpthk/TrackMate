"use client";

import { useState } from "react";
import useSWR from "swr";
import { WorkoutDayCard } from "@/components/WorkoutDayCard";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import { DayMuscleGroupSelector } from "@/components/DayMuscleGroupSelector";
import { LogWorkoutModal } from "@/components/LogWorkoutModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/Button";
import { ChevronDown } from "lucide-react";
import {
  getTodayDate,
  workoutsForDay,
  getTodayWorkoutForDay,
} from "@/lib/workout-utils";

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? r.json() : null));

type WorkoutDayExerciseWithExercise = {
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

type WorkoutDay = {
  id: string;
  splitId: string;
  dayName: string;
  dayOrder: number;
  muscleGroups?: string[] | null;
  workoutDayExercises: WorkoutDayExerciseWithExercise[];
};

type WorkoutSplit = {
  id: string;
  userId: number;
  splitType: string;
  workoutDays: WorkoutDay[];
};

type LoggedWorkout = {
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

export function WorkoutPageClient() {
  const [addModalDay, setAddModalDay] = useState<WorkoutDay | null>(null);
  const [logModalDay, setLogModalDay] = useState<WorkoutDay | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [muscleGroupsExpanded, setMuscleGroupsExpanded] = useState(false);

  const {
    data: split,
    mutate: mutateSplit,
    isLoading: splitLoading,
  } = useSWR<WorkoutSplit | null>("/api/workout-split", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  const {
    data: workouts = [],
    mutate: mutateWorkouts,
    isLoading: workoutsLoading,
  } = useSWR<LoggedWorkout[]>("/api/workouts", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const loading = splitLoading || workoutsLoading;

  const revalidate = () => {
    void mutateSplit();
    void mutateWorkouts();
  };

  const handleRemoveExercise = async (id: string) => {
    if (!split) return;
    const previousSplit = split;
    const optimisticSplit: WorkoutSplit = {
      ...split,
      workoutDays: split.workoutDays.map((d) => ({
        ...d,
        workoutDayExercises: d.workoutDayExercises.filter((we) => we.id !== id),
      })),
    };
    mutateSplit(optimisticSplit, { revalidate: false });
    try {
      const res = await fetch(
        `/api/workout-day-exercises?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to remove exercise");
      }
      void mutateSplit();
    } catch (err) {
      mutateSplit(previousSplit, { revalidate: false });
      void mutateSplit();
      setRemoveError(err instanceof Error ? err.message : "Failed to remove exercise");
    }
  };

  const handleUpdateMuscleGroups = async (
    dayId: string,
    muscleGroups: string[]
  ) => {
    if (!split) return;
    const previousSplit = split;
    const optimisticSplit: WorkoutSplit = {
      ...split,
      workoutDays: split.workoutDays.map((d) =>
        d.id === dayId ? { ...d, muscleGroups } : d
      ),
    };
    mutateSplit(optimisticSplit, { revalidate: false });
    try {
      const res = await fetch(`/api/workout-days/${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muscleGroups }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update muscle groups");
      }
      void mutateSplit();
    } catch (err) {
      mutateSplit(previousSplit, { revalidate: false });
      void mutateSplit();
      setRemoveError(err instanceof Error ? err.message : "Failed to update muscle groups");
    }
  };

  const handleLogSave = () => {
    revalidate();
  };

  return (
    <main
      className="min-h-screen bg-background px-4 py-8"
      role="main"
      aria-label="Workout split"
    >
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">
          Your Workout Split
        </h1>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !split ? (
          <p className="rounded-lg border border-border bg-surface p-6 text-center text-muted-foreground">
            Set your training split in Profile to see your workout days.
          </p>
        ) : (
          <div className="space-y-6">
            <section aria-label="Muscle groups per day">
              <button
                type="button"
                onClick={() => setMuscleGroupsExpanded((prev) => !prev)}
                className="mb-4 flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
                aria-expanded={muscleGroupsExpanded}
              >
                <h2 className="text-lg font-semibold text-foreground">
                  Muscle groups for each day
                </h2>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${muscleGroupsExpanded ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {muscleGroupsExpanded && (
                <>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Select muscle groups for each day. Recommended splits are
                    pre-selected.
                  </p>
                  <div className="mb-8 space-y-4">
                    {split.workoutDays.map((day) => (
                      <DayMuscleGroupSelector
                        key={day.id}
                        dayId={day.id}
                        dayName={day.dayName}
                        dayOrder={day.dayOrder}
                        muscleGroups={day.muscleGroups ?? []}
                        onSave={(groups) =>
                          handleUpdateMuscleGroups(day.id, groups)
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            <h2 className="text-lg font-semibold text-foreground">
              Exercises
            </h2>
            {split.workoutDays.map((day) => (
              <WorkoutDayCard
                key={day.id}
                dayName={day.dayName}
                exercises={day.workoutDayExercises}
                weightLogs={workoutsForDay(workouts, day.dayName)}
                onAddExercise={() => setAddModalDay(day)}
                onLogWorkout={() => setLogModalDay(day)}
                onRemoveExercise={handleRemoveExercise}
              />
            ))}
          </div>
        )}
      </div>

      {addModalDay && (
        <AddExerciseModal
          isOpen={!!addModalDay}
          onClose={() => setAddModalDay(null)}
          dayName={addModalDay.dayName}
          workoutDayId={addModalDay.id}
          dayMuscleGroups={addModalDay.muscleGroups ?? []}
          existingExercises={addModalDay.workoutDayExercises.map((we) => ({
            id: we.exerciseId,
            name: we.exercise.name,
            muscleGroup: we.exercise.muscleGroup,
            sets: we.sets,
            reps: we.reps,
          }))}
          onSave={() => void mutateSplit()}
        />
      )}
      <Dialog open={!!removeError} onOpenChange={(open) => !open && setRemoveError(null)}>
        <DialogContent className="max-w-sm" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Could not remove exercise</DialogTitle>
          </DialogHeader>
          {removeError && (
            <p className="text-sm text-muted-foreground">{removeError}</p>
          )}
          <DialogFooter className="sm:justify-end">
            <Button size="sm" onClick={() => setRemoveError(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {logModalDay && (
        <LogWorkoutModal
          isOpen={!!logModalDay}
          onClose={() => setLogModalDay(null)}
          dayName={logModalDay.dayName}
          exercises={logModalDay.workoutDayExercises.map((we) => ({
            id: we.exerciseId,
            name: we.exercise.name,
            muscleGroup: we.exercise.muscleGroup,
            sets: we.sets ?? undefined,
            reps: we.reps ?? undefined,
          }))}
          date={getTodayDate()}
          existingWorkout={getTodayWorkoutForDay(
            workouts,
            logModalDay.dayName,
            getTodayDate()
          )}
          onSave={handleLogSave}
        />
      )}
    </main>
  );
}
