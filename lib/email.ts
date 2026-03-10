import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const resend = new Resend(apiKey);
  const verifyUrl = `${APP_URL}/api/verify-email?token=${code}`;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your TrackMate account",
    html: `
      <p>Thanks for signing up for TrackMate!</p>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:2px;margin:1rem 0;">${code}</p>
      <p>Enter this code on the sign up page to verify your email.</p>
      <p>Or <a href="${verifyUrl}" style="color:#1d4ed8;font-weight:600;">click here</a> to verify.</p>
      <p>This code expires in 1 hour.</p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
  if (error) throw new Error(error.message);
}
