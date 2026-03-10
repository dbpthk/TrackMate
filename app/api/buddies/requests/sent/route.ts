import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPendingRequestsSentByUser } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const requests = await getPendingRequestsSentByUser(userId);
  return NextResponse.json(requests);
}
