import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getExerciseMasterByMuscleGroup } from "@/lib/db/queries";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let muscleGroup = typeof req.query.muscleGroup === "string"
    ? req.query.muscleGroup
    : undefined;

  const exercises = await getExerciseMasterByMuscleGroup(muscleGroup);
  return res.status(200).json(exercises);
}
