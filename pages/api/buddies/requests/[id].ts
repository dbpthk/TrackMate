import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import {
  acceptBuddyRequest,
  rejectBuddyRequest,
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
  const id = typeof req.query.id === "string" ? Number(req.query.id) : NaN;
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid request id" });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action } = req.body ?? {};
  if (action === "accept") {
    const ok = await acceptBuddyRequest(id, userId);
    if (!ok) {
      return res.status(404).json({ error: "Request not found or already handled" });
    }
    return res.status(200).json({ success: true, message: "Request accepted" });
  }
  if (action === "reject") {
    const ok = await rejectBuddyRequest(id, userId);
    if (!ok) {
      return res.status(404).json({ error: "Request not found or already handled" });
    }
    return res.status(200).json({ success: true, message: "Request rejected" });
  }

  return res.status(400).json({ error: "action must be 'accept' or 'reject'" });
}
