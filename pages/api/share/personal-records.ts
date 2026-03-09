import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import {
  sharePersonalRecordsWithBuddies,
  getSharedPersonalRecordsReceived,
  type SharedPRRecord,
} from "@/lib/db/queries";

function sanitizeRecords(
  raw: unknown
): SharedPRRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && typeof r === "object")
    .map((r) => {
      const o = r as Record<string, unknown>;
      const exerciseName =
        typeof o.exerciseName === "string" ? o.exerciseName.slice(0, 255) : "";
      const weight =
        typeof o.weight === "number" && !Number.isNaN(o.weight)
          ? o.weight
          : 0;
      const reps =
        o.reps == null
          ? null
          : typeof o.reps === "number" && !Number.isNaN(o.reps)
            ? o.reps
            : null;
      const date =
        typeof o.date === "string" ? o.date.slice(0, 10) : "";
      return { exerciseName, weight, reps, date };
    })
    .filter((r) => r.exerciseName);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = await getToken({ req });
    if (!token?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = Number(token.id);

    if (req.method === "POST") {
      const { buddyIds, records } = req.body ?? {};
      if (!Array.isArray(buddyIds) || buddyIds.length === 0) {
        return res.status(400).json({ error: "buddyIds array required" });
      }
      const validBuddyIds = buddyIds
        .map((id: unknown) => (typeof id === "number" ? id : Number(id)))
        .filter((id: number) => Number.isInteger(id));
      const sanitized = sanitizeRecords(records);
      if (sanitized.length === 0) {
        return res.status(400).json({ error: "No valid records to share" });
      }
      await sharePersonalRecordsWithBuddies(userId, validBuddyIds, sanitized);
      return res.status(201).json({ success: true });
    }

    if (req.method === "GET") {
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const received = await getSharedPersonalRecordsReceived(userId, limit);
      return res.status(200).json(received);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[share/personal-records]", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to share",
    });
  }
}
