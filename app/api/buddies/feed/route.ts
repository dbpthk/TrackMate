import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/** Workouts are private. Only shared personal records (from Stats page) are visible to buddies. */
export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json([]);
}
