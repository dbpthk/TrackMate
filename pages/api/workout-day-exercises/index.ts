import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { addExerciseToWorkoutDay, removeExerciseFromWorkoutDay } from "@/lib/db/queries";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(token.id);

  if (req.method === "POST") {
    const { workoutDayId, exerciseId, sets, reps } = req.body ?? {};
    if (!workoutDayId || !exerciseId) {
      return res.status(400).json({ error: "workoutDayId and exerciseId required" });
    }
    try {
      const result = await addExerciseToWorkoutDay(
        workoutDayId,
        exerciseId,
        userId,
        typeof sets === "number" ? sets : undefined,
        typeof reps === "string" ? reps : undefined
      );
      return res.status(201).json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add exercise";
      return res.status(400).json({ error: msg });
    }
  }

  if (req.method === "DELETE") {
    const id = typeof req.query.id === "string" ? req.query.id : undefined;
    if (!id) {
      return res.status(400).json({ error: "id required" });
    }
    try {
      await removeExerciseFromWorkoutDay(id, userId);
      return res.status(200).json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove";
      return res.status(400).json({ error: msg });
    }
  }

  res.setHeader("Allow", "POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
