/**
 * Payout Tiers maintenance page — server-rendered data table for managing
 * payout tier configurations. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { payoutTierRoute } from "@/lib/apiRoutes";
import { fetchPayoutTiers } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/payout_tiers";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Payout Tiers",
};

export default async function Page() {
	 return (
		 <>
			 <div className="container mx-auto py-10">
				 <DataTable
					 columns={columns}
					 data={await fetchPayoutTiers()}
					 pageName="Payout Tiers Page"
					 addDialogConfig={{
						 form: "PayoutTierAddForm",
						 title: "Add Payout Tier",
						 buttonName: "Add Payout Tier +"
					 }}
					 deleteDialogConfig={{
						 buttonName: "Delete Payout Tier(s)",
						 title: "Delete Payout Tier(s)",
						 apiEndpoint: payoutTierRoute
					 }}
					 editDialogConfig={{
						 form: "PayoutTierEditForm",
						 title: "Edit Payout Tier",
						 buttonName: "Edit Payout Tier"
					 }}
					 apiEndpoint={payoutTierRoute}
				 />
			 </div>
		 </>
	 );
}
