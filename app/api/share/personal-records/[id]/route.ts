import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { deleteSharedPersonalRecord } from "@/lib/db/queries";
import { logError } from "@/lib/logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(token.id);

    const { id } = await params;
    const idNum = typeof id === "string" ? Number(id) : NaN;
    if (!Number.isInteger(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const ok = await deleteSharedPersonalRecord(idNum, userId);
    if (!ok) {
      return NextResponse.json(
        { error: "Share not found or you cannot delete it" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    logError("share/personal-records DELETE", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to delete",
      },
      { status: 500 }
    );
  }
}
