import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { followBack } from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const body = await req.json();
  const targetId = body?.userId != null ? Number(body.userId) : NaN;
  if (!Number.isInteger(targetId) || targetId === userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const ok = await followBack(userId, targetId);
  if (!ok) {
    return NextResponse.json(
      { error: "User does not follow you or you already follow them" },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true, message: "Followed back" });
}
