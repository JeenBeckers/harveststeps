import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { deleteFeatureRequest, getFeatureRequestById } from "@/lib/db";

const GITHUB_REPO = "JeenBeckers/harveststeps";

async function closeLinkedIssue(githubIssueUrl: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const issueNumber = githubIssueUrl.match(/\/issues\/(\d+)/)?.[1];
  if (!token || !issueNumber) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
  await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ body: "Verwijderd in HarvestSteps — dit verzoek hoeft niet meer gebouwd te worden." }),
  }).catch(() => {});
  await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ state: "closed" }),
  }).catch(() => {});
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Alleen beheerders kunnen een verzoek verwijderen." }, { status: 403 });

  const { id } = await params;
  const featureRequestId = Number(id);
  const featureRequest = await getFeatureRequestById(featureRequestId);
  if (!featureRequest) return NextResponse.json({ error: "Verzoek niet gevonden." }, { status: 404 });

  if (featureRequest.githubIssueUrl) await closeLinkedIssue(featureRequest.githubIssueUrl);
  await deleteFeatureRequest(featureRequestId);

  return NextResponse.json({ ok: true });
}
