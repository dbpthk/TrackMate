"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";
import { AddWorkoutModal } from "./AddWorkoutModal";
import type { WorkoutWithExercises } from "./WorkoutCard";
import {
  getGreeting,
  getTodayWeekday,
  getTodayDate,
  getWeekDates,
  getWeekStartEnd,
  getTodaysFocus,
  getUpcomingWorkouts,
  MOTIVATIONAL_QUOTES,
} from "@/lib/home-utils";

type HomeDashboardProps = {
  user: {
    name: string;
    trainingSplit: string | null;
    preferredDays: string | null;
  };
  weekWorkouts: WorkoutWithExercises[];
  todayWorkout: WorkoutWithExercises | null;
};

export function HomeDashboard({
  user,
  weekWorkouts,
  todayWorkout: initialTodayWorkout,
}: HomeDashboardProps) {
  const router = useRouter();
  const [workouts, setWorkouts] = useState(weekWorkouts);
  const [todayWorkout, setTodayWorkout] = useState(initialTodayWorkout);
  const [modalOpen, setModalOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const todayDate = getTodayDate();
  const todaysFocus = getTodaysFocus(
    user.trainingSplit || null,
    user.preferredDays || null
  );
  const upcoming = getUpcomingWorkouts(
    user.trainingSplit || null,
    user.preferredDays || null,
    5
  );
  const weekDates = getWeekDates();
  const completedDates = new Set(workouts.map((w) => w.date));
  const weekCompleted = weekDates.filter((d) => completedDates.has(d.date)).length;
  const totalWeekDays = user.preferredDays
    ? user.preferredDays.split(/[,\s]+/).filter(Boolean).length
    : 3;

  const fetchWorkouts = useCallback(async () => {
    const res = await fetch("/api/workouts");
    if (res.ok) {
      const data: WorkoutWithExercises[] = await res.json();
      const { start, end } = getWeekStartEnd();
      const week = data.filter(
        (w) => w.date >= start && w.date <= end
      );
      const today = data.find((w) => w.date === todayDate) ?? null;
      setWorkouts(week);
      setTodayWorkout(today ?? null);
    }
  }, [todayDate]);

  useEffect(() => {
    const id = setInterval(
      () => setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

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
    await fetchWorkouts();
  };

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

  const firstName = user.name?.split(/\s+/)[0] || "there";

  return (
    <>
      <main
        className="min-h-[calc(100vh-3.5rem)] pb-6 md:pb-8"
        role="main"
        aria-label="Home dashboard"
      >
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:py-8">
          {/* 1. Header / Hero */}
          <section aria-label="Welcome">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {getGreeting()}, {firstName} 💪
            </h1>
            {todaysFocus && (
              <p className="mt-1 text-lg text-muted-foreground">
                Today&apos;s focus: {todaysFocus}
              </p>
            )}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weekly progress</span>
                <span className="font-medium text-foreground">
                  {weekCompleted}/{totalWeekDays} sessions
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${totalWeekDays ? (weekCompleted / totalWeekDays) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* 2. Today's Workout Preview */}
          <section aria-label="Today's workout">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle as="h2">Today&apos;s Workout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayWorkout ? (
                  <>
                    <p className="text-foreground">
                      <span className="font-medium">{todayWorkout.type}</span>
                      {todayWorkout.exercises?.length ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {todayWorkout.exercises.length} exercises
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Completed
                    </p>
                  </>
                ) : todaysFocus ? (
                  <>
                    <p className="text-foreground">{todaysFocus}</p>
                    <Button
                      size="lg"
                      onClick={() => setModalOpen(true)}
                      className="min-h-[3rem] w-full sm:w-auto"
                      aria-label="Start workout"
                    >
                      Start Workout
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Set your training split and preferred days in{" "}
                    <Link
                      href="/profile"
                      className="text-primary underline underline-offset-2"
                    >
                      Profile
                    </Link>{" "}
                    to see today&apos;s workout.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* 3. Workout Progress / Streaks */}
          <section aria-label="Weekly progress">
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              This Week
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {weekDates.map(({ date, weekday }) => {
                const done = completedDates.has(date);
                const isToday = date === todayDate;
                return (
                  <div
                    key={date}
                    className={`flex min-w-[2.75rem] flex-col items-center rounded-lg border p-2.5 transition-colors ${
                      done
                        ? "border-primary bg-primary/10 text-primary"
                        : isToday
                          ? "border-primary/50 bg-surface-muted"
                          : "border-border bg-surface"
                    }`}
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {weekday.slice(0, 2)}
                    </span>
                    <span
                      className="mt-1 text-lg"
                      aria-label={done ? `${weekday} completed` : `${weekday} not done`}
                    >
                      {done ? "✓" : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Upcoming Workouts */}
          {upcoming.length > 0 && (
            <section aria-label="Upcoming workouts">
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Upcoming
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {upcoming.map(({ date, weekday, type }) => {
                  const done = completedDates.has(date);
                  const isToday = date === todayDate;
                  return (
                    <Link
                      key={date}
                      href="/workouts"
                      className={`flex min-w-[8rem] flex-col rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${
                        done
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-surface hover:border-primary/30"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {weekday}
                      </span>
                      <span className="mt-1 font-medium text-foreground">
                        {type}
                      </span>
                      {done && (
                        <span className="mt-2 text-xs text-green-600 dark:text-green-400">
                          Done ✓
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. Quick Actions */}
          <section aria-label="Quick actions">
            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                className="min-h-[3rem]"
                aria-label="Start workout"
              >
                Start Workout
              </Button>
              <Link
                href="/workouts"
                className="inline-flex h-11 min-h-[3rem] items-center justify-center rounded-lg bg-surface-muted px-6 text-base font-medium text-foreground shadow-sm transition-all hover:bg-surface-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                View All Workouts
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setModalOpen(true)}
                className="min-h-[3rem]"
                aria-label="Add custom workout"
              >
                Add Custom Workout
              </Button>
            </div>
          </section>

          {/* 6. Motivational Section */}
          <section
            aria-label="Motivation"
            className="rounded-lg border border-border bg-surface/50 px-4 py-3"
          >
            <p className="text-center text-sm italic text-muted-foreground">
              &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;
            </p>
          </section>
        </div>
      </main>

      <AddWorkoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={{
          date: todayDate,
          type: todaysFocus || undefined,
        }}
        onSave={handleSave}
        getSuggestion={getSuggestion}
      />
    </>
  );
}
