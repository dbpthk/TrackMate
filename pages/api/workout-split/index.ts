import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import {
  getWorkoutSplitByUserId,
  createOrUpdateWorkoutSplit,
} from "@/lib/db/queries";
import { getUserById } from "@/lib/db/queries";
import { getDayNamesFromProfileSplit, getSplitTypeFromProfile } from "@/lib/workout-split-map";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(token.id);

  if (req.method === "GET") {
    let split = await getWorkoutSplitByUserId(userId);
    if (!split) {
      const user = await getUserById(userId);
      const profileSplit = user?.trainingSplit ?? null;
      const splitType = getSplitTypeFromProfile(profileSplit);
      const dayNames = getDayNamesFromProfileSplit(profileSplit);
      await createOrUpdateWorkoutSplit(userId, splitType, dayNames);
      split = await getWorkoutSplitByUserId(userId);
    }
    if (!split) {
      return res.status(404).json({ error: "Split not found" });
    }
    return res.status(200).json(split);
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ error: "Method not allowed" });
}
