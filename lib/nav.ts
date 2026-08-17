import type { View } from "./types";

const BOOKMARKS_NAV_ITEM: [View, string] = ["bookmarks", "Bookmarks"];

const PRIMARY_NAV_ITEMS: [View, string][] = [
  ["dashboard", "Takenlijst"],
  ["reis", "Harvesters"],
  BOOKMARKS_NAV_ITEM,
];

function beheerItemsFor(canEdit: boolean): [View, string][] {
  const items: [View, string][] = [
    ["beheer", "Route"],
    ["organisatie", "Organisatie"],
  ];
  if (canEdit) items.push(["verbeteringen", "Verbeteringen"], ["gebruikers", "Gebruikers"]);
  return items;
}

export type NavGroup = { label: string; items: [View, string][] };

export type NavGroups = {
  primary: [View, string][];
  beheer: NavGroup;
  /** Items rendered directly below the "Beheer" button. */
  trailing: [View, string][];
};

/**
 * Single source of truth for the navigation structure, shared by the top bar and the side bar:
 * a primary list plus a "Beheer" group for admin/management pages.
 *
 * With `bookmarksUnderBeheer` the Bookmarks item leaves the primary list and is rendered
 * underneath the "Beheer" button instead — same item, same behaviour, different position.
 */
export function navGroupsFor(canEdit: boolean, bookmarksUnderBeheer = false): NavGroups {
  const primary = bookmarksUnderBeheer
    ? PRIMARY_NAV_ITEMS.filter(([key]) => key !== BOOKMARKS_NAV_ITEM[0])
    : PRIMARY_NAV_ITEMS;
  return {
    primary,
    beheer: { label: "Beheer", items: beheerItemsFor(canEdit) },
    trailing: bookmarksUnderBeheer ? [BOOKMARKS_NAV_ITEM] : [],
  };
}

/** Flat variant for the legacy top bar, which has no submenu affordance. */
export function navItemsFor(canEdit: boolean): [View, string][] {
  const { primary, beheer, trailing } = navGroupsFor(canEdit);
  return [...primary, ...beheer.items, ...trailing];
}
