"use client";

import { useApp } from "@/lib/store";
import { allMembers, currentStopOf, initials, statusClassName, stopStatus } from "@/lib/logic";
import { STATUSES } from "@/lib/constants";
import type { Harvester, Stop } from "@/lib/types";

type Row = { h: Harvester; cur: Stop | null; tot: number; dn: number; status: string };

export function DashboardView() {
  const { state, actions, canEdit } = useApp();
  const members = allMembers(state.depts);

  const withMeta: Row[] = state.data.map((h) => {
    const cur = currentStopOf(h.stops);
    const tot = h.stops.reduce((a, s) => a + s.tasks.length, 0);
    const dn = h.stops.reduce((a, s) => a + s.tasks.filter((t) => t.done).length, 0);
    return { h, cur, tot, dn, status: cur ? stopStatus(cur) : "Niet gestart" };
  });

  const matchOwner = (r: Row) =>
    state.fOwner === "Alle" ||
    (r.cur && (r.cur.eind === state.fOwner || r.cur.guide === state.fOwner || r.cur.tasks.some((t) => t.owner === state.fOwner)));

  const filtered = withMeta.filter((r) => (state.fStatus === "Alle" || r.status === state.fStatus) && matchOwner(r));

  const kpis = [
    { label: "Actieve reizen", value: String(withMeta.filter((r) => r.cur).length), sub: "van " + state.data.length + " harvesters" },
    { label: "Openstaande acties", value: String(withMeta.reduce((a, r) => a + (r.tot - r.dn), 0)), sub: "over alle reizen" },
    {
      label: "Afgeronde haltes",
      value: String(state.data.reduce((a, x) => a + x.stops.filter((s) => stopStatus(s) === "Afgerond").length, 0)),
      sub: "kwaliteitscontrole akkoord",
    },
    {
      label: "Individuele haltes",
      value: String(state.data.reduce((a, x) => a + x.stops.filter((s) => s.custom).length, 0)),
      sub: "buiten de standaardroute",
    },
  ];

  const opens: { key: string; label: string; meta: string; onToggle: () => void }[] = [];
  filtered.forEach((r) =>
    r.h.stops.forEach((s, si) =>
      s.tasks.forEach((t) => {
        if (!t.done && (state.fOwner === "Alle" || t.owner === state.fOwner)) {
          opens.push({
            key: r.h.id + s.id + t.id,
            label: t.label,
            meta: r.h.name.split(" ")[0] + " · halte " + (si + 1) + " · " + t.owner,
            onToggle: () => actions.toggleTask(r.h.id, s.id, t.id),
          });
        }
      })
    )
  );
  const openTasks = opens.slice(0, 9);

  return (
    <section className="hv-dash">
      <div className="hv-dash__wrap hv-fade-in">
        <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Kwaliteitscontrole
        </p>
        <div className="hv-view-head">
          <h1 className="hv-display" style={{ fontSize: "36px" }}>
            Alle reizen in beeld
          </h1>
          {canEdit && (
            <button className="hv-btn" style={{ whiteSpace: "nowrap" }} onClick={actions.openAddHarvester}>
              + Harvester toevoegen
            </button>
          )}
        </div>

        <div className="hv-kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className="hv-kpi-card">
              <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 10px" }}>
                {k.label}
              </p>
              <p className="hv-kpi-card__value">{k.value}</p>
              <p style={{ fontSize: "10.5px", color: "var(--hv-fg-subtle)", margin: "8px 0 0" }}>{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="hv-filter-bar">
          <span className="hv-label" style={{ color: "var(--hv-fg-muted)" }}>
            Status
          </span>
          <div className="hv-filter-group">
            {STATUSES.map((f) => (
              <button
                key={f}
                className={`hv-filter${state.fStatus === f ? " is-active" : ""}`}
                onClick={() => actions.setFStatus(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="hv-label" style={{ color: "var(--hv-fg-muted)", marginLeft: "12px" }}>
            Verantwoordelijke
          </span>
          <div className="hv-filter-group">
            {["Alle", ...members].map((f) => (
              <button
                key={f}
                className={`hv-filter${state.fOwner === f ? " is-active" : ""}`}
                onClick={() => actions.setFOwner(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="hv-dash-grid">
          <div>
            <div className="hv-table-head">
              <span className="hv-label" style={{ color: "var(--hv-fg-subtle)" }}>
                Harvester
              </span>
              <span className="hv-label" style={{ color: "var(--hv-fg-subtle)" }}>
                Huidige halte
              </span>
              <span className="hv-label" style={{ color: "var(--hv-fg-subtle)" }}>
                Voortgang
              </span>
              <span className="hv-label" style={{ color: "var(--hv-fg-subtle)" }}>
                Acties
              </span>
            </div>
            <div className="hv-table-rows">
              {filtered.map((r) => (
                <button key={r.h.id} className="hv-table-row" onClick={() => actions.pickHarvester(r.h.id)}>
                  <span className="hv-table-row__who">
                    <span className="hv-table-row__avatar">{initials(r.h.name)}</span>
                    <span className="hv-table-row__namecol">
                      <span style={{ fontSize: "14px", lineHeight: 1.2 }}>{r.h.name}</span>
                      <span style={{ fontSize: "10.5px", color: "var(--hv-fg-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.h.role} · {r.h.client}
                      </span>
                    </span>
                  </span>
                  <span className="hv-table-row__stopcol">
                    <span style={{ fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.cur ? "Halte " + (r.h.stops.indexOf(r.cur) + 1) + " — " + r.cur.name : "Nog geen reis gestart"}
                    </span>
                    <span className={statusClassName(r.status)}>{r.status}</span>
                  </span>
                  <span className="hv-table-row__progresscol">
                    <span className="hv-mini-track">
                      <span className="hv-progress-fill" style={{ width: (r.tot ? Math.round((r.dn / r.tot) * 100) : 0) + "%" }} />
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--hv-fg-muted)" }}>
                      {r.cur ? r.h.stops.indexOf(r.cur) + 1 + " / " + r.h.stops.length + " haltes · " + r.cur.eind : "—"}
                    </span>
                  </span>
                  <span className="hv-table-row__actionscol">
                    <span style={{ fontSize: "13px" }}>{r.tot - r.dn} open</span>
                    <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}>{r.dn} afgevinkt</span>
                  </span>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="hv-empty-panel">
                <p style={{ fontFamily: "var(--hv-font-serif)", fontSize: "22px", margin: "0 0 6px" }}>Geen harvesters gevonden</p>
                <p style={{ fontSize: "12px", color: "var(--hv-fg-muted)", margin: "0 0 16px" }}>
                  Geen enkele reis voldoet aan deze combinatie van filters.
                </p>
                <button className="hv-btn hv-btn--ghost" style={{ whiteSpace: "nowrap" }} onClick={actions.resetFilters}>
                  Filters wissen
                </button>
              </div>
            )}
          </div>

          <div className="hv-side-panel">
            <div className="hv-side-panel__head">
              <p className="hv-label" style={{ margin: 0 }}>
                Openstaande acties
              </p>
              <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}>{opens.length} totaal</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {openTasks.map((t) => (
                <button
                  key={t.key}
                  className="hv-task-row"
                  style={canEdit ? undefined : { cursor: "default" }}
                  onClick={canEdit ? t.onToggle : undefined}
                >
                  <span className="hv-checkbox" />
                  <span style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--hv-fg)" }}>{t.label}</span>
                    <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t.meta}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {opens.length === 0 && (
              <p style={{ fontSize: "12px", color: "var(--hv-fg-muted)", fontStyle: "italic", margin: "8px 0 0" }}>
                Alles afgevinkt voor deze selectie.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
