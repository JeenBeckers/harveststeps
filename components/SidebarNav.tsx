"use client";

import Image from "next/image";
import { useApp } from "@/lib/store";
import { initials } from "@/lib/logic";
import { navItemsFor } from "@/lib/nav";
import type { NavPreference } from "@/lib/useNavPreference";

export function SidebarNav({ nav }: { nav: NavPreference }) {
  const { state, actions, me, canEdit } = useApp();
  const activeJourneys = state.data.filter((x) => (x.status || "active") === "active" && x.stops.length).length;
  const roleLabel = me?.role === "admin" ? "Beheerder" : me?.role === "editor" ? "Bewerker" : "Bekijker";
  const navItems = navItemsFor(canEdit);

  return (
    <>
      <header className="hv-sidenav">
        <button
          type="button"
          className="hv-sidenav__toggle"
          onClick={nav.toggle}
          aria-expanded={!nav.collapsed}
          aria-controls="hv-sidenav-body"
          title={nav.collapsed ? "Navigatie uitklappen" : "Navigatie inklappen"}
        >
          {nav.collapsed ? "Uitklappen" : "Inklappen"}
        </button>
        <div className="hv-sidenav__body" id="hv-sidenav-body">
          <div className="hv-sidenav__brand">
            <Image src="/harvest-logo.png" alt="Harvest" width={132} height={28} priority style={{ height: "22px", width: "auto" }} />
            <span className="hv-eyebrow hv-sidenav__section">Talentplanner · Post-master</span>
          </div>
          <nav className="hv-sidenav__nav">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                className={`hv-btn--pill-toggle hv-sidenav__item${state.view === key ? " is-active" : ""}`}
                onClick={() => {
                  actions.setView(key);
                  // On narrow screens the bar covers the content, so step out of the way.
                  if (nav.overlay && !nav.collapsed) nav.toggle();
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="hv-sidenav__meta">
            <span className="hv-eyebrow hv-sidenav__metatext">{activeJourneys} actieve reizen</span>
            <div className="hv-sidenav__user">
              <div className="hv-header__avatar" title={me?.email}>
                {me ? initials(me.email.split("@")[0].replace(/[._]/g, " ")) : ""}
              </div>
              <span className="hv-role-chip">{roleLabel}</span>
            </div>
            <button className="hv-logout-btn" onClick={actions.logout}>
              Uitloggen
            </button>
          </div>
        </div>
      </header>
      {!nav.collapsed && (
        <button type="button" className="hv-sidenav__scrim" aria-label="Navigatie inklappen" onClick={nav.toggle} />
      )}
    </>
  );
}
