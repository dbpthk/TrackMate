import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getPendingRequestsForUser,
  getAcceptedRequestsSentByUser,
  getNotificationViewedRecipientIds,
} from "@/lib/db/queries";

/** Dedupe accepted by recipientId */
function dedupeByRecipient(
  requests: Array<{ recipientId: number }>
): number[] {
  return [...new Set(requests.map((r) => r.recipientId))];
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const [pendingRequests, acceptedSent, viewedIds] = await Promise.all([
    getPendingRequestsForUser(userId),
    getAcceptedRequestsSentByUser(userId, 50),
    getNotificationViewedRecipientIds(userId),
  ]);

  const viewedSet = new Set(viewedIds);
  const acceptedRecipientIds = dedupeByRecipient(acceptedSent);
  const unviewedNotifications = acceptedRecipientIds.filter(
    (id) => !viewedSet.has(id)
  ).length;

  return NextResponse.json({
    pendingRequests: pendingRequests.length,
    unviewedNotifications,
    total: pendingRequests.length + unviewedNotifications,
  });
}
