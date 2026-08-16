import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { findUserByEmail, getFeatureRequestById, requestFeatureReview, submitFeatureReview } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const { id } = await params;
  const featureRequestId = Number(id);
  const featureRequest = await getFeatureRequestById(featureRequestId);
  if (!featureRequest) return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "request") {
    const reviewerEmail = typeof body?.reviewerEmail === "string" ? body.reviewerEmail.trim().toLowerCase() : "";
    if (!reviewerEmail) return NextResponse.json({ error: "Kies een collega om te reviewen." }, { status: 400 });
    const reviewer = await findUserByEmail(reviewerEmail);
    if (!reviewer) return NextResponse.json({ error: "Deze gebruiker bestaat niet." }, { status: 400 });
    await requestFeatureReview(featureRequestId, reviewerEmail, user.email);
    return NextResponse.json({ ok: true });
  }

  if (action === "submit") {
    if (featureRequest.reviewerEmail?.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Alleen de gevraagde reviewer kan dit indienen." }, { status: 403 });
    }
    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";
    await submitFeatureReview(featureRequestId, comment, user.email);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
}
