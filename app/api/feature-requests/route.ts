import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createFeatureRequest, listFeatureRequests } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const requests = await listFeatureRequests();
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const spec = body?.spec;
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

  const created = await createFeatureRequest(spec, user.email);
  return NextResponse.json({ request: created });
}
