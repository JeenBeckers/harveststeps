"use client";

import Image from "next/image";
import { useApp } from "@/lib/store";
import { initials } from "@/lib/logic";
import { navItemsFor } from "@/lib/nav";

export function Header() {
  const { state, actions, me, canEdit } = useApp();
  const activeJourneys = state.data.filter((x) => (x.status || "active") === "active" && x.stops.length).length;
  const roleLabel = me?.role === "admin" ? "Beheerder" : me?.role === "editor" ? "Bewerker" : "Bekijker";
  const navItems = navItemsFor(canEdit);

  return (
    <header className="hv-header">
      <div className="hv-header__brand">
        <Image src="/harvest-logo.png" alt="Harvest" width={132} height={28} priority style={{ height: "22px", width: "auto" }} />
        <span className="hv-eyebrow hv-header__section">Talentplanner · Post-master</span>
      </div>
      <nav className="hv-header__nav">
        {navItems.map(([key, label]) => (
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
        <div className="hv-header__user">
          <span className="hv-role-chip">{roleLabel}</span>
          <div className="hv-header__avatar" title={me?.email}>
            {me ? initials(me.email.split("@")[0].replace(/[._]/g, " ")) : ""}
          </div>
          <button className="hv-logout-btn" onClick={actions.logout}>
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  );
}
