"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { currentStopOf, statusClassName, stopStatus } from "@/lib/logic";
import { DetailPanel } from "./DetailPanel";
import type { Stop } from "@/lib/types";

function SkeletonBlock() {
  return (
    <div style={{ maxWidth: "620px" }}>
      <div className="hv-skel" style={{ height: "34px", width: "320px", marginBottom: "14px" }} />
      <div className="hv-skel" style={{ height: "14px", width: "220px", marginBottom: "34px" }} />
      <div className="hv-skel" style={{ height: "86px", width: "100%", marginBottom: "14px" }} />
      <div className="hv-skel" style={{ height: "86px", width: "100%", marginBottom: "14px" }} />
      <div className="hv-skel" style={{ height: "86px", width: "100%", marginBottom: "14px" }} />
    </div>
  );
}

export function ReisView() {
  const { state, actions, canEdit, isAdmin } = useApp();
  const h = state.data.find((x) => x.id === state.hid) || state.data[0];
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const togglePhase = (phase: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const phaseGroups = useMemo(() => {
    if (!h) return [];
    const groups: { phase: string; stops: Stop[] }[] = [];
    h.stops.forEach((s) => {
      const last = groups[groups.length - 1];
      if (last && last.phase === s.phase) last.stops.push(s);
      else groups.push({ phase: s.phase, stops: [s] });
    });
    return groups;
  }, [h]);

  if (!h) return null;
  const status = h.status || "active";

  const currentStop = currentStopOf(h.stops);
  const active: Stop | null = state.sid ? h.stops.find((s) => s.id === state.sid) || currentStop : currentStop;

  const totalTasks = h.stops.reduce((a, s) => a + s.tasks.length, 0);
  const doneTasks = h.stops.reduce((a, s) => a + s.tasks.filter((t) => t.done).length, 0);
  const idx = currentStop ? h.stops.indexOf(currentStop) : 0;
  const sysMap = new Map(state.systems.map((s) => [s.key, s]));

  const handleDelete = () => {
    if (!window.confirm(`Weet je zeker dat je ${h.name} permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    actions.deleteHarvesterPermanently(h.id);
  };

  return (
    <div className="hv-reis">
      <div className="hv-reis__scroll">
        {state.loading ? (
          <SkeletonBlock />
        ) : h.stops.length === 0 ? (
          <div className="hv-empty hv-fade-in">
            <div className="hv-empty__icon">▽</div>
            <h2 style={{ fontSize: "26px", marginBottom: "8px" }}>Nog geen reis gestart</h2>
            <p style={{ color: "var(--hv-fg-muted)", marginBottom: "20px" }}>
              {h.name} is aangenomen maar heeft nog geen reis.
              {canEdit
                ? ` Start de standaardroute om alle ${state.template.length} haltes klaar te zetten.`
                : " Een bewerker kan de standaardroute starten."}
            </p>
            {canEdit && (
              <button className="hv-btn" style={{ whiteSpace: "nowrap" }} onClick={actions.startJourney}>
                Reis starten vanaf standaardroute
              </button>
            )}
          </div>
        ) : (
          <div className="hv-fade-in">
            <div className="hv-route-head">
              <div style={{ minWidth: 0 }}>
                <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
                  Reis van de harvester
                </p>
                <h1 className="hv-display" style={{ fontSize: "38px", textWrap: "balance" }}>
                  {h.name}{" "}
                  {h.age && h.age !== "—" && <span className="hv-accent-num" style={{ fontSize: "30px" }}>({h.age})</span>}
                </h1>
                <p className="hv-meta" style={{ margin: "6px 0 0" }}>
                  {h.role} · {h.client} · in dienst sinds {h.start}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {canEdit && status === "active" && (
                  <button className="hv-btn hv-btn--ghost" style={{ whiteSpace: "nowrap" }} onClick={actions.openAddStop}>
                    + Halte toevoegen
                  </button>
                )}
                {canEdit && status === "active" && (
                  <button className="hv-btn hv-btn--ghost" style={{ whiteSpace: "nowrap" }} onClick={() => actions.completeJourney(h.id)}>
                    Reis voltooien
                  </button>
                )}
                {canEdit && status === "active" && (
                  <button className="hv-btn hv-btn--ghost" style={{ whiteSpace: "nowrap" }} onClick={() => actions.abortJourney(h.id)}>
                    Reis afbreken
                  </button>
                )}
                {canEdit && status !== "active" && (
                  <button className="hv-btn hv-btn--ghost" style={{ whiteSpace: "nowrap" }} onClick={() => actions.reactivateJourney(h.id)}>
                    Terug naar actief
                  </button>
                )}
                {isAdmin && (
                  <button className="hv-btn hv-btn--ghost" style={{ whiteSpace: "nowrap", color: "var(--hv-danger)", borderColor: "var(--hv-danger)" }} onClick={handleDelete}>
                    Harvester verwijderen
                  </button>
                )}
              </div>
            </div>

            {status !== "active" && (
              <div className="hv-progress-bar-wrap" style={{ background: "var(--hv-cream-200)" }}>
                <span className="hv-label">
                  {status === "completed" ? "Reis afgerond" : "Reis afgebroken"} · in archief
                </span>
              </div>
            )}

            <div className="hv-progress-bar-wrap">
              <span className="hv-label" style={{ whiteSpace: "nowrap" }}>
                Halte {idx + 1} van {h.stops.length}
              </span>
              <span className="hv-progress-track">
                <span
                  className="hv-progress-fill"
                  style={{ width: (totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0) + "%" }}
                />
              </span>
              <span style={{ fontSize: "11px", color: "var(--hv-fg-muted)", whiteSpace: "nowrap" }}>
                {doneTasks} van {totalTasks} acties afgevinkt
              </span>
            </div>

            <div className="hv-timeline">
              <span className="hv-timeline__rail" />
              <div className="hv-timeline__list">
                {(() => {
                  let globalIndex = 0;
                  return phaseGroups.map((group) => {
                    const isCollapsed = collapsedPhases.has(group.phase);
                    const startIndex = globalIndex;
                    globalIndex += group.stops.length;
                    return (
                      <div key={group.phase + startIndex}>
                        <button className="hv-phase-toggle" onClick={() => togglePhase(group.phase)}>
                          <span className={`hv-phase-toggle__chevron${isCollapsed ? " is-collapsed" : ""}`}>▾</span>
                          <span className="hv-label hv-stop__phase" style={{ margin: 0 }}>
                            {group.phase}
                          </span>
                          <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}>{group.stops.length} haltes</span>
                        </button>
                        {!isCollapsed &&
                          group.stops.map((s, gi) => {
                            const i = startIndex + gi;
                            const stStatus = stopStatus(s);
                            const isCur = currentStop && s.id === currentStop.id;
                            const sel = active && s.id === active.id;
                            return (
                              <div key={s.id} className="hv-stop">
                                <div className="hv-stop__row">
                                  <span
                                    className={
                                      "hv-stop__marker" + (stStatus === "Afgerond" ? " is-done" : isCur ? " is-current" : "")
                                    }
                                  >
                                    {stStatus === "Afgerond" ? "✓" : isCur ? "●" : ""}
                                  </span>
                                  <button
                                    className={"hv-stop__card" + (sel ? " is-selected" : "") + (s.crit ? " is-crit" : "")}
                                    onClick={() => actions.openStop(s.id)}
                                  >
                                    <span className="hv-stop__top-row">
                                      <span className="hv-label hv-stop__num">Halte {String(i + 1).padStart(2, "0")}</span>
                                      {(s.custom || s.crit) && (
                                        <span className="hv-chip--highlight">{s.custom ? "Individueel" : "Evaluatiemoment"}</span>
                                      )}
                                    </span>
                                    <span className="hv-stop__name">{s.name}</span>
                                    <span className="hv-stop__meta-row">
                                      <span className={statusClassName(stStatus)}>{stStatus}</span>
                                      <span className="hv-chip hv-chip--soft">{s.dept}</span>
                                      <span style={{ fontSize: "11px", color: "var(--hv-fg-muted)" }}>{s.eind} (eindverantwoordelijk)</span>
                                      <span style={{ fontSize: "11px", color: "var(--hv-fg-muted)" }}>
                                        · {s.tasks.filter((t) => t.done).length}/{s.tasks.length} acties
                                      </span>
                                    </span>
                                    <span className="hv-stop__systems">
                                      {s.sys.map((k) => {
                                        const sy = sysMap.get(k) || { key: k, name: k, mono: k.slice(0, 1).toUpperCase() };
                                        return (
                                          <span key={k} className="hv-sys-pill">
                                            <span className="hv-sys-pill__mono">{sy.mono}</span>
                                            {sy.name}
                                          </span>
                                        );
                                      })}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {!state.loading && h.stops.length > 0 && active && <DetailPanel harvester={h} stop={active} />}
    </div>
  );
}
