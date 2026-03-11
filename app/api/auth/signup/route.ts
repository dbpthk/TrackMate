import { NextRequest, NextResponse } from "next/server";
import { signup } from "@/lib/auth";
import { getSignUpLimiter, getIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limiter = getSignUpLimiter();
  if (limiter) {
    const { success } = await limiter.limit(getIdentifier(req));
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many signup attempts. Try again later." },
        { status: 429 }
      );
    }
  }
  try {
    const body = await req.json();
    const { name, email, password } = body ?? {};
    const user = await signup({ name, email, password });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
