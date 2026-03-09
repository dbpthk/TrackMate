import type { NextApiRequest, NextApiResponse } from "next";
import { signup } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body ?? {};
    const user = await signup({ name, email, password });
    return res.status(201).json(user);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signup failed";
    return res.status(400).json({ error: msg });
  }
}
