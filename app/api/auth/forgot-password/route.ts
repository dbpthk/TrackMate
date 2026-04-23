import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth";
import { sanitizeEmail } from "@/utils/sanitize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizeEmail(body?.email);
    if (email) {
      await requestPasswordReset(email);
    }
    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, password reset instructions have been sent.",
    });
  } catch {
    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, password reset instructions have been sent.",
    });
  }
}
