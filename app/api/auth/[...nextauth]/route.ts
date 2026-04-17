import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getSignInLimiter, getIdentifier } from "@/lib/rate-limit";

const nextAuthHandler = NextAuth(authOptions);

async function withSignInRateLimit(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
): Promise<Response> {
  const params = await context.params;
  const segments = params?.nextauth ?? [];
  const isCredentialsCallback =
    segments[0] === "callback" && segments[1] === "credentials";
  const isSignInAction = segments[0] === "signin";

  if (req.method === "POST" && (isCredentialsCallback || isSignInAction)) {
    const demoSecret = process.env.DEMO_LOGIN_SECRET ?? "";
    const headerValue = req.headers.get("x-demo-login") ?? "";
    const isDemoLogin =
      demoSecret.length > 0 &&
      headerValue.length > 0 &&
      headerValue === demoSecret;
    const limiter = getSignInLimiter();
    if (limiter && !isDemoLogin) {
      const { success } = await limiter.limit(getIdentifier(req));
      if (!success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Too many sign-in attempts. Try again later.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }
  return nextAuthHandler(req as unknown as Request, context as unknown as { params: Promise<Record<string, string>> });
}

export const GET = nextAuthHandler;
export const POST = withSignInRateLimit;
