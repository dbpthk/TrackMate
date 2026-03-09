import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { WorkoutCard, type WorkoutWithExercises } from "@/components/WorkoutCard";
import { AddWorkoutModal } from "@/components/AddWorkoutModal";
import { Button } from "@/components/Button";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutWithExercises | null>(null);

  const fetchWorkouts = async () => {
    const res = await fetch("/api/workouts");
    if (res.ok) {
      const data = await res.json();
      setWorkouts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const getSuggestion = async (name: string) => {
    const res = await fetch(
      `/api/exercises/suggest?name=${encodeURIComponent(name.trim())}`
    );
    if (!res.ok) return { sets: null, reps: null, weight: null };
    const data = await res.json();
    return {
      sets: data.sets ?? null,
      reps: data.reps ?? null,
      weight: data.weight ?? null,
    };
  };

  const handleSave = async (data: {
    date: string;
    type: string;
    exercises: Array<{
      name: string;
      sets?: number;
      reps?: number;
      weight?: number;
    }>;
  }) => {
    if (editingWorkout) {
      await fetch(`/api/workouts/${editingWorkout.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: data.date, type: data.type }),
      });
      for (const ex of editingWorkout.exercises ?? []) {
        await fetch(`/api/exercises/${ex.id}`, { method: "DELETE" });
      }
      for (const ex of data.exercises) {
        await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workoutId: editingWorkout.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          }),
        });
      }
    } else {
      const createRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: data.date, type: data.type }),
      });
      const workout = await createRes.json();
      if (!workout?.id) throw new Error("Failed to create workout");
      for (const ex of data.exercises) {
        await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workoutId: workout.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          }),
        });
      }
    }
    await fetchWorkouts();
  };

  const handleDelete = async (workoutId: number) => {
    await fetch(`/api/workouts/${workoutId}`, { method: "DELETE" });
    await fetchWorkouts();
  };

  const openAdd = () => {
    setEditingWorkout(null);
    setModalOpen(true);
  };

  const openEdit = (workout: WorkoutWithExercises) => {
    setEditingWorkout(workout);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingWorkout(null);
  };

  return (
    <>
      <Head>
        <title>Workouts | TrackMate</title>
      </Head>
      <main
        className="min-h-screen bg-background px-4 py-8"
        role="main"
        aria-label="Workouts page"
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Workouts
            </h1>
            <Button onClick={openAdd} aria-label="Add workout">
              Add workout
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : workouts.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface p-6 text-center text-muted-foreground">
              No workouts yet. Add your first workout to get started.
            </p>
          ) : (
            <ul className="space-y-4" role="list">
              {workouts.map((w) => (
                <li key={w.id}>
                  <WorkoutCard workout={w} onEdit={openEdit} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <AddWorkoutModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={editingWorkout ? handleDelete : undefined}
          workout={editingWorkout}
          getSuggestion={getSuggestion}
        />
      </main>
    </>
  );
}
