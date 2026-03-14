import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getExercisesByWorkoutId,
} from "@/lib/db/queries";
import { sanitizeInput, sanitizeDate } from "@/utils/sanitize";

export async function GET(
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
      { error: "Invalid workout id" },
      { status: 400 }
    );
  }

  const workout = await getWorkoutById(idNum);
  if (!workout || workout.userId !== userId) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    );
  }

  const exercises = await getExercisesByWorkoutId(idNum);
  return NextResponse.json({ ...workout, exercises });
}

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
      { error: "Invalid workout id" },
      { status: 400 }
    );
  }

  const workout = await getWorkoutById(idNum);
  if (!workout || workout.userId !== userId) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { date, type } = body ?? {};
  const updates: { date?: string; type?: string } = {};
  if (date !== undefined) {
    const d = sanitizeDate(date);
    if (d) updates.date = d;
  }
  if (type !== undefined) updates.type = sanitizeInput(type, 100);
  if (Object.keys(updates).length === 0) {
    const exercises = await getExercisesByWorkoutId(idNum);
    return NextResponse.json({ ...workout, exercises });
  }
  const updated = await updateWorkout(idNum, updates);
  revalidateTag(`dashboard-${userId}`, "max");
  revalidateTag(`home-${userId}`, "max");
  const exercises = await getExercisesByWorkoutId(idNum);
  return NextResponse.json({ ...updated, exercises });
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
      { error: "Invalid workout id" },
      { status: 400 }
    );
  }

  const workout = await getWorkoutById(idNum);
  if (!workout || workout.userId !== userId) {
    return NextResponse.json(
      { error: "Workout not found" },
      { status: 404 }
    );
  }

  await deleteWorkout(idNum);
  revalidateTag(`dashboard-${userId}`, "max");
  revalidateTag(`home-${userId}`, "max");
  revalidatePath("/dashboard");
  return new NextResponse(null, { status: 204 });
}
