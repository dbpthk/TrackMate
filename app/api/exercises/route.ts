import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createExercise, getWorkoutById } from "@/lib/db/queries";
import { sanitizeInput, sanitizeInt } from "@/utils/sanitize";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const body = await req.json();
  const { workoutId, name, sets, reps, weight, duration } = body ?? {};
  if (!workoutId || !name) {
    return NextResponse.json(
      { error: "workoutId and name required" },
      { status: 400 }
    );
  }

  const wid = Number(workoutId);
  const workout = await getWorkoutById(wid);
  if (!workout || workout.userId !== userId) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    );
  }

  try {
    const exercise = await createExercise({
      workoutId: wid,
      name: sanitizeInput(name, 255),
      sets: sanitizeInt(sets),
      reps: sanitizeInt(reps),
      weight: sanitizeInt(weight),
      duration: sanitizeInt(duration),
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
