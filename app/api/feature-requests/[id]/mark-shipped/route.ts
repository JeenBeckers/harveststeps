import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getFeatureRequestById, updateFeatureRequestStatus } from "@/lib/db";

// For the case where an admin reviewed and merged a PR by hand on GitHub instead of
// letting the auto_merge job do it — that manual merge has no way to call the workflow's
// own status callback, so the app stays stuck reporting "bouwen"/"in_review" even though
// the code has genuinely shipped. This lets an admin correct that from their own session,
// without needing the GitHub Actions callback secret.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Alleen beheerders kunnen dit markeren." }, { status: 403 });

  const { id } = await params;
  const featureRequestId = Number(id);
  const featureRequest = await getFeatureRequestById(featureRequestId);
  if (!featureRequest) return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });

  await updateFeatureRequestStatus(featureRequestId, "verborgen", { detail: `Handmatig gemarkeerd als verborgen door ${user.email}` });
  return NextResponse.json({ ok: true });
}
