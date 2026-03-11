/** Workout filtering and date utilities. Extracted from UI for reuse and testability. */

export function normalizeType(t: string): string {
  return t.trim().replace(/^Day \d+ —\s*/i, "");
}

export function workoutsForDay<T extends { type: string }>(
  workouts: T[],
  dayName: string
): T[] {
  const norm = normalizeType(dayName);
  return workouts.filter(
    (w) => normalizeType(w.type) === norm || w.type === dayName
  );
}

export function getTodayWorkoutForDay<T extends { type: string; date: string }>(
  workouts: T[],
  dayName: string,
  date: string
): T | undefined {
  const forDay = workoutsForDay(workouts, dayName);
  return forDay.find((w) => w.date === date);
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
