import { NextRequest, NextResponse } from "next/server";
import { resendVerificationEmail } from "@/lib/auth";
import { sanitizeEmail } from "@/utils/sanitize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizeEmail(body?.email) || String(body?.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    const result = await resendVerificationEmail(email);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to resend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
