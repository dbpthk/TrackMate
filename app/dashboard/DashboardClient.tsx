"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SharePersonalRecordsModal } from "@/components/SharePersonalRecordsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/Button";

const StatsCharts = dynamic(
  () =>
    import("@/components/StatsCharts").then((m) => ({
      default: m.StatsCharts,
    })),
  {
    ssr: false,
    loading: () => <p className="text-muted-foreground">Loading charts…</p>,
  }
);

type DashboardClientProps = {
  totalWorkouts: number;
  totalVolume: number;
  personalRecords: Array<{
    exerciseName: string;
    weight: number;
    reps: number | null;
    date: string;
  }>;
  muscleDistribution: Array<{ muscleGroup: string; count: number }>;
  strengthProgress: Array<{
    date: string;
    weight: number;
    exerciseName: string;
  }>;
  workoutFrequency: Array<{ week: string; count: number }>;
  recentWorkouts: Array<{
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
  }>;
  volumeByDate: Array<{ date: string; volume: number }>;
  volumeByWeek: Array<{ week: string; volume: number }>;
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getLocalDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DashboardClient({
  totalWorkouts: totalWorkoutsProp,
  totalVolume,
  personalRecords,
  muscleDistribution,
  strengthProgress,
  workoutFrequency,
  recentWorkouts: initialRecentWorkouts,
  volumeByDate,
  volumeByWeek,
}: DashboardClientProps) {
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState(initialRecentWorkouts);
  const [totalWorkouts, setTotalWorkouts] = useState(totalWorkoutsProp);
  const [streak, setStreak] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deletedIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setTotalWorkouts(totalWorkoutsProp);
  }, [totalWorkoutsProp]);

  useEffect(() => {
    const filtered = initialRecentWorkouts.filter(
      (w) => !deletedIdsRef.current.has(w.id)
    );
    setRecentWorkouts(filtered);
    const toRemove: number[] = [];
    deletedIdsRef.current.forEach((id) => {
      if (!initialRecentWorkouts.some((w) => w.id === id)) {
        toRemove.push(id);
      }
    });
    toRemove.forEach((id) => deletedIdsRef.current.delete(id));
  }, [initialRecentWorkouts]);

  const fetchStreak = useCallback(async () => {
    const dateStr = getLocalDateString();
    try {
      const res = await fetch(`/api/stats/streak?date=${dateStr}`);
      if (res.ok) {
        const { streak: s } = await res.json();
        setStreak(s);
      } else {
        setStreak(0);
      }
    } catch {
      setStreak(0);
    }
  }, []);

  useEffect(() => {
    void fetchStreak();
  }, [fetchStreak]);

  const handleDeleteClick = (id: number) => {
    setDeleteWorkoutId(id);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteWorkoutId == null) return;
    const idToDelete = deleteWorkoutId;
    const workoutToRestore = recentWorkouts.find((w) => w.id === idToDelete);

    setDeleting(true);
    setDeleteError(null);
    setDeleteWorkoutId(null);
    deletedIdsRef.current.add(idToDelete);
    setRecentWorkouts((prev) => prev.filter((w) => w.id !== idToDelete));
    setTotalWorkouts((prev) => Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/workouts/${idToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
        void fetchStreak();
      } else {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
    } catch (err) {
      deletedIdsRef.current.delete(idToDelete);
      setTotalWorkouts((prev) => prev + 1);
      if (workoutToRestore) {
        setRecentWorkouts((prev) =>
          [...prev, workoutToRestore].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
      setDeleteWorkoutId(idToDelete);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open) {
      setDeleteWorkoutId(null);
      setDeleteError(null);
    }
  };

  return (
    <main
      className="min-h-screen bg-background px-4 py-8"
      role="main"
      aria-label="User stats"
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">
          User Stats
        </h1>

        <section aria-label="Overview" className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Overview Cards
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Workouts</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {totalWorkouts}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {streak === null
                  ? "—"
                  : `${streak} ${streak === 1 ? "day" : "days"}`}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {totalVolume.toLocaleString()} kg
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Progress charts" className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Progress Charts
          </h2>
          <StatsCharts
            strengthProgress={strengthProgress}
            workoutFrequency={workoutFrequency}
            volumeByDate={volumeByDate}
            volumeByWeek={volumeByWeek}
          />
        </section>

        <section aria-label="Insights" className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Insights
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-3 font-medium text-foreground">
                Muscle Distribution
              </h3>
              {muscleDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Log workouts with weights to see distribution.
                </p>
              ) : (
                <ul className="space-y-2">
                  {muscleDistribution.slice(0, 8).map((m) => (
                    <li
                      key={m.muscleGroup}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize text-foreground">
                        {m.muscleGroup}
                      </span>
                      <span className="text-muted-foreground">
                        {m.count.toLocaleString()} kg
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-medium text-foreground">
                  Personal Records
                </h3>
                {personalRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="rounded px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Share personal records with buddies"
                  >
                    Share
                  </button>
                )}
              </div>
              {personalRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Log workouts with weights to track PRs.
                </p>
              ) : (
                <ul className="space-y-2">
                  {personalRecords.slice(0, 8).map((pr) => (
                    <li
                      key={`${pr.exerciseName}-${pr.weight}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground">{pr.exerciseName}</span>
                      <span className="font-medium text-primary">
                        {pr.weight} kg
                        {pr.reps != null ? ` × ${pr.reps}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section aria-label="Recent workouts">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            History
          </h2>
          <h3 className="mb-3 text-base font-medium text-foreground">
            Recent Workouts
          </h3>
          {recentWorkouts.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface p-6 text-center text-muted-foreground">
              No workouts yet.{" "}
              <Link
                href="/workout"
                className="text-primary underline underline-offset-2"
              >
                Log a workout
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentWorkouts.map((w) => (
                <li
                  key={w.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">
                        {w.type}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formatDate(w.date)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(w.id)}
                      className="shrink-0 rounded px-2 py-1 text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`Delete workout from ${formatDate(w.date)}`}
                    >
                      Delete
                    </button>
                  </div>
                  {w.exercises && w.exercises.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {w.exercises.map((ex) => (
                        <li key={ex.id}>
                          {ex.name}
                          {(ex.sets != null ||
                            ex.reps != null ||
                            ex.weight != null) && (
                            <span className="ml-2">
                              — {ex.sets ?? "?"}×{ex.reps ?? "?"}
                              {ex.weight != null ? ` @ ${ex.weight} kg` : ""}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <SharePersonalRecordsModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        personalRecords={personalRecords}
      />
      <Dialog open={deleteWorkoutId != null} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent className="max-w-sm" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Delete this workout?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This cannot be undone.
          </p>
          {deleteError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
            >
              {deleteError}
            </p>
          )}
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCloseDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
              aria-busy={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
