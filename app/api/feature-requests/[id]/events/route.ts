import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { listFeatureRequestEvents } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const events = await listFeatureRequestEvents(Number(id));
  return NextResponse.json({ events });
}
