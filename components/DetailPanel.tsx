"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { initials, statusClassName, stopStatus } from "@/lib/logic";
import type { Harvester, Stop, StopTask } from "@/lib/types";

const WELCOME_EMAIL_TASK_LABEL = "versturen welkom-mail";

function isWelcomeEmailTask(t: StopTask): boolean {
  return t.label.trim().toLowerCase() === WELCOME_EMAIL_TASK_LABEL;
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

  const handleTaskClick = (t: StopTask) => {
    if (!canEdit) return;
    if (isWelcomeEmailTask(t) && !t.done) {
      setWelcomeDraft({ taskId: t.id, email: harvester.email || "", name: harvester.name });
      setWelcomeMsg(null);
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
