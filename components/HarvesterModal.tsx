"use client";

import { useApp } from "@/lib/store";
import { allMembers } from "@/lib/logic";

export function HarvesterModal() {
  const { state, actions } = useApp();
  const hm = state.hmodal;
  if (!hm.open) return null;

  const recruitDept = state.depts.find((d) => d.name === "Recruitment");
  const recruiters = recruitDept && recruitDept.members.length ? recruitDept.members : allMembers(state.depts);

  return (
    <div className="hv-modal-overlay" onClick={actions.closeHModal}>
      <div className="hv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hv-modal__body">
          <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
            Nieuwe harvester
          </p>
          <h2 style={{ fontSize: "27px", marginBottom: "20px" }}>Harvester aanmaken</h2>

          <div className="hv-grid-name-age">
            <div>
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
                Naam
              </p>
              <input className="hv-input" value={hm.name} onChange={(e) => actions.setHName(e.target.value)} placeholder="Voor- en achternaam" />
            </div>
            <div>
              <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
                Leeftijd
              </p>
              <input className="hv-input" value={hm.age} onChange={(e) => actions.setHAge(e.target.value)} placeholder="24" />
            </div>
          </div>

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Rol
          </p>
          <input
            className="hv-input hv-field"
            value={hm.role}
            onChange={(e) => actions.setHRole(e.target.value)}
            placeholder="bv. Junior Data Analyst"
          />

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Werkgever
          </p>
          <input
            className="hv-input hv-field"
            value={hm.client}
            onChange={(e) => actions.setHClient(e.target.value)}
            placeholder="Laat leeg als er nog geen match is"
          />

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Startdatum
          </p>
          <input
            className="hv-input hv-field"
            value={hm.start}
            onChange={(e) => actions.setHStart(e.target.value)}
            placeholder="bv. 1 sep 2026"
          />

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            E-mailadres
          </p>
          <input
            className="hv-input hv-field"
            value={hm.email}
            onChange={(e) => actions.setHEmail(e.target.value)}
            placeholder="voornaam.achternaam@harvest.nl"
          />

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Eindverantwoordelijke recruitment
          </p>
          <div className="hv-pill-choices" style={{ marginBottom: "8px" }}>
            {recruiters.map((r) => (
              <button key={r} className={`hv-filter${r === hm.recruiter ? " is-active" : ""}`} onClick={() => actions.pickHRecruiter(r)}>
                {r}
              </button>
            ))}
          </div>
          <p style={{ fontSize: "11px", color: "var(--hv-fg-subtle)", lineHeight: 1.5, margin: "0 0 20px" }}>
            Vanaf halte 05 gaat de eindverantwoordelijkheid over naar de Employee Success Manager.
          </p>

          <label className="hv-check-label">
            <button className={`hv-checkbox${hm.startNow ? " is-checked" : ""}`} onClick={(e) => { e.preventDefault(); actions.toggleHStartNow(); }}>
              {hm.startNow ? "✓" : ""}
            </button>
            <span style={{ fontSize: "12.5px" }}>Standaardroute direct starten</span>
          </label>
        </div>
        <div className="hv-modal__footer">
          <button className="hv-btn hv-btn--ghost" onClick={actions.closeHModal}>
            Annuleren
          </button>
          <button className="hv-btn" onClick={actions.submitHModal}>
            Harvester aanmaken
          </button>
        </div>
      </div>
    </div>
  );
}
