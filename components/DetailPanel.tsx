"use client";

import { useApp } from "@/lib/store";
import { initials, statusClassName, stopStatus } from "@/lib/logic";
import type { Harvester, Stop } from "@/lib/types";

export function DetailPanel({ harvester, stop }: { harvester: Harvester; stop: Stop }) {
  const { state, actions, canEdit } = useApp();
  const status = stopStatus(stop);
  const idx = harvester.stops.indexOf(stop);
  const doneCount = stop.tasks.filter((t) => t.done).length;
  const sysMap = new Map(state.systems.map((s) => [s.key, s]));

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
            <button
              key={t.id}
              className="hv-task-row"
              style={canEdit ? undefined : { cursor: "default" }}
              onClick={canEdit ? () => actions.toggleTask(harvester.id, stop.id, t.id) : undefined}
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
                </span>
              </span>
            </button>
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
