import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { sanitizeInput, sanitizeEmail } from "@/utils/sanitize";
import { getUserByEmail, getBuddiesByUserId } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(token.id);

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("email") ?? "";
  const email = sanitizeEmail(raw) || sanitizeInput(String(raw), 255);
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.id === userId) {
    return NextResponse.json(
      { error: "Cannot add yourself" },
      { status: 400 }
    );
  }
  const buddies = await getBuddiesByUserId(userId);
  if (buddies.some((b) => b.buddyId === user.id)) {
    return NextResponse.json(
      { error: "Already following" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}
