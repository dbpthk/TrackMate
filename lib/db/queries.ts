import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import {
  users,
  workouts,
  exercises,
  buddies,
  type User,
  type Workout,
  type Exercise,
  type Buddy,
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
