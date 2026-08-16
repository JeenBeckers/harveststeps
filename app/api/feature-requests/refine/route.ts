import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser } from "@/lib/session";
import type { RefineMessage } from "@/lib/types";

const SYSTEM_PROMPT = `Je bent de "Refine"-assistent in HarvestSteps. Een collega beschrijft een verbetering die ze willen laten bouwen. Bevestigde specs gaan zonder verdere menselijke code-review naar een geautomatiseerde build-run (alleen een automatische security-check is een harde stop) — daarom is scherp afgebakende, kleine scope het allerbelangrijkste dat je bewaakt.

Regels:
1. Stel in totaal maximaal twee verduidelijkingsvragen (via ask_clarifying_question) voordat je een spec voorstelt.
2. Als het idee te groot is, vaag is, of eigenlijk meerdere losse dingen combineert: gebruik ask_clarifying_question om dat expliciet te benoemen en help actief om het terug te brengen tot iets dat in één build-run gebouwd kan worden. Dit is je belangrijkste taak — laat nooit een te grote of te vage spec door.
3. Zodra het idee duidelijk én klein genoeg is, roep propose_spec aan met een complete spec.
4. Schrijf in het Nederlands, kort en concreet.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "ask_clarifying_question",
    description:
      "Stel de aanvrager een verduidelijkingsvraag, of duw actief terug en help het idee kleiner maken als het te groot of vaag is voor één automatische build.",
    input_schema: {
      type: "object",
      properties: { question: { type: "string" } },
      required: ["question"],
    },
  },
  {
    name: "propose_spec",
    description: "Stel de definitieve, scherp afgebakende spec voor zodra het idee duidelijk en klein genoeg is voor één build-run.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        problem: { type: "string" },
        desiredOutcome: { type: "string" },
        inScope: { type: "string" },
        outOfScope: { type: "string" },
        area: { type: "string" },
        priority: { type: "string", enum: ["laag", "middel", "hoog"] },
      },
      required: ["title", "problem", "desiredOutcome", "inScope", "outOfScope", "area", "priority"],
    },
  },
];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  if (user.role !== "editor" && user.role !== "admin") return NextResponse.json({ error: "Geen rechten" }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is niet ingesteld. Voeg deze toe als environment variable in Vercel." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? (body.messages as RefineMessage[]) : [];
  if (messages.length === 0) return NextResponse.json({ error: "Geen berichten." }, { status: 400 });

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    tool_choice: { type: "any" },
    messages: messages.map((m) => ({ role: m.role, content: m.text })),
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({ error: "Onverwacht antwoord van Claude." }, { status: 502 });
  }

  if (toolUse.name === "ask_clarifying_question") {
    const input = toolUse.input as { question: string };
    return NextResponse.json({ type: "question", text: input.question });
  }

  if (toolUse.name === "propose_spec") {
    const input = toolUse.input as Record<string, string>;
    return NextResponse.json({
      type: "spec",
      spec: {
        title: input.title,
        problem: input.problem,
        desiredOutcome: input.desiredOutcome,
        inScope: input.inScope,
        outOfScope: input.outOfScope,
        area: input.area,
        priority: input.priority,
      },
    });
  }

  return NextResponse.json({ error: "Onbekend antwoordtype." }, { status: 502 });
}
