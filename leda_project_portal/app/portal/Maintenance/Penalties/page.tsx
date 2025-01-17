import AlertDialogDelete from "@/components/alert-dialog-delete";
import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import { penaltyRoute } from "@/lib/apiRoutes";
import { fetchPenalties } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/penalties";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Penalties",
};

export const dynamic = 'force-dynamic'

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchPenalties()}
					pageName="Penalties Page"
					addDialog={
						<DialogWithButton
							form="PenaltyAddForm"
							title="Add Penalty"
							buttonName="Add Penalty +"
						/>
					}
					deleteDialog={
						<AlertDialogDelete
							buttonName="Delete Penalty"
							title="Delete Penalty"
							apiEndpoint={penaltyRoute}
						/>
					}
					editDialog={
						<DialogWithButton
							form="PenaltyEditForm"
							title="Edit Penalty"
							buttonName="Edit Penalty"
						/>
					}
					apiEndpoint={penaltyRoute}
				/>
			</div>
		</>
	);
}
