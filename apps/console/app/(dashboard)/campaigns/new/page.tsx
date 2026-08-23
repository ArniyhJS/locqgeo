export const dynamic = "force-dynamic";

import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { getGeofencesAction } from "@/app/actions/geofences";
import { DEMO_TENANT_ID } from "@/lib/constants";

export default async function NewCampaignPage() {
  const geofencesResult = await getGeofencesAction(DEMO_TENANT_ID);
  const geofences = (geofencesResult.success ? geofencesResult.data : []) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Create Campaign</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Link billboards, set the rules, and launch a presence challenge.
        </p>
      </div>

      <CampaignForm tenantId={DEMO_TENANT_ID} geofences={geofences} />
    </div>
  );
}
