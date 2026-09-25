import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { roles, type SessionPayload } from "@/lib/definitions";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(getKey());
}

// Returns the session if the token is authentic and unexpired, otherwise null.
export async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || !roles.includes(payload.role as never)) {
      return null;
    }
    return { userId: payload.userId, role: payload.role as SessionPayload["role"] };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: SessionPayload["role"]) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId, role, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
