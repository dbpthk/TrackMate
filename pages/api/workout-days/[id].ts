import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { updateWorkoutDayMuscleGroups } from "@/lib/db/queries";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(token.id);
  const id = typeof req.query.id === "string" ? req.query.id : undefined;
  if (!id) {
    return res.status(400).json({ error: "id required" });
  }

  if (req.method === "PATCH") {
    const { muscleGroups } = req.body ?? {};
    if (!Array.isArray(muscleGroups)) {
      return res.status(400).json({ error: "muscleGroups array required" });
    }
    const valid = muscleGroups.filter((g) => typeof g === "string");
    const updated = await updateWorkoutDayMuscleGroups(id, userId, valid);
    if (!updated) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", "PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
