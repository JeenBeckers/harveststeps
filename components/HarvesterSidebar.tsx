"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { initials } from "@/lib/logic";

type SortMode = "created" | "alpha";

export function HarvesterSidebar() {
  const { state, actions, canEdit } = useApp();
  const [sortMode, setSortMode] = useState<SortMode>("created");
  const [showArchive, setShowArchive] = useState(false);

  const list = useMemo(() => {
    const filtered = state.data.filter((h) => {
      const status = h.status || "active";
      return showArchive ? status !== "active" : status === "active";
    });
    if (sortMode === "alpha") {
      return filtered.slice().sort((a, b) => a.name.split(" ")[0].localeCompare(b.name.split(" ")[0], "nl"));
    }
    return filtered;
  }, [state.data, sortMode, showArchive]);

  return (
    <aside className="hv-hsidebar">
      <div className="hv-hsidebar__head">
        <p className="hv-label" style={{ color: "var(--hv-fg-muted)", margin: "0 0 10px" }}>
          Harvesters
        </p>
        <div className="hv-hsidebar__controls">
          <button className={`hv-filter${sortMode === "created" ? " is-active" : ""}`} onClick={() => setSortMode("created")}>
            Nieuwste
          </button>
          <button className={`hv-filter${sortMode === "alpha" ? " is-active" : ""}`} onClick={() => setSortMode("alpha")}>
            A-Z
          </button>
        </div>
        <button
          className={`hv-filter${showArchive ? " is-active" : ""}`}
          style={{ width: "100%", marginTop: "6px" }}
          onClick={() => setShowArchive((v) => !v)}
        >
          {showArchive ? "← Actieve harvesters" : "Archief bekijken"}
        </button>
      </div>
      <div className="hv-hsidebar__list">
        {list.map((h) => {
          const isActive = h.id === state.hid;
          const status = h.status || "active";
          return (
            <button
              key={h.id}
              className={`hv-hsidebar__item${isActive ? " is-active" : ""}`}
              onClick={() => actions.pickHarvester(h.id)}
            >
              <span className={`hv-hsidebar__avatar${isActive ? " is-active" : ""}`}>{initials(h.name)}</span>
              <span className="hv-hsidebar__name-col">
                <span className="hv-hsidebar__name">{h.name}</span>
                <span className="hv-hsidebar__sub">
                  {status === "completed" ? "Afgerond" : status === "aborted" ? "Afgebroken" : h.stops.length ? h.role : "Nog geen reis"}
                </span>
              </span>
            </button>
          );
        })}
        {list.length === 0 && (
          <p style={{ fontSize: "11.5px", color: "var(--hv-fg-subtle)", fontStyle: "italic", padding: "8px 12px" }}>
            {showArchive ? "Archief is leeg." : "Geen harvesters."}
          </p>
        )}
      </div>
      {canEdit && !showArchive && (
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
