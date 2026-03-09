import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getExerciseById,
  updateExercise,
  deleteExercise,
  getWorkoutById,
} from "@/lib/db/queries";
import { sanitizeInput, sanitizeInt } from "@/utils/sanitize";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);
  const { id } = await params;
  const idNum = Number(id);
  if (isNaN(idNum)) {
    return NextResponse.json(
      { error: "Invalid exercise id" },
      { status: 400 }
    );
  }

  const exercise = await getExerciseById(idNum);
  if (!exercise) {
    return NextResponse.json(
      { error: "Exercise not found" },
      { status: 404 }
    );
  }

  const workout = await getWorkoutById(exercise.workoutId);
  if (!workout || workout.userId !== userId) {
    return NextResponse.json(
      { error: "Exercise not found" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { name, sets, reps, weight, duration } = body ?? {};
  const updates: Parameters<typeof updateExercise>[1] = {};
  if (name !== undefined) updates.name = sanitizeInput(name, 255);
  if (sets !== undefined) updates.sets = sanitizeInt(sets);
  if (reps !== undefined) updates.reps = sanitizeInt(reps);
  if (weight !== undefined) updates.weight = sanitizeInt(weight);
  if (duration !== undefined) updates.duration = sanitizeInt(duration);
  const updated = await updateExercise(idNum, updates);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);
  const { id } = await params;
  const idNum = Number(id);
  if (isNaN(idNum)) {
    return NextResponse.json(
      { error: "Invalid exercise id" },
      { status: 400 }
    );
  }

  const exercise = await getExerciseById(idNum);
  if (!exercise) {
    return NextResponse.json(
      { error: "Exercise not found" },
      { status: 404 }
    );
  }

  const workout = await getWorkoutById(exercise.workoutId);
  if (!workout || workout.userId !== userId) {
    return NextResponse.json(
      { error: "Exercise not found" },
      { status: 404 }
    );
  }

  await deleteExercise(idNum);
  return new NextResponse(null, { status: 204 });
}
