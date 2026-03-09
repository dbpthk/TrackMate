import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getWorkoutsWithExercisesByUserId,
  createWorkout,
  createExercise,
  getWorkoutByUserIdDateType,
  getExercisesByWorkoutId,
  deduplicateWorkoutsForUser,
} from "@/lib/db/queries";
import { sanitizeInput, sanitizeInt } from "@/utils/sanitize";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  await deduplicateWorkoutsForUser(userId);
  const workouts = await getWorkoutsWithExercisesByUserId(userId);
  return NextResponse.json(workouts);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const body = await req.json();
  const { date, type, exercises: exercisesInput } = body ?? {};
  if (!date || !type) {
    return NextResponse.json(
      { error: "Date and type required" },
      { status: 400 }
    );
  }
  const typeStr = sanitizeInput(type, 100);
  try {
    let workout = await getWorkoutByUserIdDateType(userId, date, typeStr);
    if (!workout) {
      workout = await createWorkout({ userId, date, type: typeStr });
    }
    const exercises = Array.isArray(exercisesInput) ? exercisesInput : [];
    for (const ex of exercises) {
      const name = sanitizeInput(ex?.name, 255);
      if (!name) continue;
      await createExercise({
        workoutId: workout.id,
        name,
        sets: sanitizeInt(ex?.sets),
        reps: sanitizeInt(ex?.reps),
        weight: sanitizeInt(ex?.weight),
      });
    }
    const createdExercises = await getExercisesByWorkoutId(workout.id);
    return NextResponse.json(
      { ...workout, exercises: createdExercises },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
