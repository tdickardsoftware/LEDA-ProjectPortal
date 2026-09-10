/**
 * Divisions maintenance page — server-rendered data table for managing
 * league division records. Supports add and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { divisionRoute } from "@/lib/apiRoutes";
import { fetchDivisions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/divisions";
import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Divisions",
};

async function DivisionsTable() {
	return (
		<div className="container mx-auto py-10">
			<DataTable
				columns={columns}
				data={await fetchDivisions()}
				pageName="Divisions Page"
				addDialogConfig={{
					form: "DivisionAddForm",
					title: "Add Division",
					buttonName: "Add Division +",
				}}
				deleteDialogConfig={{
					buttonName: "Delete Division(s)",
					title: "Delete Division(s)",
					apiEndpoint: divisionRoute,
				}}
				apiEndpoint={divisionRoute}
			/>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<DivisionsTable />
		</Suspense>
	);
}
