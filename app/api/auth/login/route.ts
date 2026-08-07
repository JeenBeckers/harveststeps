import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail en wachtwoord zijn verplicht." }, { status: 400 });
  }

  let user;
  try {
    user = await findUserByEmail(email);
  } catch {
    return NextResponse.json(
      { error: "Database niet beschikbaar. Neem contact op met de beheerder." },
      { status: 503 }
    );
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Onjuiste e-mail of wachtwoord." }, { status: 401 });
  }

  const token = await createSessionToken({ id: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ id: user.id, email: user.email, role: user.role });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
