import { getUserByEmail } from "./db/queries";
import { users } from "@/drizzle/schema";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "./email";
import { isValidEmail } from "@/utils/sanitize";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 1;

function generateVerificationCode(): string {
  const digits = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) =>
    (b % 10).toString()
  );
  return digits.join("");
}

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
  if (!isValidEmail(email)) throw new Error("Invalid email");

  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationCode = generateVerificationCode();
  const verificationTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashed,
      verificationToken: verificationCode,
      verificationTokenExpiry,
      goal: null,
      stats: null,
    })
    .returning();

  if (!user) throw new Error("Failed to create user");

  await sendVerificationEmail(email, verificationCode);

  return { id: user.id, name: user.name, email: user.email };
}

export type VerifyCredentialsResult =
  | { success: true; user: { id: number; name: string; email: string } }
  | { success: false; reason: "invalid" | "unverified" };

export async function verifyCredentials(
  email: string,
  password: string
): Promise<VerifyCredentialsResult> {
  const user = await getUserByEmail(email);
  if (!user || !user.password) return { success: false, reason: "invalid" };
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return { success: false, reason: "invalid" };
  if (!user.emailVerified) return { success: false, reason: "unverified" };
  return { success: true, user: { id: user.id, name: user.name, email: user.email } };
}

export async function verifyEmailToken(
  token: string
): Promise<{ success: true; userId: number } | { success: false; error: string }> {
  if (!token || token.length < 6) return { success: false, error: "Invalid token" };
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);
  if (!user) return { success: false, error: "Invalid token" };
  const [row] = await db
    .select({ expiry: users.verificationTokenExpiry })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row?.expiry || new Date() > row.expiry) return { success: false, error: "Token expired" };
  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    })
    .where(eq(users.id, user.id));
  return { success: true, userId: user.id };
}

export async function verifyEmailCode(
  email: string,
  code: string
): Promise<
  | { success: true; user: { id: number; name: string; email: string } }
  | { success: false; error: string }
> {
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanCode = String(code ?? "").trim().replace(/\s/g, "");
  if (!cleanEmail || !cleanCode || cleanCode.length !== 6) {
    return { success: false, error: "Invalid code" };
  }
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);
  if (!user) return { success: false, error: "Invalid code" };
  const [row] = await db
    .select({ token: users.verificationToken, expiry: users.verificationTokenExpiry })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row?.token || row.token !== cleanCode) return { success: false, error: "Invalid code" };
  if (!row?.expiry || new Date() > row.expiry) return { success: false, error: "Code expired" };
  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    })
    .where(eq(users.id, user.id));
  return { success: true, user: { id: user.id, name: user.name, email: user.email } };
}

export async function resendVerificationEmail(
  email: string
): Promise<{ success: true } | { success: false; error: string }> {
  const user = await getUserByEmail(email);
  if (!user) return { success: false, error: "User not found" };
  if (user.emailVerified) return { success: false, error: "Email already verified" };
  const verificationCode = generateVerificationCode();
  const verificationTokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  await db
    .update(users)
    .set({ verificationToken: verificationCode, verificationTokenExpiry })
    .where(eq(users.id, user.id));
  await sendVerificationEmail(email, verificationCode);
  return { success: true };
}
