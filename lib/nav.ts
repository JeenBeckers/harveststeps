import type { View } from "./types";

const PRIMARY_NAV_ITEMS: [View, string][] = [
  ["dashboard", "Takenlijst"],
  ["reis", "Harvesters"],
  ["bookmarks", "Bookmarks"],
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

/**
 * Single source of truth for the navigation structure, shared by the top bar and the side bar:
 * a primary list plus a "Beheer" group for admin/management pages.
 */
export function navGroupsFor(canEdit: boolean): { primary: [View, string][]; beheer: NavGroup } {
  return { primary: PRIMARY_NAV_ITEMS, beheer: { label: "Beheer", items: beheerItemsFor(canEdit) } };
}

/** Flat variant for the legacy top bar, which has no submenu affordance. */
export function navItemsFor(canEdit: boolean): [View, string][] {
  const { primary, beheer } = navGroupsFor(canEdit);
  return [...primary, ...beheer.items];
}
