import { NextRequest, NextResponse } from "next/server";
import { getDemoCredentials } from "@/lib/auth";

/** Parse Set-Cookie headers into Cookie header value (name=value pairs). */
function getCookieHeaderFromSetCookie(setCookies: string[]): string {
  return setCookies
    .map((sc) => {
      const [nameValue] = sc.split(";");
      return nameValue?.trim() ?? "";
    })
    .filter(Boolean)
    .join("; ");
}

/** Merge cookie strings, later values override earlier for same name. */
function mergeCookieHeaders(...headers: string[]): string {
  const map = new Map<string, string>();
  for (const h of headers) {
    if (!h.trim()) continue;
    for (const pair of h.split(";").map((s) => s.trim())) {
      const eq = pair.indexOf("=");
      if (eq > 0) map.set(pair.slice(0, eq), pair.slice(eq + 1));
    }
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

/** Server-only demo login. Credentials never sent to client. */
export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;
  const demoSecret = process.env.DEMO_LOGIN_SECRET ?? "";

  let csrfRes: Response;
  let signInRes: Response;

  try {
    csrfRes = await fetch(`${base}/api/auth/csrf`, {
      headers: { Cookie: req.headers.get("cookie") ?? "" },
    });
  } catch (err) {
    return NextResponse.redirect(
      new URL("/auth/signin?error=DemoLoginFailed", base)
    );
  }

  let csrfToken: string | undefined;
  try {
    const json = (await csrfRes.json()) as { csrfToken?: string };
    csrfToken = json.csrfToken;
  } catch {
    return NextResponse.redirect(
      new URL("/auth/signin?error=DemoLoginFailed", base)
    );
  }

  if (!csrfToken) {
    return NextResponse.redirect(new URL("/auth/signin?error=CsrfError", base));
  }

  const { email, password } = getDemoCredentials();
  const csrfSetCookies = csrfRes.headers.getSetCookie?.() ?? [];
  const csrfCookieHeader = getCookieHeaderFromSetCookie(csrfSetCookies);
  const cookieHeader = mergeCookieHeaders(
    req.headers.get("cookie") ?? "",
    csrfCookieHeader
  );

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: "/dashboard",
    json: "true",
  });

  const signInHeaders: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: cookieHeader,
  };
  if (demoSecret) {
    signInHeaders["X-Demo-Login"] = demoSecret;
  }

  try {
    signInRes = await fetch(`${base}/api/auth/callback/credentials`, {
      method: "POST",
      headers: signInHeaders,
      body: body.toString(),
      redirect: "manual",
    });
  } catch {
    return NextResponse.redirect(
      new URL("/auth/signin?error=DemoLoginFailed", base)
    );
  }

  let redirectUrl: string | null = null;
  const setCookies = signInRes.headers.getSetCookie?.() ?? [];

  if (signInRes.status >= 300 && signInRes.status < 400) {
    redirectUrl = signInRes.headers.get("location");
  } else {
    try {
      const data = (await signInRes.json()) as { url?: string; error?: string };
      redirectUrl = data?.url ?? null;
    } catch {
      /* non-JSON response */
    }
  }

  if (redirectUrl) {
    const absUrl = redirectUrl.startsWith("http")
      ? redirectUrl
      : new URL(redirectUrl, base).toString();
    const res = NextResponse.redirect(absUrl);
    for (const c of setCookies) {
      res.headers.append("Set-Cookie", c);
    }
    return res;
  }

  const errParams = new URLSearchParams({ error: "DemoLoginFailed" });
  if (process.env.NODE_ENV === "development") {
    errParams.set("reason", `status-${signInRes.status}`);
  }
  return NextResponse.redirect(new URL(`/auth/signin?${errParams}`, base));
}
