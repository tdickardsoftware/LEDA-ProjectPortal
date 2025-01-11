import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import { payoutTierRoute } from "@/lib/apiRoutes";
import { fetchPayoutTiers } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/payout_tiers";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Payout Tiers",
};

export const dynamic = 'force-dynamic'

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchPayoutTiers()}
					pageName="Payout Tiers Page"
					addDialog={
						<DialogWithButton
							form="PayoutTierAddForm"
							title="Add Payout Tier"
							buttonName="Add Payout Tier +"
						/>
					}
					apiEndpoint={payoutTierRoute}
				/>
			</div>
		</>
	);
}
