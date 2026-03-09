import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import {
  createExercise,
  getWorkoutById,
} from "@/lib/db/queries";
import { sanitizeInput, sanitizeInt } from "@/utils/sanitize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(token.id);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { workoutId, name, sets, reps, weight, duration } = req.body ?? {};
  if (!workoutId || !name) {
    return res.status(400).json({ error: "workoutId and name required" });
  }

  const wid = Number(workoutId);
  const workout = await getWorkoutById(wid);
  if (!workout || workout.userId !== userId) {
    return res.status(404).json({ error: "Workout not found" });
  }

  try {
    const exercise = await createExercise({
      workoutId: wid,
      name: sanitizeInput(name, 255),
      sets: sanitizeInt(sets),
      reps: sanitizeInt(reps),
      weight: sanitizeInt(weight),
      duration: sanitizeInt(duration),
    });
    return res.status(201).json(exercise);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return res.status(400).json({ error: msg });
  }
}
