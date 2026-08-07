"use client";

import { useApp } from "@/lib/store";
import { ESM_LEAD } from "@/lib/constants";

export function BeheerView() {
  const { state, actions, canEdit } = useApp();
  const sysMap = new Map(state.systems.map((s) => [s.key, s]));

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
          {state.template.map((t, i) => (
            <div key={t.id} className="hv-tpl-row">
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
          ))}
        </div>
      </div>
    </section>
  );
}
