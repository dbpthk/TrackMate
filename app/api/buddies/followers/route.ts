import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getUsersWhoFollowYou } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const followers = await getUsersWhoFollowYou(userId);
  return NextResponse.json(followers);
}
