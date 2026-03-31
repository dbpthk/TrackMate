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

/**
 * Keeps workout-day exercises in sync with selected muscle groups for display.
 * If muscleGroups is null/undefined (legacy), all exercises are shown.
 * If empty (rest day), none are shown.
 */
export function filterWorkoutDayExercisesByMuscleGroups<
  T extends { exercise: { muscleGroup: string } },
>(exercises: T[], muscleGroups: string[] | null | undefined): T[] {
  if (muscleGroups == null) return exercises;
  if (muscleGroups.length === 0) return [];
  return exercises.filter((we) => muscleGroups.includes(we.exercise.muscleGroup));
}

/**
 * When muscle groups are set on the day, only show logged sets for exercises that
 * appear on the plan for those groups (same visibility as the exercise list).
 * When muscleGroups is null (legacy), pass logs through unchanged.
 */
export function filterWeightLogsByPlannedExerciseNames<
  T extends {
    exercises: Array<{
      id: number;
      name: string;
      sets: number | null;
      reps: number | null;
      weight: number | null;
    }>;
  },
>(
  weightLogs: T[],
  visibleWorkoutExercises: Array<{ exercise: { name: string } }>
): T[] {
  if (visibleWorkoutExercises.length === 0) return [];
  const names = new Set(
    visibleWorkoutExercises.map((we) => we.exercise.name.trim().toLowerCase())
  );
  return weightLogs
    .map((log) => ({
      ...log,
      exercises: log.exercises.filter((e) => {
        if (e.weight == null || e.weight <= 0) return false;
        return names.has(e.name.trim().toLowerCase());
      }),
    }))
    .filter((log) => log.exercises.length > 0);
}
