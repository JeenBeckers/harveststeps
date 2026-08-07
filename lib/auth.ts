import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { CurrentUser, Role } from "./types";

export const SESSION_COOKIE = "hv_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it as an environment variable in Vercel.");
  }
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: CurrentUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<CurrentUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const role = payload.role;
    if (!payload.sub || typeof payload.email !== "string" || (role !== "viewer" && role !== "editor")) {
      return null;
    }
    return { id: Number(payload.sub), email: payload.email, role: role as Role };
  } catch {
    return null;
  }
}
