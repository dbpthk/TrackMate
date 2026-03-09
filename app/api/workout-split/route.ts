import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getWorkoutSplitByUserId,
  createOrUpdateWorkoutSplit,
} from "@/lib/db/queries";
import { getUserById } from "@/lib/db/queries";
import {
  getDayNamesFromProfileSplit,
  getSplitTypeFromProfile,
} from "@/lib/workout-split-map";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const user = await getUserById(userId);
  const profileSplit = user?.trainingSplit ?? null;
  const splitType = getSplitTypeFromProfile(profileSplit);
  const dayNames = getDayNamesFromProfileSplit(profileSplit);
  await createOrUpdateWorkoutSplit(userId, splitType, dayNames);
  const split = await getWorkoutSplitByUserId(userId);
  if (!split) {
    return NextResponse.json({ error: "Split not found" }, { status: 404 });
  }
  return NextResponse.json(split);
}
