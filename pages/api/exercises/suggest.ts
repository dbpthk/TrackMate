import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getExerciseHistoryByUser } from "@/lib/db/queries";
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

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const name = sanitizeInput(String(req.query.name ?? ""), 255);
  if (!name) {
    return res.status(200).json({ sets: null, weight: null });
  }

  const history = await getExerciseHistoryByUser(userId, name);
  const last = history[0];
  if (!last) {
    return res.status(200).json({ sets: null, weight: null });
  }

  return res.status(200).json({
    sets: last.sets ?? null,
    weight: last.weight ?? null,
    reps: last.reps ?? null,
  });
}
