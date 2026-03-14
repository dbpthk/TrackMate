import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getToken } from "next-auth/jwt";
import {
  getNotificationViewedRecipientIds,
  markNotificationViewed,
} from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const recipientIds = await getNotificationViewedRecipientIds(userId);
  return NextResponse.json({ recipientIds });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const body = await req.json();
  const recipientId = Number(body?.recipientId);
  if (!Number.isInteger(recipientId) || recipientId < 1) {
    return NextResponse.json(
      { error: "Invalid recipientId" },
      { status: 400 }
    );
  }

  await markNotificationViewed(userId, recipientId);
  revalidateTag(`buddies-${userId}`, "max");
  return NextResponse.json({ ok: true });
}
