/**
 * Penalties maintenance page — server-rendered data table for managing
 * league penalty records. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { penaltyRoute } from "@/lib/apiRoutes";
import { fetchPenalties } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/penalties";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Penalties",
};

export default async function Page() {
	 return (
		 <>
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
		 </>
	 );
}
