import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createUser, listUsers } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const users = await listUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role === "admin" ? "admin" : body?.role === "editor" ? "editor" : "viewer";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minstens 8 tekens zijn." }, { status: 400 });
  }

  try {
    const newUser = await createUser(email, password, role);
    return NextResponse.json({ id: newUser.id, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt });
  } catch (err) {
    if (String((err as Error)?.message || "").toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "Er bestaat al een gebruiker met dit e-mailadres." }, { status: 409 });
    }
    return NextResponse.json({ error: "Aanmaken mislukt." }, { status: 500 });
  }
}
