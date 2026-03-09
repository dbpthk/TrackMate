/**
 * All queries use Drizzle's parameterized API (eq, and, insert, etc.).
 * No raw SQL string interpolation - safe from injection.
 */
import { eq, and, desc, asc, inArray, gte, lte, max } from "drizzle-orm";
import { db } from "../db";
import {
  users,
  workouts,
  exercises,
  buddies,
  exerciseMaster,
  workoutSplits,
  workoutDays,
  workoutDayExercises,
  RECOMMENDED_SPLIT_MUSCLE_GROUPS,
  type User,
  type Workout,
  type Exercise,
  type Buddy,
  type ExerciseMaster,
  type WorkoutSplit,
  type WorkoutDay,
  type WorkoutDayExercise,
} from "@/drizzle/schema";

// --- Sanitization helpers ---
const trim = (s: string, max = 255) => String(s ?? "").trim().slice(0, max);
const toInt = (n: unknown): number | undefined =>
  n === null || n === undefined ? undefined : Math.max(0, Math.floor(Number(n)));
const toDate = (d: string | Date): string =>
  d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
const isValidEmail = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(e));

// --- Users CRUD ---
export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  goal?: string;
  stats?: Record<string, unknown>;
};

export async function createUser(input: CreateUserInput): Promise<User> {
  const name = trim(input.name);
  const email = trim(input.email).toLowerCase();
  if (!name || !email) throw new Error("Name and email required");
  if (!input.password) throw new Error("Password required");
  if (!isValidEmail(email)) throw new Error("Invalid email");
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: input.password,
      goal: input.goal ? trim(input.goal, 1000) : null,
      stats: input.stats ?? null,
    })
    .returning();
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, trim(email).toLowerCase()))
    .limit(1);
  return user;
}

export type UpdateUserInput = {
  name?: string;
  email?: string;
  goal?: string | null;
  experienceLevel?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  bodyFat?: number | null;
  trainingSplit?: string | null;
  preferredDays?: string | null;
  units?: string | null;
  stats?: Record<string, unknown> | null;
};

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<User | undefined> {
  const updates: Partial<typeof users.$inferInsert> = {};
  if (input.name !== undefined) updates.name = trim(input.name);
  if (input.email !== undefined) {
    const email = trim(input.email).toLowerCase();
    if (!isValidEmail(email)) throw new Error("Invalid email");
    updates.email = email;
  }
  if (input.age !== undefined)
    updates.age = input.age === null ? null : toInt(input.age) ?? null;
  if (input.height !== undefined)
    updates.height = input.height === null ? null : toInt(input.height) ?? null;
  if (input.weight !== undefined)
    updates.weight = input.weight === null ? null : toInt(input.weight) ?? null;
  if (input.bodyFat !== undefined)
    updates.bodyFat =
      input.bodyFat === null ? null : toInt(input.bodyFat) ?? null;
  if (input.trainingSplit !== undefined)
    updates.trainingSplit =
      input.trainingSplit === null
        ? null
        : trim(input.trainingSplit, 100) || null;
  if (input.preferredDays !== undefined)
    updates.preferredDays =
      input.preferredDays === null
        ? null
        : trim(input.preferredDays, 255) || null;
  if (input.units !== undefined)
    updates.units =
      input.units === null ? null : trim(input.units, 20) || null;
  if (input.experienceLevel !== undefined)
    updates.experienceLevel =
      input.experienceLevel === null
        ? null
        : trim(input.experienceLevel, 50) || null;
  if (input.goal !== undefined)
    updates.goal = input.goal === null ? null : trim(input.goal, 1000) || null;
  if (input.stats !== undefined) updates.stats = input.stats;
  if (Object.keys(updates).length === 0) return getUserById(id);
  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(id: number): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

// --- Workouts CRUD ---
export type CreateWorkoutInput = {
  userId: number;
  date: string | Date;
  type: string;
};

export async function createWorkout(
  input: CreateWorkoutInput
): Promise<Workout> {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId: input.userId,
      date: toDate(input.date),
      type: trim(input.type, 100),
    })
    .returning();
  if (!workout) throw new Error("Failed to create workout");
  return workout;
}

export async function getWorkoutById(id: number): Promise<Workout | undefined> {
  const [w] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, id))
    .limit(1);
  return w;
}

export async function getWorkoutsByUserId(
  userId: number
): Promise<Workout[]> {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

export async function getWorkoutsByUserIdInRange(
  userId: number,
  startDate: string,
  endDate: string
): Promise<Workout[]> {
  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.date, startDate),
        lte(workouts.date, endDate)
      )
    )
    .orderBy(desc(workouts.date));
}

export async function getWorkoutsWithExercisesByUserId(
  userId: number
): Promise<(Workout & { exercises: Exercise[] })[]> {
  const userWorkouts = await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.date));
  const result: (Workout & { exercises: Exercise[] })[] = [];
  for (const w of userWorkouts) {
    const exs = await getExercisesByWorkoutId(w.id);
    result.push({ ...w, exercises: exs });
  }
  return result;
}

export type UpdateWorkoutInput = Partial<Omit<CreateWorkoutInput, "userId">>;

export async function updateWorkout(
  id: number,
  input: UpdateWorkoutInput
): Promise<Workout | undefined> {
  const updates: Partial<typeof workouts.$inferInsert> = {};
  if (input.date !== undefined) updates.date = toDate(input.date);
  if (input.type !== undefined) updates.type = trim(input.type, 100);
  if (Object.keys(updates).length === 0) return getWorkoutById(id);
  const [w] = await db
    .update(workouts)
    .set(updates)
    .where(eq(workouts.id, id))
    .returning();
  return w;
}

export async function deleteWorkout(id: number): Promise<void> {
  await db.delete(workouts).where(eq(workouts.id, id));
}

// --- Exercises CRUD ---
export type CreateExerciseInput = {
  workoutId: number;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
};

export async function createExercise(
  input: CreateExerciseInput
): Promise<Exercise> {
  const [ex] = await db
    .insert(exercises)
    .values({
      workoutId: input.workoutId,
      name: trim(input.name),
      sets: toInt(input.sets),
      reps: toInt(input.reps),
      weight: toInt(input.weight),
      duration: toInt(input.duration),
    })
    .returning();
  if (!ex) throw new Error("Failed to create exercise");
  return ex;
}

export async function getExerciseById(
  id: number
): Promise<Exercise | undefined> {
  const [ex] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, id))
    .limit(1);
  return ex;
}

export async function getExercisesByWorkoutId(
  workoutId: number
): Promise<Exercise[]> {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.workoutId, workoutId));
}

export type UpdateExerciseInput = Partial<
  Omit<CreateExerciseInput, "workoutId">
>;

export async function updateExercise(
  id: number,
  input: UpdateExerciseInput
): Promise<Exercise | undefined> {
  const updates: Partial<typeof exercises.$inferInsert> = {};
  if (input.name !== undefined) updates.name = trim(input.name);
  if (input.sets !== undefined) updates.sets = toInt(input.sets);
  if (input.reps !== undefined) updates.reps = toInt(input.reps);
  if (input.weight !== undefined) updates.weight = toInt(input.weight);
  if (input.duration !== undefined) updates.duration = toInt(input.duration);
  if (Object.keys(updates).length === 0) return getExerciseById(id);
  const [ex] = await db
    .update(exercises)
    .set(updates)
    .where(eq(exercises.id, id))
    .returning();
  return ex;
}

export async function deleteExercise(id: number): Promise<void> {
  await db.delete(exercises).where(eq(exercises.id, id));
}

export async function getExerciseHistoryByUser(
  userId: number,
  exerciseName: string
): Promise<Exercise[]> {
  const name = trim(exerciseName);
  if (!name) return [];
  const rows = await db
    .select({
      id: exercises.id,
      workoutId: exercises.workoutId,
      name: exercises.name,
      sets: exercises.sets,
      reps: exercises.reps,
      weight: exercises.weight,
      duration: exercises.duration,
    })
    .from(exercises)
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .where(and(eq(workouts.userId, userId), eq(exercises.name, name)))
    .orderBy(desc(exercises.id));
  return rows as Exercise[];
}

// --- Buddies CRUD ---
export type CreateBuddyInput = { userId: number; buddyId: number };

export async function addBuddy(input: CreateBuddyInput): Promise<Buddy> {
  const [b] = await db
    .insert(buddies)
    .values({ userId: input.userId, buddyId: input.buddyId })
    .returning();
  if (!b) throw new Error("Failed to add buddy");
  return b;
}

export async function getBuddiesByUserId(userId: number): Promise<Buddy[]> {
  return db.select().from(buddies).where(eq(buddies.userId, userId));
}

export async function removeBuddy(
  userId: number,
  buddyId: number
): Promise<void> {
  await db
    .delete(buddies)
    .where(and(eq(buddies.userId, userId), eq(buddies.buddyId, buddyId)));
}

export async function getBuddiesWithUsers(
  userId: number
): Promise<{ buddyId: number; name: string; email: string }[]> {
  const rows = await db
    .select({
      buddyId: buddies.buddyId,
      name: users.name,
      email: users.email,
    })
    .from(buddies)
    .innerJoin(users, eq(buddies.buddyId, users.id))
    .where(eq(buddies.userId, userId));
  return rows;
}

export async function getBuddyWorkouts(
  userId: number,
  limit = 50
): Promise<
  (Workout & {
    exercises: Exercise[];
    buddyName: string;
  })[]
> {
  const myBuddies = await getBuddiesByUserId(userId);
  const buddyIds = myBuddies.map((b) => b.buddyId);
  if (buddyIds.length === 0) return [];

  const userWorkouts = await db
    .select()
    .from(workouts)
    .where(inArray(workouts.userId, buddyIds))
    .orderBy(desc(workouts.date))
    .limit(limit);

  const result: (Workout & { exercises: Exercise[]; buddyName: string })[] = [];
  for (const w of userWorkouts) {
    const buddy = await getUserById(w.userId);
    const exs = await getExercisesByWorkoutId(w.id);
    result.push({
      ...w,
      exercises: exs,
      buddyName: buddy?.name ?? "Unknown",
    });
  }
  return result;
}

export async function getBuddyStreak(buddyId: number): Promise<number> {
  const workoutDates = await db
    .select({ date: workouts.date })
    .from(workouts)
    .where(eq(workouts.userId, buddyId))
    .orderBy(desc(workouts.date));
  const dates = new Set(workoutDates.map((r) => r.date));
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let d = new Date(today + "T12:00:00");
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// --- Analytics ---
const volume = (s: number | null, r: number | null, w: number | null) =>
  (s ?? 0) * (r ?? 0) * (w ?? 0);

export async function getVolumeByDate(
  userId: number
): Promise<{ date: string; volume: number }[]> {
  const data = await getWorkoutsWithExercisesByUserId(userId);
  const byDate: Record<string, number> = {};
  for (const w of data) {
    const v = (w.exercises ?? []).reduce(
      (sum, ex) => sum + volume(ex.sets, ex.reps, ex.weight),
      0
    );
    byDate[w.date] = (byDate[w.date] ?? 0) + v;
  }
  return Object.entries(byDate)
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getVolumeByWeek(
  userId: number
): Promise<{ week: string; volume: number }[]> {
  const data = await getWorkoutsWithExercisesByUserId(userId);
  const byWeek: Record<string, number> = {};
  for (const w of data) {
    const d = new Date(w.date + "T12:00:00");
    const mon = new Date(d);
    mon.setDate(d.getDate() - d.getDay() + 1);
    const weekKey = mon.toISOString().slice(0, 10);
    const v = (w.exercises ?? []).reduce(
      (sum, ex) => sum + volume(ex.sets, ex.reps, ex.weight),
      0
    );
    byWeek[weekKey] = (byWeek[weekKey] ?? 0) + v;
  }
  return Object.entries(byWeek)
    .map(([week, volume]) => ({ week, volume }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export async function getWorkoutTypeDistribution(
  userId: number
): Promise<{ type: string; count: number }[]> {
  const data = await db
    .select({ type: workouts.type })
    .from(workouts)
    .where(eq(workouts.userId, userId));
  const byType: Record<string, number> = {};
  for (const row of data) {
    byType[row.type] = (byType[row.type] ?? 0) + 1;
  }
  return Object.entries(byType).map(([type, count]) => ({ type, count }));
}

// --- Exercise Master (template exercises) ---
export async function getExerciseMasterByMuscleGroup(
  muscleGroup?: string
): Promise<ExerciseMaster[]> {
  if (muscleGroup) {
    return db
      .select()
      .from(exerciseMaster)
      .where(eq(exerciseMaster.muscleGroup, muscleGroup))
      .orderBy(exerciseMaster.name);
  }
  return db
    .select()
    .from(exerciseMaster)
    .orderBy(asc(exerciseMaster.muscleGroup), asc(exerciseMaster.name));
}

export async function getExerciseMasterById(
  id: string
): Promise<ExerciseMaster | undefined> {
  const [ex] = await db
    .select()
    .from(exerciseMaster)
    .where(eq(exerciseMaster.id, id))
    .limit(1);
  return ex;
}

// --- Workout Splits ---
export async function getWorkoutSplitByUserId(
  userId: number
): Promise<(WorkoutSplit & { workoutDays: (WorkoutDay & { workoutDayExercises: (WorkoutDayExercise & { exercise: ExerciseMaster })[] })[] }) | undefined> {
  const [split] = await db
    .select()
    .from(workoutSplits)
    .where(eq(workoutSplits.userId, userId))
    .limit(1);
  if (!split) return undefined;

  const days = await db
    .select()
    .from(workoutDays)
    .where(eq(workoutDays.splitId, split.id))
    .orderBy(asc(workoutDays.dayOrder), asc(workoutDays.dayName));

  const result: WorkoutSplit & {
    workoutDays: (WorkoutDay & {
      workoutDayExercises: (WorkoutDayExercise & { exercise: ExerciseMaster })[];
    })[];
  } = {
    ...split,
    workoutDays: [],
  };

  for (const day of days) {
    const dayExs = await db
      .select()
      .from(workoutDayExercises)
      .where(eq(workoutDayExercises.workoutDayId, day.id))
      .orderBy(asc(workoutDayExercises.order));
    const withExercise: (WorkoutDayExercise & { exercise: ExerciseMaster })[] = [];
    for (const de of dayExs) {
      const ex = await getExerciseMasterById(de.exerciseId);
      if (ex) withExercise.push({ ...de, exercise: ex });
    }
    result.workoutDays.push({ ...day, workoutDayExercises: withExercise });
  }
  return result;
}

export async function createOrUpdateWorkoutSplit(
  userId: number,
  splitType: string,
  dayNames: string[]
): Promise<WorkoutSplit> {
  const existing = await db
    .select()
    .from(workoutSplits)
    .where(eq(workoutSplits.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    const split = existing[0];
    await db.update(workoutSplits).set({ splitType }).where(eq(workoutSplits.id, split.id));
    const currentDays = await db
      .select()
      .from(workoutDays)
      .where(eq(workoutDays.splitId, split.id));
    for (let i = 0; i < dayNames.length; i++) {
      const name = dayNames[i];
      const match = currentDays.find((d) => d.dayOrder === i);
      const recommended = RECOMMENDED_SPLIT_MUSCLE_GROUPS[i] ?? [];
      if (match) {
        await db
          .update(workoutDays)
          .set({
            dayName: name,
            dayOrder: i,
            muscleGroups: Array.isArray(match.muscleGroups) && match.muscleGroups.length > 0
              ? match.muscleGroups
              : recommended,
          })
          .where(eq(workoutDays.id, match.id));
      } else {
        await db.insert(workoutDays).values({
          splitId: split.id,
          dayName: name,
          dayOrder: i,
          muscleGroups: recommended,
        });
      }
    }
    const toDelete = currentDays.filter((d) => d.dayOrder >= dayNames.length);
    for (const d of toDelete) {
      await db.delete(workoutDayExercises).where(eq(workoutDayExercises.workoutDayId, d.id));
      await db.delete(workoutDays).where(eq(workoutDays.id, d.id));
    }
    return { ...split, splitType };
  }

  const [split] = await db
    .insert(workoutSplits)
    .values({ userId, splitType })
    .returning();
  if (!split) throw new Error("Failed to create workout split");

  for (let i = 0; i < dayNames.length; i++) {
    const recommended = RECOMMENDED_SPLIT_MUSCLE_GROUPS[i] ?? [];
    await db.insert(workoutDays).values({
      splitId: split.id,
      dayName: dayNames[i],
      dayOrder: i,
      muscleGroups: recommended,
    });
  }
  return split;
}

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  triceps: "Triceps",
  back: "Back",
  biceps: "Biceps",
  shoulders: "Shoulders",
  legs: "Legs",
  abs: "Abs",
  core: "Core",
  functional: "Functional Training",
};

function formatMuscleGroupsAsTitle(muscleGroups: string[]): string {
  if (muscleGroups.length === 0) return "Rest Day";
  return muscleGroups
    .map((mg) => MUSCLE_GROUP_LABELS[mg] ?? mg)
    .join(" + ");
}

export async function updateWorkoutDayMuscleGroups(
  workoutDayId: string,
  userId: number,
  muscleGroups: string[]
): Promise<WorkoutDay | undefined> {
  const [day] = await db
    .select()
    .from(workoutDays)
    .where(eq(workoutDays.id, workoutDayId))
    .limit(1);
  if (!day) return undefined;
  const [split] = await db
    .select()
    .from(workoutSplits)
    .where(eq(workoutSplits.id, day.splitId))
    .limit(1);
  if (!split || split.userId !== userId) return undefined;
  const dayName = formatMuscleGroupsAsTitle(muscleGroups);
  const [updated] = await db
    .update(workoutDays)
    .set({ muscleGroups, dayName })
    .where(eq(workoutDays.id, workoutDayId))
    .returning();
  return updated;
}

export async function addExerciseToWorkoutDay(
  workoutDayId: string,
  exerciseId: string,
  userId: number,
  sets?: number,
  reps?: string
): Promise<WorkoutDayExercise> {
  const day = await db.select().from(workoutDays).where(eq(workoutDays.id, workoutDayId)).limit(1);
  if (!day[0]) throw new Error("Workout day not found");
  const split = await db
    .select()
    .from(workoutSplits)
    .where(eq(workoutSplits.id, day[0].splitId))
    .limit(1);
  if (!split[0] || split[0].userId !== userId) throw new Error("Unauthorized");

  const ex = await getExerciseMasterById(exerciseId);
  if (!ex) throw new Error("Exercise not found");

  const [maxRow] = await db
    .select({ maxOrder: max(workoutDayExercises.order) })
    .from(workoutDayExercises)
    .where(eq(workoutDayExercises.workoutDayId, workoutDayId));
  const nextOrder = maxRow?.maxOrder != null ? maxRow.maxOrder + 1 : 0;

  const [inserted] = await db
    .insert(workoutDayExercises)
    .values({
      workoutDayId,
      exerciseId,
      sets: sets ?? null,
      reps: reps ?? null,
      order: nextOrder,
    })
    .returning();
  if (!inserted) throw new Error("Failed to add exercise");
  return inserted;
}

export async function removeExerciseFromWorkoutDay(
  id: string,
  userId: number
): Promise<void> {
  const [we] = await db
    .select()
    .from(workoutDayExercises)
    .where(eq(workoutDayExercises.id, id))
    .limit(1);
  if (!we) throw new Error("Not found");
  const day = await db.select().from(workoutDays).where(eq(workoutDays.id, we.workoutDayId)).limit(1);
  if (!day[0]) throw new Error("Not found");
  const split = await db
    .select()
    .from(workoutSplits)
    .where(eq(workoutSplits.id, day[0].splitId))
    .limit(1);
  if (!split[0] || split[0].userId !== userId) throw new Error("Unauthorized");
  await db.delete(workoutDayExercises).where(eq(workoutDayExercises.id, id));
}
