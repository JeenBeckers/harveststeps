import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { isFeatureLive } from "@/lib/flags";

const SIDEBAR_NAV_FLAG = "navigatiebalk-verplaatsen-naar-links-met-in-uitkla-mswxw7sx";
const NAV_TOGGLE_ICON_FLAG = "vervang-tekstlabel-inklappen-door-icoon-linksboven-msx22wia";
const BOOKMARKS_UNDER_BEHEER_FLAG = "bookmarks-knop-verplaatsen-naar-onder-beheer-in-li-msx3dk54";
const BOOKMARKS_IN_BEHEER_FLAG = "bookmarks-verplaatsen-naar-beheer-menu-msx96ba5";
const BOOKMARK_SINGULAR_LABEL_FLAG = "label-wijzigen-in-linker-navigatiebalk-bookmarks-b-mtikrg25";
const HARVEST_PLANNER_LABELS_FLAG = "herbenoemen-ui-labels-talent-planner-harvest-plann-mt004a5f";
const HARVESTER_EDIT_FLAG = "bewerkoptie-voor-harvester-naam-klant-startdatum-mtbaf3rj";
const HARVESTER_NOTES_FLAG = "notitieveld-op-harvester-detailscherm-mtbfvz5x";
const LOGOUT_AFMELDEN_LABEL_FLAG = "knoptekst-wijzigen-van-uitloggen-naar-afmelden-mtu4dyu0";

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
  // Fail closed: without a readable flag the side bar keeps the plural "Bookmarks" label.
  const bookmarkSingularLabel = await isFeatureLive(BOOKMARK_SINGULAR_LABEL_FLAG).catch(() => false);
  // Fail closed: without a readable flag the labels keep the Talentplanner wording.
  const harvestPlannerLabels = await isFeatureLive(HARVEST_PLANNER_LABELS_FLAG).catch(() => false);
  // Fail closed: without a readable flag the harvester list stays read-only.
  const harvesterEdit = await isFeatureLive(HARVESTER_EDIT_FLAG).catch(() => false);
  // Fail closed: without a readable flag the detail screen shows no notes field.
  const harvesterNotes = await isFeatureLive(HARVESTER_NOTES_FLAG).catch(() => false);
  // Fail closed: without a readable flag the side bar keeps the "Uitloggen" wording.
  const logoutAfmeldenLabel = await isFeatureLive(LOGOUT_AFMELDEN_LABEL_FLAG).catch(() => false);

  return (
    <AppProvider>
      <AppShell
        sidebarNav={sidebarNav}
        navToggleIcon={navToggleIcon}
        bookmarksUnderBeheer={bookmarksUnderBeheer}
        bookmarksInBeheer={bookmarksInBeheer}
        bookmarkSingularLabel={bookmarkSingularLabel}
        harvestPlannerLabels={harvestPlannerLabels}
        harvesterEdit={harvesterEdit}
        harvesterNotes={harvesterNotes}
        logoutAfmeldenLabel={logoutAfmeldenLabel}
      />
    </AppProvider>
  );
}
