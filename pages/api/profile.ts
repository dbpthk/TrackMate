import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { updateUser } from "@/lib/db/queries";
import type { UpdateUserInput } from "@/lib/db/queries";
import { sanitizeInput } from "@/utils/sanitize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "PATCH" && req.method !== "PUT") {
    res.setHeader("Allow", "PATCH, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = Number(token.id);
    const { name, goal, stats } = req.body ?? {};

    let statsObj: Record<string, unknown> | null | undefined = undefined;
    if (stats !== undefined) {
      if (typeof stats === "string" && stats.trim() === "") {
        statsObj = null;
      } else if (typeof stats === "string") {
        try {
          statsObj = JSON.parse(stats) as Record<string, unknown>;
        } catch {
          return res.status(400).json({ error: "Invalid JSON in stats" });
        }
      } else if (typeof stats === "object" && stats !== null) {
        statsObj = stats as Record<string, unknown>;
      }
    }

    const updates: UpdateUserInput = {};
    if (name !== undefined) updates.name = sanitizeInput(name, 255);
    if (goal !== undefined) updates.goal = sanitizeInput(goal, 1000) || null;
    if (statsObj !== undefined) updates.stats = statsObj;

    const user = await updateUser(userId, updates);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      goal: user.goal ?? "",
      stats:
        typeof user.stats === "object" && user.stats !== null
          ? user.stats
          : {},
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return res.status(400).json({ error: msg });
  }
}
