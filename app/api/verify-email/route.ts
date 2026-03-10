import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/signin?error=Invalid%20token", req.url)
    );
  }
  const result = await verifyEmailToken(token);
  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(result.error)}`, req.url)
    );
  }
  return NextResponse.redirect(
    new URL("/auth/signin?verified=true", req.url)
  );
}
