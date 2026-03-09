import { getSession } from "next-auth/react";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  getTotalWorkoutsCount,
  getWorkoutStreak,
  getTotalVolume,
  getPersonalRecords,
  getMuscleDistributionFromExercises,
  getStrengthProgress,
  getWorkoutFrequency,
  getRecentWorkouts,
  getVolumeByDate,
  getVolumeByWeek,
} from "@/lib/db/queries";

const StatsCharts = dynamic(
  () =>
    import("@/components/StatsCharts").then((m) => ({
      default: m.StatsCharts,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="text-muted-foreground">Loading charts…</p>
    ),
  }
);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session?.user?.id) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  const userId = Number(session.user.id);

  const [
    totalWorkouts,
    streak,
    totalVolume,
    personalRecords,
    muscleDistribution,
    strengthProgress,
    workoutFrequency,
    recentWorkouts,
    volumeByDate,
    volumeByWeek,
  ] = await Promise.all([
    getTotalWorkoutsCount(userId),
    getWorkoutStreak(userId),
    getTotalVolume(userId),
    getPersonalRecords(userId, 15),
    getMuscleDistributionFromExercises(userId),
    getStrengthProgress(userId, undefined, 30),
    getWorkoutFrequency(userId, 12),
    getRecentWorkouts(userId, 10),
    getVolumeByDate(userId),
    getVolumeByWeek(userId),
  ]);

  return {
    props: {
      totalWorkouts,
      streak,
      totalVolume,
      personalRecords,
      muscleDistribution,
      strengthProgress,
      workoutFrequency,
      recentWorkouts: recentWorkouts.map((w) => ({
        id: w.id,
        date: w.date,
        type: w.type,
        exercises: w.exercises,
      })),
      volumeByDate,
      volumeByWeek,
    },
  };
};

type DashboardProps = {
  totalWorkouts: number;
  streak: number;
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

export default function DashboardPage({
  totalWorkouts,
  streak,
  totalVolume,
  personalRecords,
  muscleDistribution,
  strengthProgress,
  workoutFrequency,
  recentWorkouts,
  volumeByDate,
  volumeByWeek,
}: DashboardProps) {
  const router = useRouter();

  const handleDeleteWorkout = async (id: number) => {
    if (!confirm("Delete this workout? This cannot be undone.")) return;
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    if (res.ok) router.replace(router.asPath);
  };

  return (
    <>
      <Head>
        <title>Stats | TrackMate</title>
      </Head>
      <main
        className="min-h-screen bg-background px-4 py-8"
        role="main"
        aria-label="User stats"
      >
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">
            User Stats
          </h1>

          {/* Overview Cards */}
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
                  {streak} {streak === 1 ? "day" : "days"}
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

          {/* Progress Charts */}
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

          {/* Insights */}
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
                <h3 className="mb-3 font-medium text-foreground">
                  Personal Records
                </h3>
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
                        <span className="text-foreground">
                          {pr.exerciseName}
                        </span>
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

          {/* History */}
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
                        onClick={() => handleDeleteWorkout(w.id)}
                        className="shrink-0 rounded px-2 py-1 text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`Delete workout from ${formatDate(w.date)}`}
                      >
                        Delete
                      </button>
                    </div>
                    {w.exercises && w.exercises.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {w.exercises.slice(0, 4).map((ex) => (
                          <li key={ex.id}>
                            {ex.name}
                            {(ex.sets != null || ex.reps != null || ex.weight != null) && (
                              <span className="ml-2">
                                — {ex.sets ?? "?"}×{ex.reps ?? "?"}
                                {ex.weight != null ? ` @ ${ex.weight} kg` : ""}
                              </span>
                            )}
                          </li>
                        ))}
                        {w.exercises.length > 4 && (
                          <li>+{w.exercises.length - 4} more</li>
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
