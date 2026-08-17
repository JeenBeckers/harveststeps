import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUserPreferences, saveUserPreferences } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const prefs = await getUserPreferences(user.id);
  return NextResponse.json(prefs);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.navCollapsed !== "boolean") {
    return NextResponse.json({ error: "Ongeldige voorkeuren." }, { status: 400 });
  }

  await saveUserPreferences(user.id, { navCollapsed: body.navCollapsed });
  return NextResponse.json({ ok: true });
}
