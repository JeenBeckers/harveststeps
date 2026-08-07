import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { countEditors, deleteUser, findUserById, updateUserRole } from "@/lib/db";
import type { CurrentUser } from "@/lib/types";

async function requireEditor(): Promise<{ user: CurrentUser } | { error: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Niet ingelogd" }, { status: 401 }) };
  if (user.role !== "editor") return { error: NextResponse.json({ error: "Geen rechten" }, { status: 403 }) };
  return { user };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireEditor();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const targetId = Number(id);

  const body = await request.json().catch(() => null);
  const role = body?.role === "editor" ? "editor" : body?.role === "viewer" ? "viewer" : null;
  if (!role) return NextResponse.json({ error: "Ongeldige rol." }, { status: 400 });

  const target = await findUserById(targetId);
  if (!target) return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });

  if (target.role === "editor" && role === "viewer") {
    const editors = await countEditors();
    if (editors <= 1) {
      return NextResponse.json({ error: "Er moet minstens één bewerker overblijven." }, { status: 400 });
    }
  }

  await updateUserRole(targetId, role);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireEditor();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const targetId = Number(id);

  if (targetId === auth.user.id) {
    return NextResponse.json({ error: "Je kunt jezelf niet verwijderen." }, { status: 400 });
  }

  const target = await findUserById(targetId);
  if (!target) return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });

  if (target.role === "editor") {
    const editors = await countEditors();
    if (editors <= 1) {
      return NextResponse.json({ error: "Er moet minstens één bewerker overblijven." }, { status: 400 });
    }
  }

  await deleteUser(targetId);
  return NextResponse.json({ ok: true });
}
