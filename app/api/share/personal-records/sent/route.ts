import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSharedPersonalRecordsSent } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(token.id);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const sent = await getSharedPersonalRecordsSent(userId, limit);
    return NextResponse.json(sent);
  } catch (err) {
    console.error("[share/personal-records/sent]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch",
      },
      { status: 500 }
    );
  }
}
