import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithCode } from "@/lib/auth";
import { sanitizeInput } from "@/utils/sanitize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = sanitizeInput(body?.token, 32);
    const password = String(body?.password ?? "");
    const result = await resetPasswordWithCode(token, password);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 400 }
    );
  }
}
