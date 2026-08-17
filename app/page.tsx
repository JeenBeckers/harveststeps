import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { isFeatureLive } from "@/lib/flags";

const SIDEBAR_NAV_FLAG = "navigatiebalk-verplaatsen-naar-links-met-in-uitkla-mswxw7sx";
const NAV_TOGGLE_ICON_FLAG = "vervang-tekstlabel-inklappen-door-icoon-linksboven-msx22wia";
const BOOKMARKS_UNDER_BEHEER_FLAG = "bookmarks-knop-verplaatsen-naar-onder-beheer-in-li-msx3dk54";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fail closed: without a readable flag the app keeps the top navigation bar.
  const sidebarNav = await isFeatureLive(SIDEBAR_NAV_FLAG).catch(() => false);
  // Fail closed: without a readable flag the toggle keeps its written label.
  const navToggleIcon = await isFeatureLive(NAV_TOGGLE_ICON_FLAG).catch(() => false);
  // Fail closed: without a readable flag Bookmarks keeps its place in the primary list.
  const bookmarksUnderBeheer = await isFeatureLive(BOOKMARKS_UNDER_BEHEER_FLAG).catch(() => false);

  return (
    <AppProvider>
      <AppShell
        sidebarNav={sidebarNav}
        navToggleIcon={navToggleIcon}
        bookmarksUnderBeheer={bookmarksUnderBeheer}
      />
    </AppProvider>
  );
}
