"use client";

import { useApp } from "@/lib/store";
import { allMembers, resolveOwner } from "@/lib/logic";
import { EXTRA_OWNERS } from "@/lib/constants";

const TITLES: Record<string, [string, string, string]> = {
  harvester: ["Halte toevoegen", "Halte toevoegen aan deze reis", "Halte toevoegen"],
  template: ["Standaardroute", "Halte toevoegen aan de route", "Aan route toevoegen"],
  edit: ["Standaardroute", "Halte bewerken", "Wijzigingen opslaan"],
  stop: ["Reis", "Halte bewerken", "Wijzigingen opslaan"],
};

export function StopModal() {
  const { state, actions } = useApp();
  const m = state.modal;
  if (!m.open) return null;

  const h = state.data.find((x) => x.id === state.hid);
  const eyebrow = m.mode === "harvester" ? "Individuele halte · " + (h?.name || "") : m.mode === "stop" ? "Reis van " + (h?.name || "") : TITLES[m.mode]?.[0];
  const [, title, cta] = TITLES[m.mode] || TITLES.harvester;
  const owners = allMembers(state.depts).concat(EXTRA_OWNERS);

  return (
    <div className="hv-modal-overlay" onClick={actions.closeModal}>
      <div className="hv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hv-modal__body">
          <p className="hv-eyebrow" style={{ color: "var(--hv-fg-muted)", margin: "0 0 8px" }}>
            {eyebrow}
          </p>
          <h2 style={{ fontSize: "27px", marginBottom: "20px" }}>{title}</h2>

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Naam van de halte
          </p>
          <input
            className="hv-input hv-field"
            value={m.name}
            onChange={(e) => actions.setModalName(e.target.value)}
            placeholder="bv. Extra coachgesprek"
          />

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Verantwoordelijke afdeling
          </p>
          <div className="hv-pill-choices">
            {state.depts.map((d) => (
              <button
                key={d.id}
                className={`hv-filter${d.name === m.dept ? " is-active" : ""}`}
                onClick={() => actions.pickModalDept(d.name)}
              >
                {d.name}
              </button>
            ))}
          </div>

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Begeleider
          </p>
          <div className="hv-pill-choices">
            {allMembers(state.depts).map((g) => (
              <button key={g} className={`hv-filter${g === m.guide ? " is-active" : ""}`} onClick={() => actions.pickModalGuide(g)}>
                {g}
              </button>
            ))}
          </div>

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            IT-systemen
          </p>
          <div className="hv-pill-choices">
            {state.systems.map((sy) => (
              <button
                key={sy.key}
                className={`hv-filter${m.sys.indexOf(sy.key) >= 0 ? " is-active" : ""}`}
                onClick={() => actions.toggleModalSys(sy.key)}
              >
                {sy.name}
              </button>
            ))}
          </div>

          <p className="hv-label hv-field--tight" style={{ color: "var(--hv-fg-muted)" }}>
            Acties · omschrijving en eigenaar
          </p>
          <div className="hv-task-edit-list">
            {m.tasks.map((t, i) => (
              <div key={t.id || i} className="hv-task-edit-row">
                <input
                  className="hv-input"
                  style={{ flex: 1, minWidth: 0 }}
                  value={t.label}
                  onChange={(e) => actions.patchModalTask(i, { label: e.target.value })}
                />
                <select
                  className="hv-input"
                  style={{ width: "132px", flex: "none" }}
                  value={resolveOwner(t.owner, m.guide, m.guide)}
                  onChange={(e) => actions.patchModalTask(i, { owner: e.target.value })}
                >
                  {owners.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <button className="hv-icon-btn" title="Actie verwijderen" onClick={() => actions.removeModalTask(i)}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="hv-inline-form" style={{ marginBottom: "22px" }}>
            <input
              className="hv-input"
              style={{ flex: 1, minWidth: 0 }}
              value={m.taskDraft}
              onChange={(e) => actions.setModalTaskDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") actions.addModalTask(); }}
              placeholder="Nieuwe actie omschrijven"
            />
            <button className="hv-btn hv-btn--ghost hv-btn--sm" onClick={actions.addModalTask}>
              Actie toevoegen
            </button>
          </div>
        </div>
        <div className="hv-modal__footer">
          <button className="hv-btn hv-btn--ghost" onClick={actions.closeModal}>
            Annuleren
          </button>
          <button className="hv-btn" onClick={actions.submitModal}>
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
