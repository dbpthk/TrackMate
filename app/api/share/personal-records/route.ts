import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getToken } from "next-auth/jwt";
import {
  sharePersonalRecordsWithBuddies,
  getSharedPersonalRecordsReceived,
  type SharedPRRecord,
} from "@/lib/db/queries";
import { logError } from "@/lib/logger";

function sanitizeRecords(raw: unknown): SharedPRRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && typeof r === "object")
    .map((r) => {
      const o = r as Record<string, unknown>;
      const exerciseName =
        typeof o.exerciseName === "string" ? o.exerciseName.slice(0, 255) : "";
      const weight =
        typeof o.weight === "number" && !Number.isNaN(o.weight) ? o.weight : 0;
      const reps =
        o.reps == null
          ? null
          : typeof o.reps === "number" && !Number.isNaN(o.reps)
            ? o.reps
            : null;
      const date = typeof o.date === "string" ? o.date.slice(0, 10) : "";
      return { exerciseName, weight, reps, date };
    })
    .filter((r) => r.exerciseName);
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(token.id);

    const body = await req.json();
    const { buddyIds, records } = body ?? {};
    if (!Array.isArray(buddyIds) || buddyIds.length === 0) {
      return NextResponse.json(
        { error: "buddyIds array required" },
        { status: 400 }
      );
    }
    const validBuddyIds = buddyIds
      .map((id: unknown) => (typeof id === "number" ? id : Number(id)))
      .filter((id: number) => Number.isInteger(id));
    const sanitized = sanitizeRecords(records);
    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: "No valid records to share" },
        { status: 400 }
      );
    }
    await sharePersonalRecordsWithBuddies(userId, validBuddyIds, sanitized);
    revalidateTag(`buddies-${userId}`, "max");
    for (const buddyId of validBuddyIds) {
      revalidateTag(`buddies-${buddyId}`, "max");
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    logError("share/personal-records POST", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to share",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(token.id);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const received = await getSharedPersonalRecordsReceived(userId, limit);
    return NextResponse.json(received);
  } catch (err) {
    logError("share/personal-records GET", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to share",
      },
      { status: 500 }
    );
  }
}
