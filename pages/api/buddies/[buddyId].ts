import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { removeBuddy, getBuddiesByUserId } from "@/lib/db/queries";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(token.id);
  const buddyId = Number(req.query.buddyId);
  if (isNaN(buddyId)) {
    return res.status(400).json({ error: "Invalid buddy id" });
  }

  const myBuddies = await getBuddiesByUserId(userId);
  if (!myBuddies.some((b) => b.buddyId === buddyId)) {
    return res.status(404).json({ error: "Not following this user" });
  }

  if (req.method === "DELETE") {
    await removeBuddy(userId, buddyId);
    return res.status(204).end();
  }

  res.setHeader("Allow", "DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
