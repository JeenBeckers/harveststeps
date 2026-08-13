"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { ESM_LEAD } from "@/lib/constants";
import type { TemplateStop } from "@/lib/types";

const HOOFDFASE_SIZES: { name: string; count: number }[] = [
  { name: "Recruitment", count: 2 },
  { name: "Matching", count: 3 },
  { name: "Indiensttreding", count: 1 },
  { name: "Harvest Jaar", count: Infinity },
];

export function BeheerView() {
  const { state, actions, canEdit } = useApp();
  const sysMap = new Map(state.systems.map((s) => [s.key, s]));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [collapsedHoofdfases, setCollapsedHoofdfases] = useState<Set<string>>(new Set());
  const toggleHoofdfase = (name: string) => {
    setCollapsedHoofdfases((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const hoofdfaseGroups = useMemo(() => {
    const groups: { name: string; items: TemplateStop[]; startIndex: number }[] = [];
    let idx = 0;
    for (const hf of HOOFDFASE_SIZES) {
      const count = hf.count === Infinity ? state.template.length - idx : hf.count;
      const items = state.template.slice(idx, idx + count);
      groups.push({ name: hf.name, items, startIndex: idx });
      idx += items.length;
    }
    return groups;
  }, [state.template]);

  return (
    <section className="hv-dash">
      <div className="hv-content-narrow hv-fade-in">
        <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Beheer
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "10px" }}>
          <h1 className="hv-display" style={{ fontSize: "36px" }}>
            Standaardroute
          </h1>
          {canEdit && (
            <button className="hv-btn" style={{ whiteSpace: "nowrap" }} onClick={actions.openAddTemplateStop}>
              + Halte toevoegen aan route
            </button>
          )}
        </div>
        <p style={{ color: "var(--hv-fg-muted)", maxWidth: "560px", marginBottom: "30px" }}>
          Deze route wordt automatisch toegepast op elke nieuwe harvester. Wijzigingen gelden voor nieuwe reizen; lopende reizen
          behouden hun eigen haltes.
        </p>

        <div className="hv-tpl-rows">
          {hoofdfaseGroups.map((group) => {
            if (group.items.length === 0) return null;
            const isCollapsed = collapsedHoofdfases.has(group.name);
            return (
              <div key={group.name}>
                <button className="hv-phase-toggle" onClick={() => toggleHoofdfase(group.name)}>
                  <span className={`hv-phase-toggle__chevron${isCollapsed ? " is-collapsed" : ""}`}>▾</span>
                  <span className="hv-label hv-stop__phase" style={{ margin: 0 }}>
                    {group.name}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)" }}>{group.items.length} haltes</span>
                </button>
                {!isCollapsed &&
                  group.items.map((t, gi) => {
                    const i = group.startIndex + gi;
                    return (
                      <div
                        key={t.id}
                        className={
                          "hv-tpl-row" +
                          (canEdit ? " is-draggable" : "") +
                          (draggingId === t.id ? " is-dragging" : "") +
                          (overId === t.id && draggingId && draggingId !== t.id ? " is-drop-target" : "")
                        }
                        draggable={canEdit}
                        onDragStart={(e) => {
                          setDraggingId(t.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", t.id);
                        }}
                        onDragOver={(e) => {
                          if (!canEdit) return;
                          e.preventDefault();
                          if (overId !== t.id) setOverId(t.id);
                        }}
                        onDragLeave={() => {
                          if (overId === t.id) setOverId(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromId = e.dataTransfer.getData("text/plain") || draggingId;
                          if (fromId && fromId !== t.id) actions.reorderTemplate(fromId, t.id);
                          setDraggingId(null);
                          setOverId(null);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setOverId(null);
                        }}
                      >
                        <span className="hv-tpl-row__num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="hv-tpl-row__namecol">
                          <span style={{ fontSize: "14px" }}>{t.name}</span>
                          <span style={{ fontSize: "10.5px", color: "var(--hv-fg-muted)" }}>
                            {t.crit ? "Evaluatiemoment · " : ""}
                            {t.phase} · {t.tasks.length} acties · eindverantwoordelijk {t.esm ? ESM_LEAD + " (ESM)" : "de recruiter"}
                          </span>
                        </span>
                        <span className="hv-chip hv-chip--soft" style={{ justifySelf: "start", whiteSpace: "nowrap" }}>
                          {t.dept}
                        </span>
                        <span className="hv-tpl-row__systems">
                          {t.sys.map((k) => {
                            const sy = sysMap.get(k) || { key: k, name: k, mono: k.slice(0, 1).toUpperCase() };
                            return (
                              <span key={k} className="hv-system-tag" title={sy.name}>
                                {sy.mono}
                              </span>
                            );
                          })}
                        </span>
                        {canEdit ? (
                          <>
                            <button className="hv-btn hv-btn--ghost hv-btn--sm" onClick={() => actions.openEditTemplate(t.id)}>
                              Bewerken
                            </button>
                            <button className="hv-icon-btn" onClick={() => actions.removeTemplateStop(t.id)}>
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <span />
                            <span />
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
