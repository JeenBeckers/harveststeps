"use client";

import Image from "next/image";
import { useApp } from "@/lib/store";
import type { View } from "@/lib/types";

const NAV_ITEMS: [View, string][] = [
  ["reis", "Reis"],
  ["dashboard", "Dashboard"],
  ["beheer", "Route"],
  ["organisatie", "Organisatie"],
];

export function Header() {
  const { state, actions } = useApp();
  const activeJourneys = state.data.filter((x) => x.stops.length).length;

  return (
    <header className="hv-header">
      <div className="hv-header__brand">
        <Image src="/harvest-logo.png" alt="Harvest" width={132} height={28} priority style={{ height: "22px", width: "auto" }} />
        <span className="hv-eyebrow hv-header__section">Talentplanner · Post-master</span>
      </div>
      <nav className="hv-header__nav">
        {NAV_ITEMS.map(([key, label]) => (
          <button
            key={key}
            className={`hv-btn--pill-toggle${state.view === key ? " is-active" : ""}`}
            onClick={() => actions.setView(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="hv-header__meta">
        <span className="hv-eyebrow hv-header__metatext">{activeJourneys} actieve reizen</span>
        <div className="hv-header__avatar">JV</div>
      </div>
    </header>
  );
}
