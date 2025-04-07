import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import AlertDialogDelete from "@/components/alert-dialog-delete";
import { playerRoute } from "@/lib/apiRoutes";
import { fetchPlayers } from "@/lib/getData";
import { columns } from "@/schemas/managment/players";
import { Metadata } from "next";
import CustomLink from "@/components/ui/custom-link";

export const metadata: Metadata = {
	title: "Players",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchPlayers()}
					pageName="Players Page"
					addDialog={
						<DialogWithButton
							form="PlayerAddInformationForm"
							title="Add Player"
							buttonName="Add Player +"
						/>
					}
					deleteDialog={
						<AlertDialogDelete
							buttonName="Delete Player"
							title="Delete Player"
							apiEndpoint={playerRoute}
						/>
					}
					editDialog={
						<DialogWithButton
							form="PlayerEditInformationForm"
							title="Edit Player"
							buttonName="Edit Player"
						/>
					}
					viewLink={
						<CustomLink
							linkName="View Player"
							parentPage="Players"
						/>
					}
					apiEndpoint={playerRoute}
					defaultSort="ledaId"
				/>
			</div>
		</>
	);
}
