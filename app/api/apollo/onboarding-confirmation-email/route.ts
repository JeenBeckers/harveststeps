import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

const APOLLO_BASE = "https://api.apollo.io/v1";
// Apollo sequence "Bevestiging onboarding Harvest" and Jeen's mailbox, created/looked up 2026-08-11. Override via env if either changes.
const DEFAULT_SEQUENCE_ID = "6a7abb20d00f82000c141aff";
const DEFAULT_SENDER_EMAIL_ACCOUNT_ID = "6a57e6bbe368c9001055bfa8";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APOLLO_API_KEY is niet ingesteld. Voeg deze toe als environment variable in Vercel." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const contactName = typeof body?.contactName === "string" ? body.contactName.trim() : "";
  const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim() : "";
  const organizationName = typeof body?.organizationName === "string" ? body.organizationName.trim() : "";
  if (!contactName || !contactEmail) {
    return NextResponse.json({ error: "Naam en e-mailadres van de contactpersoon zijn verplicht." }, { status: 400 });
  }

  const [firstName, ...rest] = contactName.split(" ").filter(Boolean);
  const lastName = rest.join(" ");
  const sequenceId = process.env.APOLLO_ONBOARDING_CONFIRMATION_SEQUENCE_ID || DEFAULT_SEQUENCE_ID;
  const senderEmailAccountId = process.env.APOLLO_SENDER_EMAIL_ACCOUNT_ID || DEFAULT_SENDER_EMAIL_ACCOUNT_ID;

  const contactRes = await fetch(`${APOLLO_BASE}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      first_name: firstName || contactName,
      last_name: lastName,
      email: contactEmail,
      organization_name: organizationName || undefined,
    }),
  });
  const contactBody = await contactRes.json().catch(() => null);
  const contactId = contactBody?.contact?.id;
  if (!contactRes.ok || !contactId) {
    return NextResponse.json({ error: "Kon contact niet aanmaken in Apollo." }, { status: 502 });
  }

  const addRes = await fetch(`${APOLLO_BASE}/emailer_campaigns/${sequenceId}/add_contact_ids`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      contact_ids: [contactId],
      emailer_campaign_id: sequenceId,
      send_email_from_email_account_id: senderEmailAccountId,
    }),
  });
  if (!addRes.ok) {
    const errBody = await addRes.json().catch(() => null);
    return NextResponse.json(
      { error: errBody?.error || errBody?.message || "Kon contact niet toevoegen aan de Apollo-sequence." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, contactId });
}
