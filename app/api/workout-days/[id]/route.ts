import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getToken } from "next-auth/jwt";
import { updateWorkoutDayMuscleGroups } from "@/lib/db/queries";
import { isValidUuid } from "@/utils/sanitize";

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
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
  }

  const body = await req.json();
  const { muscleGroups } = body ?? {};
  if (!Array.isArray(muscleGroups)) {
    return NextResponse.json(
      { error: "muscleGroups array required" },
      { status: 400 }
    );
  }
  const valid = muscleGroups.filter((g) => typeof g === "string");
  const updated = await updateWorkoutDayMuscleGroups(id, userId, valid);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  revalidateTag(`home-${userId}`, "max");
  return NextResponse.json(updated);
}
