import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

const AUTH_COOKIE = "access_token";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

function getMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    for (const key of ["message", "error", "detail"]) {
      if (typeof record[key] === "string" && record[key].length > 0) {
        return record[key];
      }
    }
  }

  return fallback;
}

export async function POST(request: Request) {
  let payload: LoginPayload;
  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      { message: "A valid email and password are required." },
      { status: 400 },
    );
  }

  if (
    typeof payload.email !== "string" ||
    typeof payload.password !== "string" ||
    !payload.email.trim() ||
    !payload.password
  ) {
    return NextResponse.json(
      { message: "A valid email and password are required." },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${getBackendUrl().replace(/\/+$/, "")}/api/auth/login`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: payload.email.trim(),
          password: payload.password,
        }),
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { message: "The authentication service is unavailable." },
      { status: 502 },
    );
  }

  let upstreamPayload: unknown;
  try {
    upstreamPayload = await upstream.json();
  } catch {
    return NextResponse.json(
      { message: "The authentication service returned an invalid response." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      {
        message: getMessage(upstreamPayload, "Unable to sign in."),
      },
      { status: upstream.status },
    );
  }

  const token =
    typeof upstreamPayload === "object" && upstreamPayload !== null
      ? (upstreamPayload as Record<string, unknown>).token
      : undefined;

  if (typeof token !== "string" || !token) {
    return NextResponse.json(
      { message: "The authentication service did not return a token." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
