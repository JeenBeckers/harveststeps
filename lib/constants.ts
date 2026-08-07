import type { Department, SystemDef, TemplateStop } from "./types";

export const DEFAULT_SYSTEMS: SystemDef[] = [
  { key: "slack", name: "Slack", mono: "S" },
  { key: "nela", name: "NELA", mono: "N" },
  { key: "confluence", name: "Confluence", mono: "C" },
  { key: "zoho", name: "Zoho People", mono: "Z" },
  { key: "zohoexp", name: "Zoho Expense", mono: "Ze" },
  { key: "gws", name: "Google Workspace", mono: "G" },
  { key: "loket", name: "Loket.nl", mono: "L" },
  { key: "bitbucket", name: "Bitbucket", mono: "B" },
  { key: "jordan", name: "Jordan", mono: "Jo" },
  { key: "westijn", name: "Westijn", mono: "W" },
  { key: "james", name: "James", mono: "Ja" },
  { key: "afas", name: "Afas", mono: "A" },
];

export const DEFAULT_DEPTS: Department[] = [
  { id: "d1", name: "Recruitment", members: ["Sarah", "Bastijn de Groot", "Wessal Wafa"] },
  { id: "d2", name: "ESM", members: ["Romy Brussaard"] },
  { id: "d3", name: "Sales", members: ["Julieta van Hierden", "Marlie Ekdom", "Jeen Beckers", "Frank Schaeffer"] },
  { id: "d4", name: "Operations", members: ["Anouk Schriek", "Romy Brussaard"] },
  { id: "d5", name: "Academy", members: ["Bernhard Righolt", "Otman", "Jeen Beckers"] },
];

export const ESM_LEAD = "Romy Brussaard";
export const EXTRA_OWNERS = ["Harvester", "Klant"];

/** Literale eigenaren in de standaardroute worden vertaald naar een medewerker. */
export const OWNER_MAP: Record<string, string> = {
  Operations: "Anouk Schriek",
  Recruitment: "Sarah",
  Sales: "Julieta van Hierden",
  IT: "Anouk Schriek",
  Techniek: "Bernhard Righolt",
  Academy: "Bernhard Righolt",
  TO: "Bernhard Righolt",
  Coach: "Otman",
};

export const STATUSES = ["Alle", "Nog te doen", "Bezig", "Afgerond"];

type RawTemplateStop = {
  phase: string;
  name: string;
  dept: string;
  esm: boolean;
  crit?: boolean;
  note?: string;
  involved: string[];
  sys: string[];
  tasks: [string, string][];
};

/**
 * Bron: Tijdlijn Harvest Talenten 07.2026 + functieprofiel Employee Success Manager.
 * esm:false = eindverantwoordelijke is de recruiter; esm:true = de ESM'er.
 * crit:true = evaluatiemoment (in de tijdlijn rood gemarkeerd).
 */
const RAW_TEMPLATE: RawTemplateStop[] = [
  { phase: "Recruitment", name: "Sourcing & eerste contact", dept: "Recruitment", esm: false, involved: ["Recruitment", "Talent pool"], sys: ["nela", "jordan"],
    tasks: [["Profiel aanmaken in NELA", "@eind"], ["Belafspraak inplannen", "@eind"], ["Bron vastleggen in Jordan", "Recruitment"]] },
  { phase: "Recruitment", name: "Kennismakingsgesprek recruitment", dept: "Recruitment", esm: false, involved: ["Recruitment"], sys: ["nela", "gws"],
    tasks: [["Gespreksverslag in NELA", "@eind"], ["Motivatie & ambitie uitvragen", "@eind"], ["Terugkoppeling binnen 48 uur", "Recruitment"]] },
  { phase: "Recruitment", name: "Assessment & technische case", dept: "Recruitment", esm: false, involved: ["Recruitment", "Academy"], sys: ["nela", "james"],
    tasks: [["Case versturen via James", "@eind"], ["Technische review door T.O.", "Techniek"], ["Scorecard vastleggen in NELA", "@eind"]] },
  { phase: "Recruitment", name: "Aanbod & arbeidsvoorwaarden", dept: "Recruitment", esm: false, involved: ["Recruitment", "Operations"], sys: ["nela", "afas"],
    tasks: [["Aanbod opstellen", "@eind"], ["Arbeidsvoorwaardengesprek voeren", "@eind"], ["Akkoord vastleggen in Afas", "Operations"]] },
  { phase: "Recruitment", name: "Matchgesprek met klant", dept: "Sales", esm: true, involved: ["Sales", "Klant", "ESM"], sys: ["nela", "westijn"],
    tasks: [["Klantprofiel afstemmen", "@guide"], ["Matchgesprek plannen", "@guide"], ["Uitkomst vastleggen in Westijn", "Sales"]] },

  { phase: "Indiensttreding", name: "Contract & administratie", dept: "Operations", esm: true, involved: ["Operations", "ESM"], sys: ["afas", "zoho", "loket"],
    tasks: [["Contract laten tekenen in Afas", "Operations"], ["Personeelsdossier in Zoho People", "Operations"], ["Loonstrook-toegang via Loket.nl", "Operations"], ["ID & diploma's verifiëren", "Operations"]] },
  { phase: "Indiensttreding", name: "Kennismakingsgesprek ESM", dept: "ESM", esm: true, involved: ["ESM"], sys: ["confluence", "gws"],
    note: "Uit het functieprofiel ESM: 30 minuten, eenmalig. De Harvest-tijdlijn en de verwachtingen voor het hele jaar worden doorgenomen.",
    tasks: [["Harvest-tijdlijn doornemen", "@eind"], ["Verwachtingen over en weer bespreken", "@eind"], ["Toelichting op het Harvest-jaar geven", "@eind"]] },
  { phase: "Indiensttreding", name: "Voorbereiding eerste werkdag", dept: "ESM", esm: true, involved: ["ESM", "Klant", "Operations"], sys: ["gws", "slack"],
    note: "Uit het functieprofiel ESM: 30 minuten, eenmalig.",
    tasks: [["Praktische zaken afstemmen met de klant", "@eind"], ["Startdatum en werkplek bevestigen", "@eind"], ["Introductieplanning delen met talent", "@eind"]] },
  { phase: "Indiensttreding", name: "Week 1 — accounts activeren", dept: "Operations", esm: true, involved: ["Operations", "ESM", "Harvester"], sys: ["gws", "slack", "zoho", "loket", "bitbucket"],
    tasks: [["Google Workspace en Slack activeren", "Harvester"], ["Zoho People inrichten", "Operations"], ["Loket.nl-toegang controleren", "Operations"], ["Slack-kanalen Talent Class, Program Class en General toewijzen", "Operations"], ["Bitbucket-toegang regelen", "IT"]] },
  { phase: "Indiensttreding", name: "Nabellen na eerste werkdag", dept: "ESM", esm: true, involved: ["ESM"], sys: ["gws"],
    note: "Uit het functieprofiel ESM: 15 minuten, eenmalig. Telefonisch de eerste indrukken opvangen.",
    tasks: [["Talent bellen na dag één", "@eind"], ["Eerste indrukken vastleggen", "@eind"], ["Signalen delen met Sales en T.O.", "@eind"]] },

  { phase: "Fase 1 · Onboarding & doelen stellen", name: "Maand 1 — Kennismaking T.O. en soft skill coach", dept: "ESM", esm: true, involved: ["ESM", "Academy"], sys: ["slack", "gws"],
    tasks: [["Kennismaking met T.O. inplannen", "@eind"], ["Kennismaking met soft skill coach inplannen", "@eind"], ["Confluence en Way of Working doorlopen", "Harvester"]] },
  { phase: "Fase 1 · Onboarding & doelen stellen", name: "Maand 1 — Technisch PLP en Soft Skill PLP", dept: "Academy", esm: true, involved: ["Academy", "ESM", "Harvester"], sys: ["nela", "confluence"],
    note: "Beide leerplannen worden in NELA opgesteld en met de T.O. besproken. Uitleg staat op Confluence.",
    tasks: [["Technisch PLP opstellen in NELA", "Harvester"], ["Soft Skill PLP opstellen in NELA", "Harvester"], ["PLP's bespreken met T.O.", "Techniek"], ["Inplanning 3 jaarlijkse PLP-gesprekken", "@eind"]] },
  { phase: "Fase 1 · Onboarding & doelen stellen", name: "Maand 1 — Top 10 electives doorgeven", dept: "ESM", esm: true, involved: ["ESM", "Academy", "Harvester"], sys: ["nela", "confluence"],
    note: "Het jaar telt 20 masterclasses: 8 talent class, 7 program class en 5 electives.",
    tasks: [["Top 10 electives doorgeven", "Harvester"], ["Keuzemodules verwerken", "@eind"], ["Masterclassdata in agenda van klant zetten", "Harvester"]] },
  { phase: "Fase 1 · Onboarding & doelen stellen", name: "Maand 1 — Urenregistratie op gang", dept: "Operations", esm: true, involved: ["Operations", "Harvester"], sys: ["zoho", "zohoexp"],
    tasks: [["Elke vrijdag uren indienen in Zoho People", "Harvester"], ["Uren ook indienen bij de klant", "Harvester"], ["Declaratieproces in Zoho Expense uitleggen", "Operations"]] },
  { phase: "Fase 1 · Onboarding & doelen stellen", name: "Maand 1 — Evaluatiemomenten inplannen", dept: "ESM", esm: true, involved: ["ESM", "Sales", "Klant", "Academy"], sys: ["gws", "nela"],
    note: "De drie vaste klant- en talentevaluaties (6 weken, 6 maanden, 10 maanden) worden uitgevoerd door Sales en door de ESM'er ingepland.",
    tasks: [["6 weken-evaluatie inplannen met T.O. en klant", "@eind"], ["6 maanden-evaluatie inplannen", "@eind"], ["10 maanden-evaluatie inplannen", "@eind"]] },

  { phase: "Week 6 · Eerste evaluatie", name: "Week 6 — Eerste evaluatiegesprek", dept: "Sales", esm: true, crit: true, involved: ["Sales", "Klant", "ESM", "Academy"], sys: ["nela", "confluence", "westijn"],
    note: "Cruciaal moment uit de tijdlijn. Zie Confluence voor de juiste voorbereiding.",
    tasks: [["Voorbereiding delen via Confluence", "@eind"], ["Evaluatiegesprek voeren met talent en klant", "@guide"], ["Uitkomst vastleggen in NELA", "@guide"], ["Bijsturing bespreken met T.O.", "Techniek"]] },

  { phase: "Fase 2 · Leren & feedback verzamelen", name: "Maand 2 t/m 5 — Coaching en classes", dept: "ESM", esm: true, involved: ["ESM", "Academy", "Harvester"], sys: ["slack", "confluence"],
    tasks: [["1 op 1 coaching met soft skill coach plannen", "Harvester"], ["Talent Class en Program Class volgen", "Harvester"], ["Electives volgen", "Harvester"], ["Feedbackformulier na elke masterclass invullen", "Harvester"]] },
  { phase: "Fase 2 · Leren & feedback verzamelen", name: "Maand 2 t/m 5 — Event-based feedback via NELA", dept: "ESM", esm: true, involved: ["ESM", "Klant", "Harvester"], sys: ["nela"],
    note: "Niet wachten op een officieel gesprek: direct na een presentatie of oplevering input vragen, 3 tot 5 keer per jaar.",
    tasks: [["Feedback vragen na oplevering of presentatie", "Harvester"], ["Openstaande NELA-acties bewaken", "@eind"], ["Signalen bespreken in de wekelijkse afstemming", "@eind"]] },
  { phase: "Fase 2 · Leren & feedback verzamelen", name: "Maand 2 t/m 5 — Soft Skill PLP monitoren", dept: "ESM", esm: true, involved: ["ESM", "Academy"], sys: ["nela"],
    note: "Uit het functieprofiel ESM: 15 minuten per maand aan afstemming met Otman.",
    tasks: [["Wekelijkse afstemming met soft skill coach", "@eind"], ["Voortgang soft skill PLP bijwerken", "Coach"]] },

  { phase: "Maand 6 · Tweede evaluatie", name: "Maand 6 — Tweede evaluatiegesprek", dept: "Sales", esm: true, crit: true, involved: ["Sales", "Klant", "ESM", "Academy"], sys: ["nela", "confluence", "westijn"],
    note: "Cruciaal moment uit de tijdlijn. Plan vlak hiervoor een 1 op 1 met de soft skill coach. Zie Confluence voor de voorbereiding.",
    tasks: [["Voorbereiding op tijd bespreken met T.O.", "Harvester"], ["1 op 1 coaching vlak voor het gesprek", "Coach"], ["Evaluatiegesprek voeren", "@guide"], ["Uitkomst vastleggen in NELA", "@guide"]] },

  { phase: "Fase 3 · Verdieping & jaardoelen", name: "Maand 7 t/m 9 — Bijsturing PLP-doelen", dept: "Academy", esm: true, involved: ["Academy", "ESM", "Harvester"], sys: ["nela"],
    tasks: [["Voortgang PLP bespreken met T.O.", "Harvester"], ["Doelen waar nodig bijstellen", "Techniek"], ["Bijstelling vastleggen in NELA", "Techniek"]] },
  { phase: "Fase 3 · Verdieping & jaardoelen", name: "Maand 7 t/m 9 — Coaching en classes", dept: "ESM", esm: true, involved: ["ESM", "Academy", "Harvester"], sys: ["slack", "confluence"],
    tasks: [["1 op 1 coaching voortzetten", "Harvester"], ["Talent Class, Program Class en electives volgen", "Harvester"], ["Aanwezigheid bij Talent Presents", "@eind"]] },
  { phase: "Fase 3 · Verdieping & jaardoelen", name: "Maand 9 — Voorbereiding 10 maanden-evaluatie", dept: "ESM", esm: true, involved: ["ESM", "Academy", "Harvester"], sys: ["confluence", "gws"],
    tasks: [["Voorbereiding starten volgens Confluence", "Harvester"], ["Voorbereiding bespreken met T.O.", "Techniek"], ["1 op 1 coaching vlak voor de evaluatie", "Coach"]] },

  { phase: "Maand 10 · Laatste evaluatie", name: "Maand 10 — Laatste evaluatiegesprek", dept: "Sales", esm: true, crit: true, involved: ["Sales", "Klant", "ESM", "Academy"], sys: ["nela", "confluence", "westijn"],
    note: "Cruciaal moment uit de tijdlijn en het laatste formele ijkpunt voor de overstap. Zie Confluence voor de voorbereiding.",
    tasks: [["Evaluatiegesprek voeren met talent en klant", "@guide"], ["Uitkomst vastleggen in NELA", "@guide"], ["Vervolgtraject verkennen met klant", "@guide"]] },

  { phase: "Fase 4 · De professionalisering", name: "Maand 11 t/m 12 — Afronding leertraject", dept: "ESM", esm: true, involved: ["ESM", "Academy", "Harvester"], sys: ["slack", "confluence", "nela"],
    tasks: [["Laatste masterclasses afronden", "Harvester"], ["PLP-doelen afronden met T.O.", "Techniek"], ["Openstaande NELA-acties afhandelen", "@eind"]] },
  { phase: "Fase 4 · De professionalisering", name: "Maand 12 — Diploma-uitreiking", dept: "ESM", esm: true, involved: ["ESM", "Academy", "Directie"], sys: ["gws", "slack"],
    note: "Twee keer per jaar op organisatieniveau. De ESM'er coördineert en is aanwezig.",
    tasks: [["Uitreiking coördineren", "@eind"], ["Diploma en dossier bijwerken", "Operations"], ["Talent uitnodigen en begeleiden", "@eind"]] },
  { phase: "Fase 4 · De professionalisering", name: "Maand 12 — Overstap naar klant of uitdiensttreding", dept: "Sales", esm: true, involved: ["Sales", "Operations", "ESM", "Klant"], sys: ["westijn", "afas", "zoho", "nela"],
    tasks: [["Overname of verlenging bespreken met klant", "@guide"], ["Contractafhandeling in Afas", "Operations"], ["Uitdiensttreding verwerken in Zoho People", "Operations"], ["Alumni-status vastleggen in NELA", "Recruitment"]] },
];

export const TEMPLATE: TemplateStop[] = RAW_TEMPLATE.map((t, i) => ({
  id: "tpl" + i,
  phase: t.phase,
  name: t.name,
  dept: t.dept,
  esm: t.esm,
  crit: !!t.crit,
  note: t.note || "",
  involved: t.involved,
  sys: t.sys.slice(),
  tasks: t.tasks.map(([label, owner]) => ({ label, owner })),
}));

export type SeedHarvester = {
  id: string;
  name: string;
  age: number;
  role: string;
  client: string;
  start: string;
  recruiter: string;
  reached: number;
  partial: number;
};

export const HARVESTERS: SeedHarvester[] = [
  { id: "iris", name: "Iris Jansen", age: 24, role: "Business Systems Analyst", client: "ABN AMRO", start: "1 sep 2025", recruiter: "Wessal Wafa", reached: 19, partial: 2 },
  { id: "roman", name: "Roman Vasiliev", age: 26, role: "Data Engineer", client: "Chipsoft", start: "1 jan 2026", recruiter: "Bastijn de Groot", reached: 15, partial: 1 },
  { id: "kaylee", name: "Kaylee de Groot", age: 25, role: "MLE Engineer", client: "Handelsbanken", start: "1 apr 2026", recruiter: "Wessal Wafa", reached: 8, partial: 2 },
  { id: "sofia", name: "Sofia Bakker", age: 23, role: "Junior Data Analyst", client: "Nog te matchen", start: "—", recruiter: "Bastijn de Groot", reached: -1, partial: 0 },
];
