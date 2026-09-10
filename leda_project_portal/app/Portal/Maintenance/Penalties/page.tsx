/**
 * Penalties maintenance page — server-rendered data table for managing
 * league penalty records. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { penaltyRoute } from "@/lib/apiRoutes";
import { fetchPenalties } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/penalties";
import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Penalties",
};

async function PenaltiesTable() {
	return (
		<div className="container mx-auto py-10">
			<DataTable
				columns={columns}
				data={await fetchPenalties()}
				pageName="Penalties Page"
				addDialogConfig={{
					form: "PenaltyAddForm",
					title: "Add Penalty",
					buttonName: "Add Penalty +"
				}}
				deleteDialogConfig={{
					buttonName: "Delete Penalty",
					title: "Delete Penalty",
					apiEndpoint: penaltyRoute
				}}
				editDialogConfig={{
					form: "PenaltyEditForm",
					title: "Edit Penalty",
					buttonName: "Edit Penalty"
				}}
				apiEndpoint={penaltyRoute}
			/>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<PenaltiesTable />
		</Suspense>
	);
}
