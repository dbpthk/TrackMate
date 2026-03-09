import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { WorkoutDayCard } from "@/components/WorkoutDayCard";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import { DayMuscleGroupSelector } from "@/components/DayMuscleGroupSelector";

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};

export default function WorkoutPage() {
  const [split, setSplit] = useState<WorkoutSplit | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalDay, setAddModalDay] = useState<WorkoutDay | null>(null);

  const fetchSplit = async () => {
    const res = await fetch("/api/workout-split");
    if (res.ok) {
      const data = await res.json();
      setSplit(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSplit();
  }, []);

  const handleRemoveExercise = async (id: string) => {
    const res = await fetch(`/api/workout-day-exercises?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchSplit();
    }
  };

  const handleUpdateMuscleGroups = async (dayId: string, muscleGroups: string[]) => {
    const res = await fetch(`/api/workout-days/${dayId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ muscleGroups }),
    });
    if (res.ok) {
      await fetchSplit();
    }
  };

  return (
    <>
      <Head>
        <title>Workout Split | TrackMate</title>
      </Head>
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
                  Select muscle groups for each day. Recommended splits are pre-selected.
                </p>
                <div className="mb-8 space-y-4">
                  {split.workoutDays.map((day) => (
                    <DayMuscleGroupSelector
                      key={day.id}
                      dayId={day.id}
                      dayName={day.dayName}
                      dayOrder={day.dayOrder}
                      muscleGroups={day.muscleGroups ?? []}
                      onSave={(groups) => handleUpdateMuscleGroups(day.id, groups)}
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
                  onAddExercise={() => setAddModalDay(day)}
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
            onSave={fetchSplit}
          />
        )}
      </main>
    </>
  );
}
