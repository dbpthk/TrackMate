import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  addExerciseToWorkoutDay,
  removeExerciseFromWorkoutDay,
} from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const body = await req.json();
  const { workoutDayId, exerciseId, sets, reps } = body ?? {};
  if (!workoutDayId || !exerciseId) {
    return NextResponse.json(
      { error: "workoutDayId and exerciseId required" },
      { status: 400 }
    );
  }
  try {
    const result = await addExerciseToWorkoutDay(
      workoutDayId,
      exerciseId,
      userId,
      typeof sets === "number" ? sets : undefined,
      typeof reps === "string" ? reps : undefined
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add exercise";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    await removeExerciseFromWorkoutDay(id, userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to remove";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
