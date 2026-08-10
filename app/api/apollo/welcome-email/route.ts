import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

const APOLLO_BASE = "https://api.apollo.io/v1";
// Apollo sequence "Welkomstmail" and Jeen's mailbox, created/looked up 2026-08-10. Override via env if either changes.
const DEFAULT_SEQUENCE_ID = "6a79b5e3b27e7a0010450729";
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
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!email) return NextResponse.json({ error: "E-mailadres ontbreekt." }, { status: 400 });

  const [firstName, ...rest] = name.split(" ").filter(Boolean);
  const lastName = rest.join(" ");
  const sequenceId = process.env.APOLLO_WELCOME_SEQUENCE_ID || DEFAULT_SEQUENCE_ID;
  const senderEmailAccountId = process.env.APOLLO_SENDER_EMAIL_ACCOUNT_ID || DEFAULT_SENDER_EMAIL_ACCOUNT_ID;

  const contactRes = await fetch(`${APOLLO_BASE}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ first_name: firstName || name, last_name: lastName, email }),
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
