import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { sanitizeInput, sanitizeEmail } from "@/utils/sanitize";
import {
  getBuddiesWithUsers,
  addBuddy,
  getUserByEmail,
  getBuddiesByUserId,
} from "@/lib/db/queries";

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
    const buddies = await getBuddiesWithUsers(userId);
    return res.status(200).json(buddies);
  }

  if (req.method === "POST") {
    const { buddyId, email } = req.body ?? {};
    let targetId = buddyId != null ? Number(buddyId) : null;
    if (!targetId && email) {
      const em = sanitizeEmail(email) || sanitizeInput(String(email), 255).toLowerCase();
      const user = await getUserByEmail(em);
      targetId = user?.id ?? null;
    }
    if (!targetId || targetId === userId) {
      return res.status(400).json({ error: "Invalid buddy" });
    }
    const existing = await getBuddiesByUserId(userId);
    if (existing.some((b) => b.buddyId === targetId)) {
      return res.status(400).json({ error: "Already following" });
    }
    try {
      const b = await addBuddy({ userId, buddyId: targetId });
      return res.status(201).json(b);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add buddy";
      return res.status(400).json({ error: msg });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
