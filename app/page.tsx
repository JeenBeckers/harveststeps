"use client";

import { AppProvider, useApp } from "@/lib/store";
import { Header } from "@/components/Header";
import { HarvesterSidebar } from "@/components/HarvesterSidebar";
import { ReisView } from "@/components/ReisView";
import { DashboardView } from "@/components/DashboardView";
import { BeheerView } from "@/components/BeheerView";
import { OrganisatieView } from "@/components/OrganisatieView";
import { StopModal } from "@/components/StopModal";
import { HarvesterModal } from "@/components/HarvesterModal";

function AppShell() {
  const { state } = useApp();

  return (
    <div className="hv-app">
      <Header />
      <main className="hv-main">
        {state.view === "reis" && (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>
            <HarvesterSidebar />
            <ReisView />
          </div>
        )}
        {state.view === "dashboard" && <DashboardView />}
        {state.view === "beheer" && <BeheerView />}
        {state.view === "organisatie" && <OrganisatieView />}
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
