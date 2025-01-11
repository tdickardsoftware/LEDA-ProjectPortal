import AlertDialogDelete from "@/components/alert-dialog-delete";
import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import { divisionRoute } from "@/lib/apiRoutes";
import { fetchDivisions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/divisions";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Divisions",
};

export const dynamic = 'force-dynamic'

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchDivisions()}
					pageName="Divisions Page"
					addDialog={
						<DialogWithButton
							form="DivisionAddForm"
							title="Add Division"
							buttonName="Add Division +"
						/>
					}
					deleteDialog={
						<AlertDialogDelete
							buttonName="Delete Division"
							title="Delete Division"
							tables={["leda_maint_divisions"]}
							targetColumn="divisionName"
							apiEndpoint={divisionRoute}
						/>
					}
					apiEndpoint={divisionRoute}
				/>
			</div>
		</>
	);
}
