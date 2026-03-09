"use client";

import { useState, useEffect } from "react";
import { WorkoutDayCard } from "@/components/WorkoutDayCard";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import { DayMuscleGroupSelector } from "@/components/DayMuscleGroupSelector";
import { LogWorkoutModal } from "@/components/LogWorkoutModal";

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

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

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

function normalizeType(t: string): string {
  return t.trim().replace(/^Day \d+ —\s*/i, "");
}

function workoutsForDay(
  workouts: LoggedWorkout[],
  dayName: string
): LoggedWorkout[] {
  const norm = normalizeType(dayName);
  return workouts.filter(
    (w) => normalizeType(w.type) === norm || w.type === dayName
  );
}

export function WorkoutPageClient() {
  const [split, setSplit] = useState<WorkoutSplit | null>(null);
  const [workouts, setWorkouts] = useState<LoggedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalDay, setAddModalDay] = useState<WorkoutDay | null>(null);
  const [logModalDay, setLogModalDay] = useState<WorkoutDay | null>(null);

  const fetchSplit = async () => {
    const res = await fetch("/api/workout-split");
    if (res.ok) {
      const data = await res.json();
      setSplit(data);
    }
  };

  const fetchWorkouts = async () => {
    const res = await fetch("/api/workouts");
    if (res.ok) {
      const data = await res.json();
      setWorkouts(data);
    }
  };

  useEffect(() => {
    Promise.all([fetchSplit(), fetchWorkouts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleRemoveExercise = async (id: string) => {
    const res = await fetch(
      `/api/workout-day-exercises?id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
    if (res.ok) {
      await Promise.all([fetchSplit(), fetchWorkouts()]);
    }
  };

  const handleUpdateMuscleGroups = async (
    dayId: string,
    muscleGroups: string[]
  ) => {
    const res = await fetch(`/api/workout-days/${dayId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ muscleGroups }),
    });
    if (res.ok) {
      await Promise.all([fetchSplit(), fetchWorkouts()]);
    }
  };

  const handleLogSave = () => {
    fetchSplit();
    fetchWorkouts();
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
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Muscle groups for each day
              </h2>
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
          onSave={fetchSplit}
        />
      )}
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
          onSave={handleLogSave}
        />
      )}
    </main>
  );
}
