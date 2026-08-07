"use client";

import { AppProvider, useApp } from "@/lib/store";
import { Header } from "@/components/Header";
import { HarvesterSidebar } from "@/components/HarvesterSidebar";
import { ReisView } from "@/components/ReisView";
import { DashboardView } from "@/components/DashboardView";
import { BeheerView } from "@/components/BeheerView";
import { OrganisatieView } from "@/components/OrganisatieView";
import { UsersView } from "@/components/UsersView";
import { StopModal } from "@/components/StopModal";
import { HarvesterModal } from "@/components/HarvesterModal";

function AppShell() {
  const { state, me, canEdit } = useApp();
  const view = state.view === "gebruikers" && !canEdit ? "reis" : state.view;

  return (
    <div className="hv-app">
      <Header />
      <main className="hv-main">
        {view === "reis" && (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>
            <HarvesterSidebar />
            <ReisView />
          </div>
        )}
        {view === "dashboard" && <DashboardView />}
        {view === "beheer" && <BeheerView />}
        {view === "organisatie" && <OrganisatieView />}
        {view === "gebruikers" && me && <UsersView currentUserId={me.id} />}
      </main>
      <StopModal />
      <HarvesterModal />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
