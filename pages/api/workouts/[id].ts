import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import {
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getExercisesByWorkoutId,
} from "@/lib/db/queries";
import { sanitizeInput, sanitizeDate } from "@/utils/sanitize";

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
    return res.status(400).json({ error: "Invalid workout id" });
  }

  const workout = await getWorkoutById(id);
  if (!workout || workout.userId !== userId) {
    return res.status(404).json({ error: "Workout not found" });
  }

  if (req.method === "GET") {
    const exercises = await getExercisesByWorkoutId(id);
    return res.status(200).json({ ...workout, exercises });
  }

  if (req.method === "PATCH") {
    const { date, type } = req.body ?? {};
    const updates: { date?: string; type?: string } = {};
    if (date !== undefined) {
      const d = sanitizeDate(date);
      if (d) updates.date = d;
    }
    if (type !== undefined) updates.type = sanitizeInput(type, 100);
    if (Object.keys(updates).length === 0) {
      const exercises = await getExercisesByWorkoutId(id);
      return res.status(200).json({ ...workout, exercises });
    }
    const updated = await updateWorkout(id, updates);
    const exercises = await getExercisesByWorkoutId(id);
    return res.status(200).json({ ...updated, exercises });
  }

  if (req.method === "DELETE") {
    await deleteWorkout(id);
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
