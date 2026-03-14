import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  getWorkoutsWithExercisesByUserId,
  createOrUpdateWorkoutWithExercises,
  deleteWorkoutsForDate,
} from "@/lib/db/queries";
import {
  sanitizeInput,
  sanitizeInt,
  sanitizeDecimal,
  sanitizeDate,
  isReasonableDate,
} from "@/utils/sanitize";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

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
  const { date, type, exercises: exercisesInput, replaceForDate } = body ?? {};
  if (!date || !type) {
    return NextResponse.json(
      { error: "Date and type required" },
      { status: 400 }
    );
  }
  const dateStr = sanitizeDate(date);
  if (!dateStr) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 }
    );
  }
  if (!isReasonableDate(dateStr)) {
    return NextResponse.json(
      { error: "Date must be between 2010 and 2030" },
      { status: 400 }
    );
  }
  const typeStr = sanitizeInput(type, 100);
  const exercises = Array.isArray(exercisesInput)
    ? exercisesInput.map((ex: { name?: unknown; sets?: unknown; reps?: unknown; weight?: unknown }) => ({
        name: sanitizeInput(ex?.name, 255),
        sets: sanitizeInt(ex?.sets),
        reps: sanitizeInt(ex?.reps),
        weight: sanitizeDecimal(ex?.weight),
      }))
    : [];
  try {
    if (replaceForDate === true) {
      await deleteWorkoutsForDate(userId, dateStr);
    }
    const result = await createOrUpdateWorkoutWithExercises({
      userId,
      date: dateStr,
      type: typeStr,
      exercises,
    });
    revalidateTag(`dashboard-${userId}`, "max");
    revalidateTag(`home-${userId}`, "max");
    revalidatePath("/dashboard");
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
