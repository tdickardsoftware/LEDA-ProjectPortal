import AlertDialogDelete from "@/components/alert-dialog-delete";
import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import { teamRoute } from "@/lib/apiRoutes";
import { fetchTeams } from "@/lib/getData";
import { columns } from "@/schemas/managment/teams";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Teams",
};

export const dynamic = 'force-dynamic'

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchTeams()}
					pageName="Teams Page"
					addDialog={
						<DialogWithButton
							form="TeamAddForm"
							title="Add Team"
							buttonName="Add Team +"
						/>
					}
					deleteDialog={
						<AlertDialogDelete
							buttonName="Delete Team"
							title="Delete Team"
							apiEndpoint={teamRoute}
						/>
					}
					editDialog={
						<DialogWithButton
							form="TeamEditForm"
							title="Edit Team"
							buttonName="Edit Team"
						/>
					}
					apiEndpoint={teamRoute}
					defaultSort="ledaId"
				/>
			</div>
		</>
	);
}
