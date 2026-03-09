import { NextResponse } from "next/server";
import { signup } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body ?? {};
    const user = await signup({ name, email, password });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
