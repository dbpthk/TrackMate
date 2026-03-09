import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import {
  getWorkoutsWithExercisesByUserId,
  createWorkout,
  createExercise,
  getWorkoutByUserIdDateType,
  getExercisesByWorkoutId,
  deduplicateWorkoutsForUser,
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

  if (req.method === "GET") {
    await deduplicateWorkoutsForUser(userId);
    const workouts = await getWorkoutsWithExercisesByUserId(userId);
    return res.status(200).json(workouts);
  }

  if (req.method === "POST") {
    const { date, type, exercises: exercisesInput } = req.body ?? {};
    if (!date || !type) {
      return res.status(400).json({ error: "Date and type required" });
    }
    const typeStr = sanitizeInput(type, 100);
    try {
      let workout = await getWorkoutByUserIdDateType(userId, date, typeStr);
      if (!workout) {
        workout = await createWorkout({ userId, date, type: typeStr });
      }
      const exercises = Array.isArray(exercisesInput) ? exercisesInput : [];
      for (const ex of exercises) {
        const name = sanitizeInput(ex?.name, 255);
        if (!name) continue;
        await createExercise({
          workoutId: workout.id,
          name,
          sets: sanitizeInt(ex?.sets),
          reps: sanitizeInt(ex?.reps),
          weight: sanitizeInt(ex?.weight),
        });
      }
      const createdExercises = await getExercisesByWorkoutId(workout.id);
      return res.status(201).json({ ...workout, exercises: createdExercises });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Create failed";
      return res.status(400).json({ error: msg });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
