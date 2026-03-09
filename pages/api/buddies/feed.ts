import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getBuddyWorkouts, getBuddyStreak } from "@/lib/db/queries";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(token.id);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const workouts = await getBuddyWorkouts(userId, limit);

  const seen = new Set<number>();
  const streakCache: Record<number, number> = {};
  for (const w of workouts) {
    if (!seen.has(w.userId)) {
      seen.add(w.userId);
      streakCache[w.userId] = await getBuddyStreak(w.userId);
    }
  }
  const withStreaks = workouts.map((w) => ({
    ...w,
    buddyStreak: streakCache[w.userId] ?? 0,
  }));

  return res.status(200).json(withStreaks);
}
