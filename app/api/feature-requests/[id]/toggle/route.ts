import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getFeatureRequestById, toggleFeatureRequestLive } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Alleen beheerders kunnen dit omzetten." }, { status: 403 });

  const { id } = await params;
  const featureRequestId = Number(id);
  const featureRequest = await getFeatureRequestById(featureRequestId);
  if (!featureRequest) return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const isLive = body?.isLive === true;
  const reason = typeof body?.reason === "string" ? body.reason.trim() || null : null;

  await toggleFeatureRequestLive(featureRequestId, isLive, user.email, reason);
  return NextResponse.json({ ok: true });
}
