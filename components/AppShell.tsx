"use client";

import { useApp } from "@/lib/store";
import { useNavPreference } from "@/lib/useNavPreference";
import { Header } from "@/components/Header";
import { SidebarNav } from "@/components/SidebarNav";
import { HarvesterSidebar } from "@/components/HarvesterSidebar";
import { ReisView } from "@/components/ReisView";
import { DashboardView } from "@/components/DashboardView";
import { BeheerView } from "@/components/BeheerView";
import { OrganisatieView } from "@/components/OrganisatieView";
import { BookmarksView } from "@/components/BookmarksView";
import { UsersView } from "@/components/UsersView";
import { FeatureRequestsView } from "@/components/FeatureRequestsView";
import { StopModal } from "@/components/StopModal";
import { HarvesterModal } from "@/components/HarvesterModal";

export function AppShell({
  sidebarNav,
  navToggleIcon,
  bookmarksUnderBeheer,
  bookmarksInBeheer,
  harvestPlannerLabels,
}: {
  sidebarNav: boolean;
  navToggleIcon: boolean;
  bookmarksUnderBeheer: boolean;
  bookmarksInBeheer: boolean;
  harvestPlannerLabels: boolean;
}) {
  const { state, me, canEdit } = useApp();
  const nav = useNavPreference(sidebarNav);
  const view =
    (state.view === "gebruikers" || state.view === "verbeteringen") && !canEdit ? "reis" : state.view;

  const shellClass = [
    "hv-app",
    sidebarNav ? "hv-app--sidenav" : "",
    sidebarNav && nav.collapsed ? "is-collapsed" : "",
    // Only animate once the stored preference is applied, so the bar does not slide on first paint.
    sidebarNav && nav.loaded ? "is-ready" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      {sidebarNav ? (
        <>
          <SidebarNav
            nav={nav}
            iconToggle={navToggleIcon}
            bookmarksUnderBeheer={bookmarksUnderBeheer}
            bookmarksInBeheer={bookmarksInBeheer}
            harvestPlannerLabels={harvestPlannerLabels}
          />
          <div className="hv-sidenav__spacer" aria-hidden="true" />
        </>
      ) : (
        <Header harvestPlannerLabels={harvestPlannerLabels} />
      )}
      <main className="hv-main">
        {view === "reis" && (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>
            <HarvesterSidebar />
            <ReisView />
          </div>
        )}
        {view === "dashboard" && <DashboardView />}
        {view === "bookmarks" && <BookmarksView />}
        {view === "beheer" && <BeheerView />}
        {view === "organisatie" && <OrganisatieView />}
        {view === "gebruikers" && me && <UsersView currentUserId={me.id} />}
        {view === "verbeteringen" && <FeatureRequestsView />}
      </main>
      <StopModal />
      <HarvesterModal />
    </div>
  );
}
