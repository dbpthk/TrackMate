import { redirect } from "next/navigation";

/** Redirect /sign-in to /auth/signin, preserving query params (e.g. ?demo=user) */
export default async function SignInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) query.set(k, Array.isArray(v) ? v[0] : v);
  }
  const qs = query.toString();
  redirect(qs ? `/auth/signin?${qs}` : "/auth/signin");
}
