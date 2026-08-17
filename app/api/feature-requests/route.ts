import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createFeatureRequest, listFeatureRequests, type FeatureRequestImage } from "@/lib/db";
import { isFeatureLive } from "@/lib/flags";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  detectImageMime,
  IMAGE_SIZE_ERROR,
  IMAGE_TYPE_ERROR,
  IMAGE_UPLOAD_FLAG_KEY,
  MAX_IMAGE_BYTES,
} from "@/lib/featureRequestImage";

/** Ruimte voor de spec-JSON plus de multipart-omhulling naast de afbeelding zelf. */
const MAX_MULTIPART_OVERHEAD_BYTES = 64 * 1024;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const requests = await listFeatureRequests();
  return NextResponse.json({ requests, imageUploadEnabled: await isFeatureLive(IMAGE_UPLOAD_FLAG_KEY) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  // Met afbeelding stuurt de client multipart (ruwe bytes), zonder afbeelding gewoon JSON.
  const isMultipart = (request.headers.get("content-type") || "").includes("multipart/form-data");
  let spec: Record<string, unknown> | undefined;
  let imageFile: File | null = null;

  if (isMultipart) {
    // Weiger een te grote body voordat formData() hem in het geheugen trekt.
    const declaredLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES + MAX_MULTIPART_OVERHEAD_BYTES) {
      return NextResponse.json({ error: IMAGE_SIZE_ERROR }, { status: 413 });
    }
    const form = await request.formData().catch(() => null);
    const rawSpec = form?.get("spec");
    if (typeof rawSpec === "string") {
      try {
        spec = JSON.parse(rawSpec) as Record<string, unknown>;
      } catch {
        return NextResponse.json({ error: "Ongeldige spec." }, { status: 400 });
      }
    }
    const rawImage = form?.get("image");
    if (rawImage instanceof File && rawImage.size > 0) imageFile = rawImage;
  } else {
    const body = await request.json().catch(() => null);
    spec = body?.spec;
  }

  if (
    !spec ||
    typeof spec.title !== "string" ||
    typeof spec.problem !== "string" ||
    typeof spec.desiredOutcome !== "string" ||
    typeof spec.inScope !== "string" ||
    typeof spec.outOfScope !== "string" ||
    typeof spec.area !== "string" ||
    typeof spec.priority !== "string"
  ) {
    return NextResponse.json({ error: "Ongeldige spec." }, { status: 400 });
  }

  let image: FeatureRequestImage | null = null;
  if (imageFile) {
    if (!(await isFeatureLive(IMAGE_UPLOAD_FLAG_KEY))) {
      return NextResponse.json({ error: "Afbeeldingen uploaden is niet beschikbaar." }, { status: 400 });
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: IMAGE_SIZE_ERROR }, { status: 400 });
    }
    if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(imageFile.type)) {
      return NextResponse.json({ error: IMAGE_TYPE_ERROR }, { status: 400 });
    }
    const bytes = new Uint8Array(await imageFile.arrayBuffer());
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: IMAGE_SIZE_ERROR }, { status: 400 });
    }
    const mime = detectImageMime(bytes);
    if (!mime) {
      return NextResponse.json({ error: IMAGE_TYPE_ERROR }, { status: 400 });
    }
    image = { base64: Buffer.from(bytes).toString("base64"), mime };
  }

  const created = await createFeatureRequest(
    {
      title: spec.title,
      problem: spec.problem,
      desiredOutcome: spec.desiredOutcome,
      inScope: spec.inScope,
      outOfScope: spec.outOfScope,
      area: spec.area,
      priority: spec.priority,
    },
    user.email,
    image
  );
  return NextResponse.json({ request: created });
}
