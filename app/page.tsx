import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { isFeatureLive } from "@/lib/flags";

const SIDEBAR_NAV_FLAG = "navigatiebalk-verplaatsen-naar-links-met-in-uitkla-mswxw7sx";
const NAV_TOGGLE_ICON_FLAG = "vervang-tekstlabel-inklappen-door-icoon-linksboven-msx22wia";
const BOOKMARKS_UNDER_BEHEER_FLAG = "bookmarks-knop-verplaatsen-naar-onder-beheer-in-li-msx3dk54";
const BOOKMARKS_IN_BEHEER_FLAG = "bookmarks-verplaatsen-naar-beheer-menu-msx96ba5";
const HARVEST_PLANNER_LABELS_FLAG = "herbenoemen-ui-labels-talent-planner-harvest-plann-mt004a5f";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fail closed: without a readable flag the app keeps the top navigation bar.
  const sidebarNav = await isFeatureLive(SIDEBAR_NAV_FLAG).catch(() => false);
  // Fail closed: without a readable flag the toggle keeps its written label.
  const navToggleIcon = await isFeatureLive(NAV_TOGGLE_ICON_FLAG).catch(() => false);
  // Fail closed: without a readable flag Bookmarks keeps its place in the primary list.
  const bookmarksUnderBeheer = await isFeatureLive(BOOKMARKS_UNDER_BEHEER_FLAG).catch(() => false);
  // Fail closed: without a readable flag Bookmarks stays out of the Beheer menu.
  const bookmarksInBeheer = await isFeatureLive(BOOKMARKS_IN_BEHEER_FLAG).catch(() => false);
  // Fail closed: without a readable flag the labels keep the Talentplanner wording.
  const harvestPlannerLabels = await isFeatureLive(HARVEST_PLANNER_LABELS_FLAG).catch(() => false);

  return (
    <AppProvider>
      <AppShell
        sidebarNav={sidebarNav}
        navToggleIcon={navToggleIcon}
        bookmarksUnderBeheer={bookmarksUnderBeheer}
        bookmarksInBeheer={bookmarksInBeheer}
        harvestPlannerLabels={harvestPlannerLabels}
      />
    </AppProvider>
  );
}
