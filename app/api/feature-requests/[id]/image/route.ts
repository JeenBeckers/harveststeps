import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getFeatureRequestImage } from "@/lib/db";
import { isFeatureLive } from "@/lib/flags";
import { FEATURE_REQUEST_IMAGE_FLAG } from "@/lib/featureRequestImage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (!(await isFeatureLive(FEATURE_REQUEST_IMAGE_FLAG))) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const { id } = await params;
  const featureRequestId = Number(id);
  if (!Number.isInteger(featureRequestId)) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const image = await getFeatureRequestImage(featureRequestId);
  if (!image) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  return new Response(Buffer.from(image.dataBase64, "base64"), {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Disposition": "inline",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
