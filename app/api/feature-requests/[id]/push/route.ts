import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getFeatureRequestById, pushFeatureRequestToBuild } from "@/lib/db";

const GITHUB_REPO = "JeenBeckers/harveststeps";
const GITHUB_LABEL = "harvest-steps-request";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const { id } = await params;
  const featureRequestId = Number(id);
  const featureRequest = await getFeatureRequestById(featureRequestId);
  if (!featureRequest) return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });
  if (featureRequest.status !== "concept") {
    return NextResponse.json({ error: "Dit verzoek staat al klaar voor bouwen of is al verder." }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN is niet ingesteld. Voeg deze toe als environment variable in Vercel." },
      { status: 500 }
    );
  }

  const body = [
    `<!-- feature-request-id: ${featureRequestId} -->`,
    `<!-- flag-key: ${featureRequest.flagKey} -->`,
    "",
    `**Probleem**`,
    featureRequest.problem,
    "",
    `**Gewenste uitkomst**`,
    featureRequest.desiredOutcome,
    "",
    `**In scope**`,
    featureRequest.inScope,
    "",
    `**Buiten scope**`,
    featureRequest.outOfScope,
    "",
    `**Onderdeel van de app**: ${featureRequest.area}`,
    `**Prioriteit**: ${featureRequest.priority}`,
    `**Aangevraagd door**: ${featureRequest.requestedByEmail}`,
  ].join("\n");

  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: featureRequest.title, body, labels: [GITHUB_LABEL] }),
  });
  const resBody = await res.json().catch(() => null);
  if (!res.ok || !resBody?.html_url) {
    return NextResponse.json({ error: resBody?.message || "Kon geen GitHub issue aanmaken." }, { status: 502 });
  }

  await pushFeatureRequestToBuild(featureRequestId, resBody.html_url as string, user.email);
  return NextResponse.json({ ok: true, githubIssueUrl: resBody.html_url });
}
