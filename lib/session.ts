import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import type { CurrentUser } from "./types";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
