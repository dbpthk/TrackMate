import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getExerciseMasterByMuscleGroup } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const muscleGroup =
    typeof searchParams.get("muscleGroup") === "string"
      ? searchParams.get("muscleGroup") ?? undefined
      : undefined;

  const exercises = await getExerciseMasterByMuscleGroup(muscleGroup);
  return NextResponse.json(exercises);
}
