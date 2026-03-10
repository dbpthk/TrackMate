import { NextRequest, NextResponse } from "next/server";
import { verifyEmailCode } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const code = String(body?.code ?? "").trim().replace(/\s/g, "");
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code required" }, { status: 400 });
    }
    const result = await verifyEmailCode(email, code);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, user: result.user });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
