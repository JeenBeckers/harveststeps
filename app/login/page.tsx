import { LoginForm } from "@/components/LoginForm";
import { isFeatureLive } from "@/lib/flags";

const HARVEST_PLANNER_LABELS_FLAG = "herbenoemen-ui-labels-talent-planner-harvest-plann-mt004a5f";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Fail closed: without a readable flag the login card keeps the Talentplanner wording.
  const harvestPlannerLabels = await isFeatureLive(HARVEST_PLANNER_LABELS_FLAG).catch(() => false);

  return (
    <div className="hv-login-page">
      <LoginForm harvestPlannerLabels={harvestPlannerLabels} />
    </div>
  );
}
