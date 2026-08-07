"use client";

import { useApp } from "@/lib/store";

export function OrganisatieView() {
  const { state, actions, deptDrafts } = useApp();

  return (
    <section className="hv-dash">
      <div className="hv-content-wide hv-fade-in">
        <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
          Beheer
        </p>
        <h1 className="hv-display" style={{ fontSize: "36px", marginBottom: "10px" }}>
          Afdelingen, medewerkers en systemen
        </h1>
        <p style={{ color: "var(--hv-fg-muted)", maxWidth: "560px", marginBottom: "30px" }}>
          Wat je hier vastlegt, verschijnt als keuze bij het bewerken van een halte: de verantwoordelijke afdeling, de begeleider, de
          eigenaar per actie en de gekoppelde IT-systemen.
        </p>

        <div className="hv-org-grid">
          <div>
            <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 14px" }}>
              Afdelingen en medewerkers
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {state.depts.map((d) => (
                <div key={d.id} className="hv-dept-card">
                  <div className="hv-dept-card__head">
                    <span className="hv-dept-card__title">{d.name}</span>
                    <button className="hv-icon-btn" title="Afdeling verwijderen" onClick={() => actions.removeDept(d.id)}>
                      ×
                    </button>
                  </div>
                  <div className="hv-member-list">
                    {d.members.map((m) => (
                      <span key={m} className="hv-member-pill">
                        {m}
                        <button className="hv-member-pill__remove" title="Medewerker verwijderen" onClick={() => actions.removeDeptMember(d.id, m)}>
                          ×
                        </button>
                      </span>
                    ))}
                    {d.members.length === 0 && (
                      <span style={{ fontSize: "11.5px", color: "var(--hv-fg-subtle)", fontStyle: "italic" }}>Nog geen medewerkers</span>
                    )}
                  </div>
                  <div className="hv-inline-form">
                    <input
                      className="hv-input"
                      style={{ flex: 1, minWidth: 0 }}
                      value={deptDrafts[d.id] || ""}
                      onChange={(e) => actions.setDeptDraft(d.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") actions.addDeptMember(d.id); }}
                      placeholder="Naam medewerker"
                    />
                    <button className="hv-btn hv-btn--ghost hv-btn--sm" onClick={() => actions.addDeptMember(d.id)}>
                      Toevoegen
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hv-inline-form" style={{ marginTop: "14px" }}>
              <input
                className="hv-input"
                style={{ flex: 1, minWidth: 0 }}
                value={state.newDept}
                onChange={(e) => actions.setNewDept(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") actions.addDept(); }}
                placeholder="Naam nieuwe afdeling"
              />
              <button className="hv-btn" style={{ whiteSpace: "nowrap" }} onClick={actions.addDept}>
                Afdeling toevoegen
              </button>
            </div>
          </div>

          <div>
            <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 14px" }}>
              IT-systemen
            </p>
            <div className="hv-sys-list">
              {state.systems.map((sy) => {
                const used = state.template.filter((t) => t.sys.indexOf(sy.key) >= 0).length;
                return (
                  <div key={sy.key} className="hv-sys-row">
                    <span className="hv-system-tag" style={{ width: "22px", height: "22px", fontSize: "10px" }}>
                      {sy.mono}
                    </span>
                    <span style={{ flex: 1, fontSize: "13px" }}>{sy.name}</span>
                    <span style={{ fontSize: "10px", color: "var(--hv-fg-subtle)", whiteSpace: "nowrap" }}>
                      {used ? (used === 1 ? "1 halte" : used + " haltes") : "niet gebruikt"}
                    </span>
                    <button className="hv-icon-btn" title="Systeem verwijderen" onClick={() => actions.removeSys(sy.key)}>
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="hv-inline-form" style={{ marginTop: "14px" }}>
              <input
                className="hv-input"
                style={{ flex: 1, minWidth: 0 }}
                value={state.newSys}
                onChange={(e) => actions.setNewSys(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") actions.addSys(); }}
                placeholder="Naam nieuw systeem"
              />
              <button className="hv-btn" style={{ whiteSpace: "nowrap" }} onClick={actions.addSys}>
                Systeem toevoegen
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
