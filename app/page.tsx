import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { isFeatureLive } from "@/lib/flags";

const SIDEBAR_NAV_FLAG = "navigatiebalk-verplaatsen-naar-links-met-in-uitkla-mswxw7sx";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fail closed: without a readable flag the app keeps the top navigation bar.
  const sidebarNav = await isFeatureLive(SIDEBAR_NAV_FLAG).catch(() => false);

  return (
    <AppProvider>
      <AppShell sidebarNav={sidebarNav} />
    </AppProvider>
  );
}
