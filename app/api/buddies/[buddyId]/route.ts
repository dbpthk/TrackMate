import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { removeBuddy, getBuddiesByUserId } from "@/lib/db/queries";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ buddyId: string }> }
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);
  const { buddyId } = await params;
  const buddyIdNum = Number(buddyId);
  if (isNaN(buddyIdNum)) {
    return NextResponse.json({ error: "Invalid buddy id" }, { status: 400 });
  }

  const myBuddies = await getBuddiesByUserId(userId);
  if (!myBuddies.some((b) => b.buddyId === buddyIdNum)) {
    return NextResponse.json(
      { error: "Not following this user" },
      { status: 404 }
    );
  }

  await removeBuddy(userId, buddyIdNum);
  return new NextResponse(null, { status: 204 });
}
