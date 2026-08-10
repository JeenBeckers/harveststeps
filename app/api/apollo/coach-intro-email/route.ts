import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

const APOLLO_BASE = "https://api.apollo.io/v1";
// Jeen's mailbox, looked up 2026-08-10 via apollo_email_accounts_index. Override via env if it changes.
const DEFAULT_SENDER_EMAIL_ACCOUNT_ID = "6a57e6bbe368c9001055bfa8";
const DEFAULT_SENDER_EMAIL = "jeen.beckers@harvest.nl";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

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
  const candidateName = typeof body?.candidateName === "string" ? body.candidateName.trim() : "";
  const candidateEmail = typeof body?.candidateEmail === "string" ? body.candidateEmail.trim() : "";
  const coachName = typeof body?.coachName === "string" ? body.coachName.trim() : "";
  const coachEmail = typeof body?.coachEmail === "string" ? body.coachEmail.trim() : "";
  if (!candidateEmail || !coachName || !coachEmail) {
    return NextResponse.json({ error: "Kandidaat e-mail, coach naam en coach e-mail zijn verplicht." }, { status: 400 });
  }

  const [firstName, ...rest] = candidateName.split(" ").filter(Boolean);
  const lastName = rest.join(" ");
  const senderEmailAccountId = process.env.APOLLO_SENDER_EMAIL_ACCOUNT_ID || DEFAULT_SENDER_EMAIL_ACCOUNT_ID;
  const senderEmail = process.env.APOLLO_SENDER_EMAIL || DEFAULT_SENDER_EMAIL;

  const contactRes = await fetch(`${APOLLO_BASE}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ first_name: firstName || candidateName, last_name: lastName, email: candidateEmail }),
  });
  const contactBody = await contactRes.json().catch(() => null);
  const contactId = contactBody?.contact?.id;
  if (!contactRes.ok || !contactId) {
    return NextResponse.json({ error: "Kon contact niet aanmaken in Apollo." }, { status: 502 });
  }

  const subject = "Kennismaking met je soft skill coach";
  const bodyHtml = `<p>Beste ${escapeHtml(firstName || candidateName)},</p>
<p>Het softskill programma en de bijbehorende coaching is een zeer belangrijk onderdeel van jouw Harvest jaar. Daarom vindt de kennismaking met jouw coach al binnen de eerste maand na jouw komst plaats. De coach ${escapeHtml(coachName)} zal op korte termijn contact met je opnemen om hiervoor een afspraak in te plannen.</p>
<p>We willen je vragen om je voor te bereiden op deze intake. Dit kan met behulp van de volgende vragen:</p>
<ul>
<li>Wat motiveert jou om deel te nemen aan het Talent Program en wat hoop je hiermee te bereiken?</li>
<li>Welke verwachtingen heb je specifiek van het coaching gedeelte van het programma?</li>
<li>Op welke gebieden wil je jezelf qua houding en gedrag verbeteren?</li>
<li>Waarin ben je momenteel sterk en hoe wil je deze kwaliteiten verder benutten in je werk?</li>
<li>Zijn er specifieke onderwerpen of uitdagingen die je tijdens het coaching programma wilt bespreken?</li>
</ul>
<p>Ben je al bij de klant aan de slag? Dan is het handig om het coaching gesprek op te nemen in je agenda bij de klant zodat jouw team weet dat je dan in gesprek bent.</p>`;

  const draftRes = await fetch(`${APOLLO_BASE}/emailer_messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      contact_id: contactId,
      subject,
      body_html: bodyHtml,
      recipients: [
        { email: candidateEmail, recipient_type_cd: "to" },
        { email: coachEmail, recipient_type_cd: "cc" },
      ],
    }),
  });
  const draftBody = await draftRes.json().catch(() => null);
  const messageId = draftBody?.emailer_message?.id || draftBody?.id;
  if (!draftRes.ok || !messageId) {
    return NextResponse.json({ error: "Kon het conceptbericht niet aanmaken in Apollo." }, { status: 502 });
  }

  const sendRes = await fetch(`${APOLLO_BASE}/emailer_messages/${messageId}/send_now`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ send_from: { email_account_id: senderEmailAccountId, email: senderEmail } }),
  });
  if (!sendRes.ok) {
    const errBody = await sendRes.json().catch(() => null);
    return NextResponse.json(
      { error: errBody?.error || errBody?.message || "Kon de mail niet versturen via Apollo." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
