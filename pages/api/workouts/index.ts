import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getWorkoutsWithExercisesByUserId, createWorkout } from "@/lib/db/queries";
import { sanitizeInput } from "@/utils/sanitize";

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
    const workouts = await getWorkoutsWithExercisesByUserId(userId);
    return res.status(200).json(workouts);
  }

  if (req.method === "POST") {
    const { date, type } = req.body ?? {};
    if (!date || !type) {
      return res.status(400).json({ error: "Date and type required" });
    }
    try {
      const workout = await createWorkout({
        userId,
        date,
        type: sanitizeInput(type, 100),
      });
      return res.status(201).json(workout);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Create failed";
      return res.status(400).json({ error: msg });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
