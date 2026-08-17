import type { View } from "./types";

const BOOKMARKS_NAV_ITEM: [View, string] = ["bookmarks", "Bookmarks"];

const PRIMARY_NAV_ITEMS: [View, string][] = [
  ["dashboard", "Takenlijst"],
  ["reis", "Harvesters"],
  BOOKMARKS_NAV_ITEM,
];

function beheerItemsFor(canEdit: boolean, bookmarksInBeheer: boolean): [View, string][] {
  const items: [View, string][] = [
    ["beheer", "Route"],
    ["organisatie", "Organisatie"],
  ];
  if (canEdit) items.push(["verbeteringen", "Verbeteringen"], ["gebruikers", "Gebruikers"]);
  // Bookmarks is open to every role, so unlike the editor-only items above it is never gated.
  if (bookmarksInBeheer) items.push(BOOKMARKS_NAV_ITEM);
  return items;
}

export type NavGroup = { label: string; items: [View, string][] };

export type NavGroups = {
  primary: [View, string][];
  beheer: NavGroup;
  /** Items rendered directly below the "Beheer" button. */
  trailing: [View, string][];
};

export type NavOptions = {
  /** Render Bookmarks as a standalone item directly below the "Beheer" button. */
  bookmarksUnderBeheer?: boolean;
  /** Render Bookmarks as an item inside the "Beheer" group, alongside Gebruikers. */
  bookmarksInBeheer?: boolean;
};

/**
 * Single source of truth for the navigation structure, shared by the top bar and the side bar:
 * a primary list plus a "Beheer" group for admin/management pages.
 *
 * Both bookmarks options take the item out of the primary list. `bookmarksInBeheer` makes it a
 * regular item inside the "Beheer" group and supersedes the standalone `bookmarksUnderBeheer`
 * placement; either way it is the same item with the same behaviour, only its position changes.
 */
export function navGroupsFor(canEdit: boolean, options: NavOptions = {}): NavGroups {
  const bookmarksInBeheer = options.bookmarksInBeheer ?? false;
  const bookmarksUnderBeheer = !bookmarksInBeheer && (options.bookmarksUnderBeheer ?? false);
  const primary =
    bookmarksInBeheer || bookmarksUnderBeheer
      ? PRIMARY_NAV_ITEMS.filter(([key]) => key !== BOOKMARKS_NAV_ITEM[0])
      : PRIMARY_NAV_ITEMS;
  return {
    primary,
    beheer: { label: "Beheer", items: beheerItemsFor(canEdit, bookmarksInBeheer) },
    trailing: bookmarksUnderBeheer ? [BOOKMARKS_NAV_ITEM] : [],
  };
}

/** Flat variant for the legacy top bar, which has no submenu affordance. */
export function navItemsFor(canEdit: boolean): [View, string][] {
  const { primary, beheer, trailing } = navGroupsFor(canEdit);
  return [...primary, ...beheer.items, ...trailing];
}
