import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { updateUser } from "@/lib/db/queries";
import type { UpdateUserInput } from "@/lib/db/queries";
import {
  EXPERIENCE_LEVELS,
  TRAINING_SPLITS,
  UNITS,
} from "@/drizzle/schema";
import { sanitizeInput, sanitizeInt } from "@/utils/sanitize";

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
    const {
      name,
      goal,
      experienceLevel,
      age,
      height,
      weight,
      bodyFat,
      trainingSplit,
      preferredDays,
      units,
    } = req.body ?? {};

    const updates: UpdateUserInput = {};
    if (name !== undefined) updates.name = sanitizeInput(name, 255);
    if (goal !== undefined)
      updates.goal = goal === "" || goal === null ? null : sanitizeInput(goal, 500) || null;
    if (experienceLevel !== undefined) {
      const e = sanitizeInput(experienceLevel, 50).toLowerCase();
      updates.experienceLevel =
        e && EXPERIENCE_LEVELS.includes(e as (typeof EXPERIENCE_LEVELS)[number])
          ? e
          : null;
    }
    if (age !== undefined)
      updates.age =
        age === "" || age === null ? null : sanitizeInt(age) ?? null;
    if (height !== undefined)
      updates.height =
        height === "" || height === null ? null : sanitizeInt(height) ?? null;
    if (weight !== undefined)
      updates.weight =
        weight === "" || weight === null ? null : sanitizeInt(weight) ?? null;
    if (bodyFat !== undefined)
      updates.bodyFat =
        bodyFat === "" || bodyFat === null ? null : sanitizeInt(bodyFat) ?? null;
    if (trainingSplit !== undefined) {
      const t = sanitizeInput(trainingSplit, 100);
      updates.trainingSplit =
        t && TRAINING_SPLITS.includes(t as (typeof TRAINING_SPLITS)[number])
          ? t
          : null;
    }
    if (preferredDays !== undefined)
      updates.preferredDays =
        preferredDays === "" || preferredDays === null
          ? null
          : sanitizeInput(preferredDays, 255) || null;
    if (units !== undefined) {
      const u = sanitizeInput(units, 20).toLowerCase();
      updates.units =
        u && UNITS.includes(u as (typeof UNITS)[number]) ? u : "metric";
    }

    const user = await updateUser(userId, updates);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      goal: user.goal ?? "",
      experienceLevel: user.experienceLevel ?? "",
      age: user.age,
      height: user.height,
      weight: user.weight,
      bodyFat: user.bodyFat,
      trainingSplit: user.trainingSplit ?? "",
      preferredDays: user.preferredDays ?? "",
      units: user.units ?? "metric",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return res.status(400).json({ error: msg });
  }
}
