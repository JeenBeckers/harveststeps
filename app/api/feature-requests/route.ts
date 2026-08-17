import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createFeatureRequest, listFeatureRequests, type FeatureRequestImage } from "@/lib/db";
import { isFeatureLive } from "@/lib/flags";
import type { FeatureRequestSpec } from "@/lib/types";
import {
  FEATURE_REQUEST_IMAGE_FLAG,
  IMAGE_TOO_LARGE_ERROR,
  IMAGE_TYPE_ERROR,
  MAX_IMAGE_BYTES,
  sniffImageMimeType,
} from "@/lib/featureRequestImage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const requests = await listFeatureRequests();
  const imageUploadEnabled = await isFeatureLive(FEATURE_REQUEST_IMAGE_FLAG);
  return NextResponse.json({ requests, imageUploadEnabled });
}

type ParsedBody = { spec: unknown; imageFile: File | null };

async function parseBody(request: Request): Promise<ParsedBody | null> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    const body = await request.json().catch(() => null);
    return { spec: body?.spec, imageFile: null };
  }

  const form = await request.formData().catch(() => null);
  if (!form) return null;
  const specRaw = form.get("spec");
  if (typeof specRaw !== "string") return null;
  let spec: unknown;
  try {
    spec = JSON.parse(specRaw);
  } catch {
    return null;
  }
  const image = form.get("image");
  return { spec, imageFile: image instanceof File && image.size > 0 ? image : null };
}

/** Leest en valideert de optionele afbeelding; retourneert een foutmelding als de upload niet deugt. */
async function readImage(file: File): Promise<{ image: FeatureRequestImage } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) return { error: IMAGE_TOO_LARGE_ERROR };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES) return { error: IMAGE_TOO_LARGE_ERROR };
  const mimeType = sniffImageMimeType(bytes);
  if (!mimeType) return { error: IMAGE_TYPE_ERROR };
  return { image: { mimeType, dataBase64: Buffer.from(bytes).toString("base64") } };
}

function isFeatureRequestSpec(value: unknown): value is FeatureRequestSpec {
  const spec = value as Record<string, unknown> | null | undefined;
  return (
    !!spec &&
    typeof spec.title === "string" &&
    typeof spec.problem === "string" &&
    typeof spec.desiredOutcome === "string" &&
    typeof spec.inScope === "string" &&
    typeof spec.outOfScope === "string" &&
    typeof spec.area === "string" &&
    typeof spec.priority === "string"
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const parsed = await parseBody(request);
  const spec = parsed?.spec;
  if (!isFeatureRequestSpec(spec)) {
    return NextResponse.json({ error: "Ongeldige spec." }, { status: 400 });
  }

  let image: FeatureRequestImage | null = null;
  if (parsed?.imageFile && (await isFeatureLive(FEATURE_REQUEST_IMAGE_FLAG))) {
    const result = await readImage(parsed.imageFile);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    image = result.image;
  }

  const created = await createFeatureRequest(spec, user.email, image);
  return NextResponse.json({ request: created });
}
