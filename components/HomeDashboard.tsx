"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";
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
  hasWorkoutSplitSetup,
  isTodayRestDay,
  MOTIVATIONAL_QUOTES,
} from "@/lib/home-utils";

type WorkoutSplitData = {
  workoutDays: Array<{
    id: string;
    dayName: string;
    workoutDayExercises: Array<{ exercise: { name: string } }>;
  }>;
};

type HomeDashboardProps = {
  user: {
    name: string;
    trainingSplit: string | null;
    preferredDays: string | null;
  };
  weekWorkouts: WorkoutWithExercises[];
  todayWorkout: WorkoutWithExercises | null;
  completedDates: string[];
  initialWorkoutSplit?: WorkoutSplitData | null;
};

export function HomeDashboard({
  user,
  weekWorkouts,
  todayWorkout: initialTodayWorkout,
  completedDates: initialCompletedDates,
  initialWorkoutSplit,
}: HomeDashboardProps) {
  const [workouts, setWorkouts] = useState(weekWorkouts);
  const [todayWorkout, setTodayWorkout] = useState(initialTodayWorkout);
  const [completedDates, setCompletedDates] = useState(
    () => new Set(initialCompletedDates)
  );
  const [quoteIndex, setQuoteIndex] = useState(0);
  const initialNames =
    initialWorkoutSplit?.workoutDays?.map((d) => d.dayName) ?? [];
  const [splitDayNames, setSplitDayNames] = useState<string[]>(initialNames);
  const [workoutSplit, setWorkoutSplit] = useState<WorkoutSplitData | null>(
    initialWorkoutSplit ?? null
  );
  const [selectedWeekDate, setSelectedWeekDate] = useState<string | null>(null);
  const [selectedSplitType, setSelectedSplitType] = useState<string>("");
  const [completing, setCompleting] = useState(false);
  const [clientToday, setClientToday] = useState<{
    date: string;
    weekday: string;
  } | null>(null);

  useEffect(() => {
    setClientToday({
      date: getTodayDate(),
      weekday: getTodayWeekday(),
    });
  }, []);

  useEffect(() => {
    if (clientToday && initialWorkoutSplit?.workoutDays?.length) {
      const defaultVal = getDefaultDayType(clientToday.weekday);
      if (defaultVal) {
        setSelectedDayType((prev) =>
          initialWorkoutSplit!.workoutDays.some((d) => d.dayName === defaultVal)
            ? defaultVal
            : prev
        );
      }
    }
  }, [clientToday?.weekday, initialWorkoutSplit]);

  const suggestedFocus = clientToday
    ? getTodaysFocus(
        user.trainingSplit || null,
        user.preferredDays || null
      )
    : null;
  const dayOptions = getDayOptionsForSplit(user.trainingSplit || null);
  const getDefaultDayType = (todayWk: string | null) => {
    const initSplit = initialWorkoutSplit;
    if (initSplit?.workoutDays?.length && todayWk) {
      const preferredDaysList =
        user.preferredDays?.split(/[,\s]+/).filter(Boolean) ?? [];
      const idx = preferredDaysList.findIndex(
        (d) => d.toLowerCase() === todayWk.toLowerCase()
      );
      const focus = todayWk
        ? getTodaysFocus(
            user.trainingSplit || null,
            user.preferredDays || null
          )
        : null;
      const defaultForToday =
        idx >= 0 && initSplit.workoutDays[idx]
          ? initSplit.workoutDays[idx].dayName
          : focus && initSplit.workoutDays.some((d) => d.dayName === focus)
            ? focus
            : initSplit.workoutDays[0]?.dayName;
      return defaultForToday ?? focus ?? dayOptions[0]?.value ?? "";
    }
    return dayOptions[0]?.value ?? "";
  };
  const [selectedDayType, setSelectedDayType] = useState<string>(
    dayOptions[0]?.value ?? ""
  );

  const todayDate = clientToday?.date ?? "";
  const hasSetup = hasWorkoutSplitSetup(
    user.trainingSplit || null,
    user.preferredDays || null
  );
  const isRestDay =
    clientToday &&
    isTodayRestDay(
      user.trainingSplit || null,
      user.preferredDays || null
    );
  const defaultSplitForToday =
    splitDayNames.length > 0 && workoutSplit && clientToday
      ? (() => {
          const preferredDaysList =
            user.preferredDays?.split(/[,\s]+/).filter(Boolean) ?? [];
          const idx = preferredDaysList.findIndex(
            (d) => d.toLowerCase() === clientToday.weekday.toLowerCase()
          );
          return idx >= 0
            ? workoutSplit.workoutDays[idx]?.dayName ?? null
            : null;
        })()
      : suggestedFocus;

  const todaysFocus =
    selectedWeekDate === todayDate && selectedSplitType
      ? selectedSplitType
      : todayWorkout
        ? todayWorkout.type
        : defaultSplitForToday || selectedDayType || dayOptions[0]?.value;
  const upcoming = clientToday
    ? getUpcomingWorkouts(
        user.trainingSplit || null,
        user.preferredDays || null,
        5
      )
    : [];
  const weekDates = clientToday ? getWeekDates() : [];
  const weekCompleted = weekDates.filter((d) => {
    if (!completedDates.has(d.date)) return false;
    const workoutForDate = workouts.find((w) => w.date === d.date);
    return workoutForDate?.type !== "Rest Day";
  }).length;
  const totalWeekDays = hasSetup
    ? (user.preferredDays?.split(/[,\s]+/).filter(Boolean).length ?? 0)
    : 0;

  const fetchWorkouts = useCallback(async () => {
    const { start, end } = getWeekStartEnd();
    const todayStr = getTodayDate();
    const [workoutsRes, completionsRes] = await Promise.all([
      fetch("/api/workouts"),
      fetch(`/api/home-completions?start=${start}&end=${end}`),
    ]);
    if (workoutsRes.ok) {
      const data: WorkoutWithExercises[] = await workoutsRes.json();
      const week = data.filter((w) => w.date >= start && w.date <= end);
      const today = data.find((w) => w.date === todayStr) ?? null;
      setWorkouts(week);
      setTodayWorkout(today ?? null);
    }
    if (completionsRes.ok) {
      const { dates } = await completionsRes.json();
      setCompletedDates(new Set(dates ?? []));
    }
  }, []);

  useEffect(() => {
    if (clientToday) {
      fetchWorkouts();
    }
  }, [clientToday?.date, fetchWorkouts]);

  // Sync from server only on initial mount (hydration). Avoid overwriting client
  // state after fetchWorkouts has updated it. Hydration-safe: runs once.
  const hasInitialSync = useRef(false);
  useEffect(() => {
    if (hasInitialSync.current) return;
    hasInitialSync.current = true;
    setCompletedDates(new Set(initialCompletedDates));
  }, [initialCompletedDates]);

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
        setWorkoutSplit(data);
        setSelectedDayType((prev) => {
          if (names.length === 0) return prev;
          const todayWk = clientToday?.weekday;
          const preferredIdx =
            todayWk &&
            user.preferredDays
              ? user.preferredDays
                  .split(/[,\s]+/)
                  .filter(Boolean)
                  .findIndex((d) => d.toLowerCase() === todayWk.toLowerCase())
              : -1;
          const defaultForToday =
            preferredIdx >= 0 && data.workoutDays?.[preferredIdx]
              ? data.workoutDays[preferredIdx].dayName
              : suggestedFocus && names.includes(suggestedFocus)
                ? suggestedFocus
                : names[0];
          if (defaultForToday && names.includes(defaultForToday))
            return defaultForToday;
          if (prev && names.includes(prev)) return prev;
          return names[0];
        });
        if (names.length > 0) {
          setSelectedSplitType((prev) => (prev && names.includes(prev) ? prev : names[0]));
        }
      }
    };
    fetchSplit();
  }, [user.trainingSplit, suggestedFocus, clientToday?.weekday]);

  useEffect(() => {
    if (
      selectedWeekDate === todayDate &&
      selectedSplitType &&
      splitDayNames.includes(selectedSplitType)
    ) {
      setSelectedDayType(selectedSplitType);
    }
  }, [selectedWeekDate, todayDate, selectedSplitType, splitDayNames]);

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
            {clientToday && (todaysFocus || isRestDay) && (
              <p className="mt-1 text-lg text-muted-foreground">
                Today&apos;s focus: {isRestDay ? "Rest" : todaysFocus}
              </p>
            )}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weekly progress</span>
                <span className="font-medium text-foreground">
                  {clientToday ? `${weekCompleted}/${totalWeekDays}` : "—/—"} sessions
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${clientToday && totalWeekDays ? (weekCompleted / totalWeekDays) * 100 : 0}%`,
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
                {!clientToday ? (
                  <p className="text-muted-foreground">Loading…</p>
                ) : isRestDay ? (
                  <p className="text-muted-foreground">
                    Rest day — enjoy your recovery. No workout scheduled for today.
                  </p>
                ) : todaysFocus ? (
                  <>
                    {availableDayOptions.length > 1 &&
                      !todayWorkout &&
                      !completedDates.has(todayDate) && (
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
                            onChange={(e) =>
                              setSelectedDayType(e.target.value)
                            }
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
                    {(availableDayOptions.length <= 1 ||
                      todayWorkout ||
                      completedDates.has(todayDate)) && (
                      <p className="text-foreground">
                        {todayWorkout
                          ? todayWorkout.type
                          : todaysFocus || selectedDayType}
                      </p>
                    )}
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={completedDates.has(todayDate)}
                        onChange={() => {
                          const isCompleted = completedDates.has(todayDate);
                          if (isCompleted) {
                            setCompletedDates((prev) => {
                              const next = new Set(prev);
                              next.delete(todayDate);
                              return next;
                            });
                            const hadEmptyWorkout =
                              todayWorkout &&
                              (!todayWorkout.exercises ||
                                todayWorkout.exercises.length === 0);
                            void fetch(
                              `/api/home-completions?date=${todayDate}`,
                              { method: "DELETE" }
                            ).then(async (res) => {
                              if (!res.ok) {
                                setCompletedDates((prev) =>
                                  new Set([...prev, todayDate])
                                );
                                void fetchWorkouts();
                                return;
                              }
                              if (hadEmptyWorkout) {
                                const wRes = await fetch("/api/workouts");
                                if (wRes.ok) {
                                  const data: WorkoutWithExercises[] =
                                    await wRes.json();
                                  const empty = data.find(
                                    (w) =>
                                      w.date === todayDate &&
                                      (!w.exercises || w.exercises.length === 0)
                                  );
                                  if (empty?.id) {
                                    await fetch(
                                      `/api/workouts/${empty.id}`,
                                      { method: "DELETE" }
                                    );
                                  }
                                }
                                void fetchWorkouts();
                              }
                            });
                          } else {
                            setCompletedDates((prev) =>
                              new Set([...prev, todayDate])
                            );
                            const workoutType = todayWorkout
                              ? todayWorkout.type
                              : todaysFocus || selectedDayType;
                            if (!todayWorkout && workoutType) {
                              const optimistic: WorkoutWithExercises = {
                                id: -1,
                                userId: 0,
                                date: todayDate,
                                type: workoutType,
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
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  date: todayDate,
                                  type: workoutType,
                                  exercises: [],
                                }),
                              }).then((res) => {
                                if (!res.ok) {
                                  setTodayWorkout(null);
                                  setWorkouts((prev) =>
                                    prev.filter((w) => w.date !== todayDate)
                                  );
                                  setCompletedDates((prev) => {
                                    const next = new Set(prev);
                                    next.delete(todayDate);
                                    return next;
                                  });
                                  return;
                                }
                                void fetch("/api/home-completions", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ date: todayDate }),
                                }).then((cRes) => {
                                  if (!cRes.ok) void fetchWorkouts();
                                });
                                void fetchWorkouts();
                              });
                            } else {
                              void fetch("/api/home-completions", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ date: todayDate }),
                              }).then((res) => {
                                if (!res.ok) {
                                  setCompletedDates((prev) => {
                                    const next = new Set(prev);
                                    next.delete(todayDate);
                                    return next;
                                  });
                                  void fetchWorkouts();
                                }
                              });
                            }
                          }
                        }}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                        aria-label={
                          completedDates.has(todayDate)
                            ? "Undo — mark as not completed"
                            : "Mark today's session as completed"
                        }
                      />
                      <span
                        className={
                          completedDates.has(todayDate)
                            ? "text-sm font-medium text-green-600 dark:text-green-400"
                            : "text-sm text-foreground"
                        }
                      >
                        {completedDates.has(todayDate)
                          ? "✓ Completed — uncheck to undo for today"
                          : "Mark as completed"}
                      </span>
                    </label>
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
            <p className="mb-2 text-sm text-muted-foreground">
              Tap a day to log a workout
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {weekDates.map(({ date, weekday }) => {
                const done = completedDates.has(date);
                const workoutForDate = workouts.find((w) => w.date === date);
                const isRestDay = workoutForDate?.type === "Rest Day";
                const isToday = date === todayDate;
                const isSelected = selectedWeekDate === date;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedWeekDate((prev) =>
                        prev === date ? null : date
                      );
                      if (splitDayNames.length > 0 && selectedWeekDate !== date) {
                        const preferredDaysList =
                          user.preferredDays?.split(/[,\s]+/).filter(Boolean) ??
                          [];
                        const preferredIdx = preferredDaysList.findIndex(
                          (d) =>
                            d.toLowerCase() === weekday.toLowerCase()
                        );
                        if (
                          preferredIdx >= 0 &&
                          workoutSplit?.workoutDays[preferredIdx]
                        ) {
                          setSelectedSplitType(
                            workoutSplit.workoutDays[preferredIdx].dayName
                          );
                        } else {
                          setSelectedSplitType("Rest Day");
                        }
                      }
                    }}
                    className={`flex min-w-[2.75rem] flex-col items-center rounded-lg border p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : done
                          ? "border-primary bg-primary/10 text-primary"
                          : isToday
                            ? "border-primary/50 bg-surface-muted"
                            : "border-border bg-surface hover:border-primary/50"
                    }`}
                    aria-label={`${weekday}${done ? (isRestDay ? " rest day" : " completed") : ""}${isSelected ? ", selected" : ""}`}
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {weekday.slice(0, 2)}
                    </span>
                    <span className="mt-1 text-lg">
                      {done ? (isRestDay ? "✕" : "✓") : "—"}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedWeekDate && hasSetup && workoutSplit && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle as="h3" className="text-base">
                    Log workout for{" "}
                    {weekDates.find((d) => d.date === selectedWeekDate)
                      ?.weekday ?? ""}{" "}
                    (
                    {new Date(selectedWeekDate + "T12:00:00").toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" }
                    )}
                    )
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="week-day-split-select"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Workout type
                    </label>
                    <select
                      id="week-day-split-select"
                      value={selectedSplitType}
                      onChange={(e) => setSelectedSplitType(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Rest Day">Rest Day</option>
                      {workoutSplit.workoutDays.map((d) => (
                        <option key={d.id} value={d.dayName}>
                          {d.dayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!selectedWeekDate || !selectedSplitType) return;
                      setCompleting(true);
                      try {
                        const day = workoutSplit.workoutDays.find(
                          (d) => d.dayName === selectedSplitType
                        );
                        const exercises =
                          day?.workoutDayExercises?.map((we) => ({
                            name: we.exercise?.name ?? "Exercise",
                            sets: undefined,
                            reps: undefined,
                            weight: undefined,
                          })) ?? [];
                        const res = await fetch("/api/workouts", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            date: selectedWeekDate,
                            type: selectedSplitType,
                            exercises,
                          }),
                        });
                        if (res.ok) {
                          await fetch("/api/home-completions", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              date: selectedWeekDate,
                            }),
                          });
                          void fetchWorkouts();
                          setSelectedWeekDate(null);
                        }
                      } finally {
                        setCompleting(false);
                      }
                    }}
                    disabled={completing}
                    className="w-full"
                  >
                    {completing ? "Saving…" : "Mark as completed"}
                  </Button>
                </CardContent>
              </Card>
            )}
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
