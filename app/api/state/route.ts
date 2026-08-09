import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getAppState, saveAppState } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const state = await getAppState();
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }

  await saveAppState(body);
  return NextResponse.json({ ok: true });
}
