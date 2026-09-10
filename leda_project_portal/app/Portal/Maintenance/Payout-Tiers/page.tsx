/**
 * Payout Tiers maintenance page — server-rendered data table for managing
 * payout tier configurations. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { payoutTierRoute } from "@/lib/apiRoutes";
import { fetchPayoutTiers } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/payout_tiers";
import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Payout Tiers",
};

async function PayoutTiersTable() {
	return (
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
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<PayoutTiersTable />
		</Suspense>
	);
}
