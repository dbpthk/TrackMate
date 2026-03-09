import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import {
  getExerciseById,
  updateExercise,
  deleteExercise,
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
  const id = Number(req.query.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid exercise id" });
  }

  const exercise = await getExerciseById(id);
  if (!exercise) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  const workout = await getWorkoutById(exercise.workoutId);
  if (!workout || workout.userId !== userId) {
    return res.status(404).json({ error: "Exercise not found" });
  }

  if (req.method === "PATCH") {
    const { name, sets, reps, weight, duration } = req.body ?? {};
    const updates: Parameters<typeof updateExercise>[1] = {};
    if (name !== undefined) updates.name = sanitizeInput(name, 255);
    if (sets !== undefined) updates.sets = sanitizeInt(sets);
    if (reps !== undefined) updates.reps = sanitizeInt(reps);
    if (weight !== undefined) updates.weight = sanitizeInt(weight);
    if (duration !== undefined) updates.duration = sanitizeInt(duration);
    const updated = await updateExercise(id, updates);
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await deleteExercise(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
