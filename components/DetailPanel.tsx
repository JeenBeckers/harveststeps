"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { initials, statusClassName, stopStatus } from "@/lib/logic";
import type { Harvester, Stop, StopTask } from "@/lib/types";

const WELCOME_EMAIL_TASK_LABEL = "versturen welkom-mail";
const COACH_INTRO_TASK_LABEL = "kennismaking met soft skill coach inplannen";
const ONBOARDING_CONFIRMATION_TASK_LABEL = "versturen bevestiging onboarding";

function isWelcomeEmailTask(t: StopTask): boolean {
  return t.label.trim().toLowerCase().startsWith(WELCOME_EMAIL_TASK_LABEL);
}

function isCoachIntroTask(t: StopTask): boolean {
  return t.label.trim().toLowerCase().startsWith(COACH_INTRO_TASK_LABEL);
}

function isOnboardingConfirmationTask(t: StopTask): boolean {
  return t.label.trim().toLowerCase().startsWith(ONBOARDING_CONFIRMATION_TASK_LABEL);
}

export function DetailPanel({ harvester, stop }: { harvester: Harvester; stop: Stop }) {
  const { state, actions, canEdit } = useApp();
  const status = stopStatus(stop);
  const idx = harvester.stops.indexOf(stop);
  const doneCount = stop.tasks.filter((t) => t.done).length;
  const sysMap = new Map(state.systems.map((s) => [s.key, s]));

  const [welcomeDraft, setWelcomeDraft] = useState<{ taskId: string; email: string; name: string } | null>(null);
  const [welcomeBusy, setWelcomeBusy] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState<string | null>(null);

  const [coachDraft, setCoachDraft] = useState<{ taskId: string; candidateEmail: string; coachName: string; coachEmail: string } | null>(null);
  const [coachBusy, setCoachBusy] = useState(false);
  const [coachMsg, setCoachMsg] = useState<string | null>(null);

  const [confirmDraft, setConfirmDraft] = useState<{ taskId: string; contactName: string; contactEmail: string; organizationName: string } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const handleTaskClick = (t: StopTask) => {
    if (!canEdit) return;
    if (isWelcomeEmailTask(t) && !t.done) {
      setWelcomeDraft({ taskId: t.id, email: harvester.email || "", name: harvester.name });
      setWelcomeMsg(null);
      return;
    }
    if (isCoachIntroTask(t) && !t.done) {
      setCoachDraft({ taskId: t.id, candidateEmail: harvester.email || "", coachName: "Otman", coachEmail: "" });
      setCoachMsg(null);
      return;
    }
    if (isOnboardingConfirmationTask(t) && !t.done) {
      setConfirmDraft({ taskId: t.id, contactName: "", contactEmail: "", organizationName: harvester.client || "" });
      setConfirmMsg(null);
      return;
    }
    actions.toggleTask(harvester.id, stop.id, t.id);
  };

  const submitWelcomeEmail = async () => {
    if (!welcomeDraft) return;
    const email = welcomeDraft.email.trim();
    const name = welcomeDraft.name.trim();
    if (!email || !name) {
      setWelcomeMsg("Vul naam en e-mailadres in.");
      return;
    }
    setWelcomeBusy(true);
    setWelcomeMsg(null);
    try {
      const res = await fetch("/api/apollo/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ harvesterId: harvester.id, name, email }),
      });
      const resBody = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resBody.error || "Onbekende fout.");
      if (email !== (harvester.email || "")) actions.setHarvesterEmail(harvester.id, email);
      actions.markWelcomeEmailSent(harvester.id);
      actions.toggleTask(harvester.id, stop.id, welcomeDraft.taskId);
      setWelcomeDraft(null);
    } catch (e) {
      setWelcomeMsg(e instanceof Error ? e.message : "Kon niet klaarzetten in Apollo.");
    } finally {
      setWelcomeBusy(false);
    }
  };

  const submitCoachIntro = async () => {
    if (!coachDraft) return;
    const candidateEmail = coachDraft.candidateEmail.trim();
    const coachName = coachDraft.coachName.trim();
    const coachEmail = coachDraft.coachEmail.trim();
    if (!candidateEmail || !coachName || !coachEmail) {
      setCoachMsg("Vul e-mail kandidaat, naam coach en e-mail coach in.");
      return;
    }
    setCoachBusy(true);
    setCoachMsg(null);
    try {
      const res = await fetch("/api/apollo/coach-intro-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ harvesterId: harvester.id, candidateName: harvester.name, candidateEmail, coachName, coachEmail }),
      });
      const resBody = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resBody.error || "Onbekende fout.");
      if (candidateEmail !== (harvester.email || "")) actions.setHarvesterEmail(harvester.id, candidateEmail);
      actions.toggleTask(harvester.id, stop.id, coachDraft.taskId);
      setCoachDraft(null);
    } catch (e) {
      setCoachMsg(e instanceof Error ? e.message : "Kon de mail niet versturen via Apollo.");
    } finally {
      setCoachBusy(false);
    }
  };

  const submitOnboardingConfirmation = async () => {
    if (!confirmDraft) return;
    const contactName = confirmDraft.contactName.trim();
    const contactEmail = confirmDraft.contactEmail.trim();
    const organizationName = confirmDraft.organizationName.trim();
    if (!contactName || !contactEmail) {
      setConfirmMsg("Vul naam en e-mailadres van de contactpersoon in.");
      return;
    }
    setConfirmBusy(true);
    setConfirmMsg(null);
    try {
      const res = await fetch("/api/apollo/onboarding-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ harvesterId: harvester.id, contactName, contactEmail, organizationName }),
      });
      const resBody = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resBody.error || "Onbekende fout.");
      actions.toggleTask(harvester.id, stop.id, confirmDraft.taskId);
      setConfirmDraft(null);
    } catch (e) {
      setConfirmMsg(e instanceof Error ? e.message : "Kon niet klaarzetten in Apollo.");
    } finally {
      setConfirmBusy(false);
    }
  };

  return (
    <aside className="hv-detail">
      <div className="hv-detail__inner">
        <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 10px" }}>
          Halte {String(idx + 1).padStart(2, "0")} · {stop.phase}
        </p>
        <h2 style={{ fontSize: "27px", marginBottom: "10px" }}>{stop.name}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span className={statusClassName(status)}>{status}</span>
          {canEdit && (
            <button
              className="hv-btn hv-btn--ghost hv-btn--sm"
              onClick={() => actions.openEditStop(stop.id)}
            >
              Halte bewerken
            </button>
          )}
        </div>

        <hr className="hv-divider" style={{ margin: "22px 0" }} />

        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Verantwoordelijke afdeling
        </p>
        <span className="hv-chip" style={{ marginBottom: "20px" }}>
          {stop.dept}
        </span>

        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "18px 0 8px" }}>
          Eindverantwoordelijke
        </p>
        <div className="hv-person-row" style={{ marginBottom: "20px" }}>
          <span className="hv-person-avatar hv-person-avatar--main">{initials(stop.eind)}</span>
          <span style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px" }}>{stop.eind}</span>
            <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}>
              {stop.esm ? "Employee Success Manager" : "Recruitment"}
            </span>
          </span>
        </div>

        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Begeleider
        </p>
        <div className="hv-person-row" style={{ marginBottom: "20px" }}>
          <span className="hv-person-avatar hv-person-avatar--soft">{initials(stop.guide)}</span>
          <span style={{ fontSize: "13px" }}>{stop.guide}</span>
        </div>

        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Betrokkenen
        </p>
        <div className="hv-detail__chip-row" style={{ marginBottom: "22px" }}>
          {stop.involved.map((p, i) => (
            <span key={p + i} className="hv-chip hv-chip--soft">
              {p}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "10px" }}>
          <p className="hv-label" style={{ margin: 0 }}>
            Acties · kwaliteitscontrole
          </p>
          <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}>
            {doneCount}/{stop.tasks.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "24px" }}>
          {stop.tasks.map((t) => (
            <div key={t.id}>
              <button
                className="hv-task-row"
                style={canEdit ? undefined : { cursor: "default" }}
                onClick={canEdit ? () => handleTaskClick(t) : undefined}
              >
                <span className={`hv-checkbox${t.done ? " is-checked" : ""}`}>{t.done ? "✓" : ""}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.4,
                      color: t.done ? "var(--hv-fg-muted)" : "var(--hv-fg)",
                      textDecoration: t.done ? "line-through" : "none",
                    }}
                  >
                    {t.label}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {t.owner}
                    {isWelcomeEmailTask(t) && t.done && harvester.apolloWelcomeSentAt && (
                      <> · klaargezet in Apollo op {new Date(harvester.apolloWelcomeSentAt).toLocaleString("nl-NL")}</>
                    )}
                  </span>
                </span>
              </button>
              {welcomeDraft && welcomeDraft.taskId === t.id && (
                <div style={{ margin: "6px 0 10px 34px", padding: "12px", borderRadius: "8px", background: "var(--hv-cream-200)" }}>
                  <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
                    Welkomstmail klaarzetten in Apollo
                  </p>
                  <input
                    className="hv-input"
                    style={{ marginBottom: "6px" }}
                    value={welcomeDraft.name}
                    onChange={(e) => setWelcomeDraft({ ...welcomeDraft, name: e.target.value })}
                    placeholder="Voor- en achternaam"
                  />
                  <input
                    className="hv-input"
                    style={{ marginBottom: "8px" }}
                    value={welcomeDraft.email}
                    onChange={(e) => setWelcomeDraft({ ...welcomeDraft, email: e.target.value })}
                    placeholder="voornaam.achternaam@harvest.nl"
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="hv-btn hv-btn--sm" disabled={welcomeBusy} onClick={submitWelcomeEmail}>
                      {welcomeBusy ? "Bezig…" : "Versturen & afvinken"}
                    </button>
                    <button
                      className="hv-btn hv-btn--ghost hv-btn--sm"
                      disabled={welcomeBusy}
                      onClick={() => {
                        setWelcomeDraft(null);
                        setWelcomeMsg(null);
                      }}
                    >
                      Annuleren
                    </button>
                  </div>
                  {welcomeMsg && (
                    <p style={{ fontSize: "11px", margin: "8px 0 0", color: "var(--hv-danger)" }}>{welcomeMsg}</p>
                  )}
                </div>
              )}
              {coachDraft && coachDraft.taskId === t.id && (
                <div style={{ margin: "6px 0 10px 34px", padding: "12px", borderRadius: "8px", background: "var(--hv-cream-200)" }}>
                  <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
                    Intake-mail naar kandidaat (aan) + coach (cc) — wordt als concept klaargezet in Apollo, jij controleert en verstuurt hem daar
                  </p>
                  <input
                    className="hv-input"
                    style={{ marginBottom: "6px" }}
                    value={coachDraft.candidateEmail}
                    onChange={(e) => setCoachDraft({ ...coachDraft, candidateEmail: e.target.value })}
                    placeholder="E-mailadres kandidaat"
                  />
                  <input
                    className="hv-input"
                    style={{ marginBottom: "6px" }}
                    value={coachDraft.coachName}
                    onChange={(e) => setCoachDraft({ ...coachDraft, coachName: e.target.value })}
                    placeholder="Naam coach"
                  />
                  <input
                    className="hv-input"
                    style={{ marginBottom: "8px" }}
                    value={coachDraft.coachEmail}
                    onChange={(e) => setCoachDraft({ ...coachDraft, coachEmail: e.target.value })}
                    placeholder="E-mailadres coach"
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="hv-btn hv-btn--sm" disabled={coachBusy} onClick={submitCoachIntro}>
                      {coachBusy ? "Bezig…" : "Klaarzetten als concept & afvinken"}
                    </button>
                    <button
                      className="hv-btn hv-btn--ghost hv-btn--sm"
                      disabled={coachBusy}
                      onClick={() => {
                        setCoachDraft(null);
                        setCoachMsg(null);
                      }}
                    >
                      Annuleren
                    </button>
                  </div>
                  {coachMsg && <p style={{ fontSize: "11px", margin: "8px 0 0", color: "var(--hv-danger)" }}>{coachMsg}</p>}
                </div>
              )}
              {confirmDraft && confirmDraft.taskId === t.id && (
                <div style={{ margin: "6px 0 10px 34px", padding: "12px", borderRadius: "8px", background: "var(--hv-cream-200)" }}>
                  <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
                    Bevestiging onboarding klaarzetten in Apollo — naar de contactpersoon bij de klant
                  </p>
                  <input
                    className="hv-input"
                    style={{ marginBottom: "6px" }}
                    value={confirmDraft.contactName}
                    onChange={(e) => setConfirmDraft({ ...confirmDraft, contactName: e.target.value })}
                    placeholder="Naam contactpersoon bij de klant"
                  />
                  <input
                    className="hv-input"
                    style={{ marginBottom: "6px" }}
                    value={confirmDraft.contactEmail}
                    onChange={(e) => setConfirmDraft({ ...confirmDraft, contactEmail: e.target.value })}
                    placeholder="E-mailadres contactpersoon"
                  />
                  <input
                    className="hv-input"
                    style={{ marginBottom: "8px" }}
                    value={confirmDraft.organizationName}
                    onChange={(e) => setConfirmDraft({ ...confirmDraft, organizationName: e.target.value })}
                    placeholder="Naam organisatie (klant)"
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="hv-btn hv-btn--sm" disabled={confirmBusy} onClick={submitOnboardingConfirmation}>
                      {confirmBusy ? "Bezig…" : "Klaarzetten in Apollo & afvinken"}
                    </button>
                    <button
                      className="hv-btn hv-btn--ghost hv-btn--sm"
                      disabled={confirmBusy}
                      onClick={() => {
                        setConfirmDraft(null);
                        setConfirmMsg(null);
                      }}
                    >
                      Annuleren
                    </button>
                  </div>
                  {confirmMsg && <p style={{ fontSize: "11px", margin: "8px 0 0", color: "var(--hv-danger)" }}>{confirmMsg}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          IT-systemen
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {stop.sys.map((k) => {
            const sy = sysMap.get(k) || { key: k, name: k, mono: k.slice(0, 1).toUpperCase() };
            return (
              <span
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px 4px 4px",
                  borderRadius: "4px",
                  background: "var(--hv-cream-200)",
                  fontSize: "11px",
                }}
              >
                <span className="hv-sys-tag-lg">{sy.mono}</span>
                {sy.name}
              </span>
            );
          })}
        </div>

        <hr className="hv-divider" style={{ margin: "24px 0 16px" }} />
        <p style={{ fontSize: "11px", color: "var(--hv-fg-subtle)", lineHeight: 1.5, margin: 0 }}>
          {stop.note || "De halte krijgt automatisch de status Afgerond zodra alle acties zijn afgevinkt."}
        </p>
      </div>
    </aside>
  );
}
