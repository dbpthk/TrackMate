import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  acceptBuddyRequest,
  rejectBuddyRequest,
  cancelBuddyRequest,
} from "@/lib/db/queries";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);
  const { id } = await params;
  const idNum = typeof id === "string" ? Number(id) : NaN;
  if (!Number.isInteger(idNum)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  const body = await req.json();
  const { action } = body ?? {};
  if (action === "accept") {
    const ok = await acceptBuddyRequest(idNum, userId);
    if (!ok) {
      return NextResponse.json(
        { error: "Request not found or already handled" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Request accepted",
    });
  }
  if (action === "reject") {
    const ok = await rejectBuddyRequest(idNum, userId);
    if (!ok) {
      return NextResponse.json(
        { error: "Request not found or already handled" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Request rejected",
    });
  }
  if (action === "cancel") {
    const ok = await cancelBuddyRequest(idNum, userId);
    if (!ok) {
      return NextResponse.json(
        { error: "Request not found or already handled" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Request cancelled",
    });
  }

  return NextResponse.json(
    { error: "action must be 'accept', 'reject', or 'cancel'" },
    { status: 400 }
  );
}
