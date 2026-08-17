import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getFeatureRequestById, updateFeatureRequestStatus } from "@/lib/db";
import type { FeatureRequestStatus } from "@/lib/types";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

const VALID_STATUSES: FeatureRequestStatus[] = [
  "concept",
  "ter_review",
  "aangevraagd",
  "bouwen",
  "in_review",
  "verborgen",
  "live",
  "uitgeschakeld",
];

// Called by the feature-request GitHub Actions workflow, not by a logged-in browser session.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const secret = process.env.FEATURE_REQUEST_CALLBACK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "FEATURE_REQUEST_CALLBACK_SECRET is niet ingesteld." }, { status: 500 });
  }
  const provided = request.headers.get("x-callback-secret") || "";
  if (!safeEqual(provided, secret)) {
    return NextResponse.json({ error: "Ongeldig secret." }, { status: 401 });
  }

  const { id } = await params;
  const featureRequestId = Number(id);
  const featureRequest = await getFeatureRequestById(featureRequestId);
  if (!featureRequest) return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const status = body?.status as string | undefined;
  if (!status || !VALID_STATUSES.includes(status as FeatureRequestStatus)) {
    return NextResponse.json({ error: "Ongeldige status." }, { status: 400 });
  }

  await updateFeatureRequestStatus(featureRequestId, status as FeatureRequestStatus, {
    prUrl: typeof body?.prUrl === "string" ? body.prUrl : undefined,
    previewUrl: typeof body?.previewUrl === "string" ? body.previewUrl : undefined,
  });
  return NextResponse.json({ ok: true });
}
