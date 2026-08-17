import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getFeatureRequestImage } from "@/lib/db";
import { isFeatureLive } from "@/lib/flags";
import { IMAGE_UPLOAD_FLAG_KEY } from "@/lib/featureRequestImage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (!(await isFeatureLive(IMAGE_UPLOAD_FLAG_KEY))) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }

  const { id } = await params;
  const featureRequestId = Number(id);
  if (!Number.isInteger(featureRequestId)) return NextResponse.json({ error: "Ongeldig id." }, { status: 400 });

  const image = await getFeatureRequestImage(featureRequestId);
  if (!image) return NextResponse.json({ error: "Geen afbeelding bij dit voorstel." }, { status: 404 });

  const bytes = new Uint8Array(Buffer.from(image.base64, "base64"));
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `inline; filename="voorstel-${featureRequestId}"`,
      // De bytes komen van een gebruiker: nooit sniffen en niets laten uitvoeren.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
