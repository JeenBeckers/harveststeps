"use client";

import { useApp } from "@/lib/store";
import { initials } from "@/lib/logic";

export function HarvesterSidebar() {
  const { state, actions, canEdit } = useApp();

  return (
    <aside className="hv-hsidebar">
      <div className="hv-hsidebar__head">
        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: 0 }}>
          Harvesters
        </p>
      </div>
      <div className="hv-hsidebar__list">
        {state.data.map((h) => {
          const isActive = h.id === state.hid;
          return (
            <button
              key={h.id}
              className={`hv-hsidebar__item${isActive ? " is-active" : ""}`}
              onClick={() => actions.pickHarvester(h.id)}
            >
              <span className={`hv-hsidebar__avatar${isActive ? " is-active" : ""}`}>{initials(h.name)}</span>
              <span className="hv-hsidebar__name-col">
                <span className="hv-hsidebar__name">{h.name}</span>
                <span className="hv-hsidebar__sub">{h.stops.length ? h.role : "Nog geen reis"}</span>
              </span>
            </button>
          );
        })}
      </div>
      {canEdit && (
        <div className="hv-hsidebar__foot">
          <button
            className="hv-btn hv-btn--ghost"
            style={{ width: "100%", justifyContent: "center", fontSize: "12.5px", padding: "9px 12px", whiteSpace: "nowrap" }}
            onClick={actions.openAddHarvester}
          >
            + Harvester toevoegen
          </button>
        </div>
      )}
    </aside>
  );
}
