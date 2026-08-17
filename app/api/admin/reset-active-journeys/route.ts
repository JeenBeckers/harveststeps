import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { resetActiveHarvesterJourneys } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Alleen beheerders kunnen dit uitvoeren." }, { status: 403 });

  const count = await resetActiveHarvesterJourneys();
  return NextResponse.json({ ok: true, count });
}
