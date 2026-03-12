import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { sanitizeInput, sanitizeEmail } from "@/utils/sanitize";
import {
  getBuddiesWithUsers,
  createBuddyRequest,
  getUserByEmail,
  getBuddiesByUserId,
} from "@/lib/db/queries";
import { logError } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const buddies = await getBuddiesWithUsers(userId);
  return NextResponse.json(buddies);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const body = await req.json();
  const { buddyId, email } = body ?? {};
  let targetId = buddyId != null ? Number(buddyId) : null;
  if (!targetId && email) {
    const em =
      sanitizeEmail(email) || sanitizeInput(String(email), 255).toLowerCase();
    const user = await getUserByEmail(em);
    targetId = user?.id ?? null;
  }
  if (!targetId || targetId === userId) {
    return NextResponse.json({ error: "Invalid buddy" }, { status: 400 });
  }
  const existing = await getBuddiesByUserId(userId);
  if (existing.some((b) => b.buddyId === targetId)) {
    return NextResponse.json({ error: "Already following" }, { status: 400 });
  }
  try {
    const buddyReq = await createBuddyRequest(userId, targetId);
    if (!buddyReq) {
      return NextResponse.json(
        { error: "Request already sent" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { id: buddyReq.id, message: "Follow request sent" },
      { status: 201 }
    );
  } catch (err) {
    logError("buddies POST", err);
    const msg = err instanceof Error ? err.message : "Failed to send request";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
