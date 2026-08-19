/**
 * Wording shared by the top bar, the side bar and the login card: the brand line and the
 * active-count line. Keeping them here means the rename lands in one place instead of three.
 *
 * The labels render inside `.hv-eyebrow`, which already uppercases, so the casing below only
 * reflects the requested wording and changes nothing on screen.
 */

export function sectionLabel(harvestPlannerLabels: boolean): string {
  return harvestPlannerLabels ? "HARVEST PLANNER · Post-master" : "Talentplanner · Post-master";
}

export function activeCountLabel(count: number, harvestPlannerLabels: boolean): string {
  return harvestPlannerLabels ? `${count} actieve HARVESTERS` : `${count} actieve reizen`;
}
