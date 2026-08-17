"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { initials } from "@/lib/logic";
import { navGroupsFor } from "@/lib/nav";
import type { View } from "@/lib/types";
import type { NavPreference } from "@/lib/useNavPreference";

export function SidebarNav({
  nav,
  iconToggle,
  bookmarksUnderBeheer,
}: {
  nav: NavPreference;
  iconToggle: boolean;
  bookmarksUnderBeheer: boolean;
}) {
  const { state, actions, me, canEdit } = useApp();
  const activeJourneys = state.data.filter((x) => (x.status || "active") === "active" && x.stops.length).length;
  const roleLabel = me?.role === "admin" ? "Beheerder" : me?.role === "editor" ? "Bewerker" : "Bekijker";
  const toggleLabel = nav.collapsed ? "Navigatie uitklappen" : "Navigatie inklappen";
  const { primary, beheer, trailing } = navGroupsFor(canEdit, bookmarksUnderBeheer);
  const beheerActive = beheer.items.some(([key]) => key === state.view);
  const [beheerOpen, setBeheerOpen] = useState(beheerActive);

  useEffect(() => {
    if (beheerActive) setBeheerOpen(true);
  }, [beheerActive]);

  const goTo = (key: View) => {
    actions.setView(key);
    // On narrow screens the bar covers the content, so step out of the way.
    if (nav.overlay && !nav.collapsed) nav.toggle();
  };

  return (
    <>
      <header className="hv-sidenav">
        <button
          type="button"
          className={`hv-sidenav__toggle${iconToggle ? " hv-sidenav__toggle--icon" : ""}`}
          onClick={nav.toggle}
          aria-expanded={!nav.collapsed}
          aria-controls="hv-sidenav-body"
          title={toggleLabel}
          // The chevrons carry no meaning for a screen reader, so keep the wording as the name.
          aria-label={iconToggle ? toggleLabel : undefined}
        >
          {iconToggle
            ? nav.collapsed
              ? ">>"
              : "<<"
            : nav.collapsed
              ? "Uitklappen"
              : "Inklappen"}
        </button>
        <div className="hv-sidenav__body" id="hv-sidenav-body">
          <div className="hv-sidenav__brand">
            <Image src="/harvest-logo.png" alt="Harvest" width={132} height={28} priority style={{ height: "22px", width: "auto" }} />
            <span className="hv-eyebrow hv-sidenav__section">Talentplanner · Post-master</span>
          </div>
          <nav className="hv-sidenav__nav">
            {primary.map(([key, label]) => (
              <button
                key={key}
                className={`hv-btn--pill-toggle hv-sidenav__item${state.view === key ? " is-active" : ""}`}
                onClick={() => goTo(key)}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className={`hv-btn--pill-toggle hv-sidenav__item${beheerActive ? " is-active" : ""}`}
              aria-expanded={beheerOpen}
              aria-controls="hv-sidenav-beheer"
              onClick={() => setBeheerOpen((open) => !open)}
            >
              {beheer.label}
            </button>
            {beheerOpen && (
              <div className="hv-sidenav__subnav" id="hv-sidenav-beheer">
                {beheer.items.map(([key, label]) => (
                  <button
                    key={key}
                    className={`hv-btn--pill-toggle hv-sidenav__item hv-sidenav__item--sub${state.view === key ? " is-active" : ""}`}
                    onClick={() => goTo(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {trailing.map(([key, label]) => (
              <button
                key={key}
                className={`hv-btn--pill-toggle hv-sidenav__item${state.view === key ? " is-active" : ""}`}
                onClick={() => goTo(key)}
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
