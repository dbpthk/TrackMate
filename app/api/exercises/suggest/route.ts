import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getExerciseHistoryByUser } from "@/lib/db/queries";
import { sanitizeInput } from "@/utils/sanitize";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const { searchParams } = new URL(req.url);
  const name = sanitizeInput(String(searchParams.get("name") ?? ""), 255);
  if (!name) {
    return NextResponse.json({ sets: null, weight: null });
  }

  const history = await getExerciseHistoryByUser(userId, name);
  const last = history[0];
  if (!last) {
    return NextResponse.json({ sets: null, weight: null });
  }

  return NextResponse.json({
    sets: last.sets ?? null,
    weight: last.weight ?? null,
    reps: last.reps ?? null,
  });
}
