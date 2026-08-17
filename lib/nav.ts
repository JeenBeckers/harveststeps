import type { View } from "./types";

const BASE_NAV_ITEMS: [View, string][] = [
  ["dashboard", "Takenlijst"],
  ["bookmarks", "Bookmarks"],
  ["reis", "Reizen"],
  ["beheer", "Route"],
  ["organisatie", "Organisatie"],
];

/** Single source of truth for the navigation items, shared by the top bar and the side bar. */
export function navItemsFor(canEdit: boolean): [View, string][] {
  return canEdit
    ? [...BASE_NAV_ITEMS, ["verbeteringen", "Verbeteringen"], ["gebruikers", "Gebruikers"]]
    : BASE_NAV_ITEMS;
}
