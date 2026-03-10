"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import type { WorkoutWithExercises } from "./WorkoutCard";
import {
  getGreeting,
  getTodayWeekday,
  getTodayDate,
  getWeekDates,
  getWeekStartEnd,
  getTodaysFocus,
  getUpcomingWorkouts,
  getDayOptionsForSplit,
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
  const [workouts, setWorkouts] = useState(weekWorkouts);
  const [todayWorkout, setTodayWorkout] = useState(initialTodayWorkout);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [splitDayNames, setSplitDayNames] = useState<string[]>([]);
  const suggestedFocus = getTodaysFocus(
    user.trainingSplit || null,
    user.preferredDays || null
  );
  const dayOptions = getDayOptionsForSplit(user.trainingSplit || null);
  const [selectedDayType, setSelectedDayType] = useState<string>(
    suggestedFocus || (dayOptions[0]?.value ?? "")
  );

  const todayDate = getTodayDate();
  const todaysFocus = splitDayNames.length > 0
    ? selectedDayType
    : suggestedFocus || selectedDayType || dayOptions[0]?.value;
  const upcoming = getUpcomingWorkouts(
    user.trainingSplit || null,
    user.preferredDays || null,
    5
  );
  const weekDates = getWeekDates();
  const completedDates = new Set(workouts.map((w) => w.date));
  const weekCompleted = weekDates.filter((d) =>
    completedDates.has(d.date)
  ).length;
  const totalWeekDays = user.preferredDays
    ? user.preferredDays.split(/[,\s]+/).filter(Boolean).length
    : 3;

  const fetchWorkouts = useCallback(async () => {
    const res = await fetch("/api/workouts");
    if (res.ok) {
      const data: WorkoutWithExercises[] = await res.json();
      const { start, end } = getWeekStartEnd();
      const week = data.filter((w) => w.date >= start && w.date <= end);
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

  useEffect(() => {
    if (!user.trainingSplit) return;
    const fetchSplit = async () => {
      const res = await fetch("/api/workout-split");
      if (res.ok) {
        const data = await res.json();
        const names = data?.workoutDays?.map((d: { dayName: string }) => d.dayName) ?? [];
        setSplitDayNames(names);
        setSelectedDayType((prev) => {
          if (names.length === 0) return prev;
          if (suggestedFocus && names.includes(suggestedFocus)) return suggestedFocus;
          if (prev && names.includes(prev)) return prev;
          return names[0];
        });
      }
    };
    fetchSplit();
  }, [user.trainingSplit, suggestedFocus]);

  const firstName = user.name?.split(/\s+/)[0] || "there";

  const availableDayOptions = splitDayNames.length > 0
    ? splitDayNames.map((name) => ({ value: name, label: name }))
    : dayOptions;

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
                {todaysFocus ? (
                  <>
                    {availableDayOptions.length > 1 && !todayWorkout && (
                      <div>
                        <label
                          htmlFor="home-day-select"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          What workout today?
                        </label>
                        <select
                          id="home-day-select"
                          value={selectedDayType}
                          onChange={(e) => setSelectedDayType(e.target.value)}
                          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {availableDayOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {(availableDayOptions.length <= 1 || todayWorkout) && (
                      <p className="text-foreground">
                        {todayWorkout ? todayWorkout.type : todaysFocus}
                      </p>
                    )}
                    {todayWorkout ? (
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => {
                            setTodayWorkout(null);
                            setWorkouts((prev) =>
                              prev.filter((w) => w.date !== todayDate)
                            );
                            void fetch(
                              `/api/workouts/${todayWorkout.id}`,
                              { method: "DELETE" }
                            ).then(() => void fetchWorkouts());
                          }}
                          className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                          aria-label="Undo — mark as not completed"
                        />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ✓ Completed — uncheck to undo for today
                        </span>
                      </label>
                    ) : (
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => {
                            const optimistic: WorkoutWithExercises = {
                              id: -1,
                              userId: 0,
                              date: todayDate,
                              type: todaysFocus,
                              exercises: [],
                            };
                            setTodayWorkout(optimistic);
                            setWorkouts((prev) => {
                              const filtered = prev.filter(
                                (w) => w.date !== todayDate
                              );
                              return [...filtered, optimistic].sort(
                                (a, b) =>
                                  new Date(a.date).getTime() -
                                  new Date(b.date).getTime()
                              );
                            });
                            void fetch("/api/workouts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                date: todayDate,
                                type: todaysFocus,
                              }),
                            }).then((res) => {
                              if (res.ok) void fetchWorkouts();
                              else {
                                setTodayWorkout(null);
                                setWorkouts((prev) =>
                                  prev.filter((w) => w.date !== todayDate)
                                );
                              }
                            });
                          }}
                          className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                          aria-label="Mark today's session as completed"
                        />
                        <span className="text-sm text-foreground">
                          Mark as completed
                        </span>
                      </label>
                    )}
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
                      aria-label={
                        done ? `${weekday} completed` : `${weekday} not done`
                      }
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
                  return (
                    <Link
                      key={date}
                      href="/workout"
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
            <Link
              href="/workout"
              className="inline-flex h-11 min-h-[3rem] w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              View My Split
            </Link>
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
    </>
  );
}
