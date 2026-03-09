import { getUserByEmail } from "./db/queries";
import { users } from "@/drizzle/schema";
import { db } from "./db";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export async function signup(input: SignupInput) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const name = String(input.name ?? "").trim().slice(0, 255);
  const password = String(input.password ?? "").trim();

  if (!name || !email) throw new Error("Name and email required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");

  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashed,
      goal: null,
      stats: null,
    })
    .returning();

  if (!user) throw new Error("Failed to create user");
  return { id: user.id, name: user.name, email: user.email };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ id: number; name: string; email: string } | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.password) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email };
}
