import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getUserByEmail, getBuddiesByUserId } from "@/lib/db/queries";

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

  const email = String(req.query.email ?? "").trim();
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.id === userId) {
    return res.status(400).json({ error: "Cannot add yourself" });
  }
  const buddies = await getBuddiesByUserId(userId);
  if (buddies.some((b) => b.buddyId === user.id)) {
    return res.status(400).json({ error: "Already following" });
  }

  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}
