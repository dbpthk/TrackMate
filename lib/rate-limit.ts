/**
 * Rate limiting for auth routes using Upstash Redis.
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set,
 * rate limiting is skipped (all requests allowed) to avoid breaking deployments.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logError } from "@/lib/logger";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Sign-in: 5 attempts per 15 minutes per identifier (IP) */
export function getSignInLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "trackmate:signin",
  });
}

/** Sign-up: 3 attempts per hour per identifier (IP) */
export function getSignUpLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "trackmate:signup",
  });
}

/** Get client identifier (IP) from request headers */
export function getIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
}

/**
 * Fail-open wrapper for limiter checks.
 * If the limiter backend is unavailable, auth flows continue.
 */
export async function safeLimit(
  limiter: Ratelimit | null,
  identifier: string,
  context: string
): Promise<{ success: boolean }> {
  if (!limiter) return { success: true };
  try {
    const { success } = await limiter.limit(identifier);
    return { success };
  } catch (err) {
    logError(`${context}:rate-limit`, err);
    return { success: true };
  }
}
