/**
 * Divisions maintenance page — server-rendered data table for managing
 * league division records. Supports add and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { divisionRoute } from "@/lib/apiRoutes";
import { fetchDivisions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/divisions";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Divisions",
};

export default async function Page() {
	return (
		<>
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
		</>
	);
}
