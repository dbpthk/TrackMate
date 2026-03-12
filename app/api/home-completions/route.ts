/**
 * Home completions API. Dates are YYYY-MM-DD.
 * getWeekStartEnd() uses server timezone when start/end omitted.
 * Clients in different timezones should pass start/end from their local getWeekStartEnd().
 * See docs/TIMEZONE.md.
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getHomeCompletions,
  addHomeCompletion,
  removeHomeCompletion,
} from "@/lib/db/queries";
import { sanitizeDate, isReasonableDate } from "@/utils/sanitize";
import { getWeekStartEnd } from "@/lib/home-utils";
import { logError } from "@/lib/logger";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return jsonError("Unauthorized", 401);
    }
    const userId = Number(token.id);

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const { start: defaultStart, end: defaultEnd } = getWeekStartEnd();
    const startDate =
      start && sanitizeDate(start) ? sanitizeDate(start)! : defaultStart;
    const endDate =
      end && sanitizeDate(end) ? sanitizeDate(end)! : defaultEnd;

    const dates = await getHomeCompletions(userId, startDate, endDate);
    return NextResponse.json({ dates });
  } catch (err) {
    console.error("[home-completions GET]", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to fetch completions",
      500
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return jsonError("Unauthorized", 401);
    }
    const userId = Number(token.id);

    const body = await req.json().catch(() => ({}));
    const date = sanitizeDate(body?.date);
    if (!date) {
      return jsonError("Date required (YYYY-MM-DD)", 400);
    }
    if (!isReasonableDate(date)) {
      return jsonError("Date must be between 2010 and 2030", 400);
    }

    await addHomeCompletion(userId, date);
    return NextResponse.json({ success: true, ok: true });
  } catch (err) {
    logError("home-completions POST", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to add completion",
      500
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return jsonError("Unauthorized", 401);
    }
    const userId = Number(token.id);

    const { searchParams } = new URL(req.url);
    const date = sanitizeDate(searchParams.get("date") ?? "");
    if (!date) {
      return jsonError("Date query param required (YYYY-MM-DD)", 400);
    }
    if (!isReasonableDate(date)) {
      return jsonError("Date must be between 2010 and 2030", 400);
    }

    await removeHomeCompletion(userId, date);
    return NextResponse.json({ success: true, ok: true });
  } catch (err) {
    logError("home-completions DELETE", err);
    return jsonError(
      err instanceof Error ? err.message : "Failed to remove completion",
      500
    );
  }
}
