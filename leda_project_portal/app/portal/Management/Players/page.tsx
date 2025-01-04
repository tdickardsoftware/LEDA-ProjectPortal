import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/add-dialog-button";
import { playerRoute } from "@/lib/apiRoutes";
import { fetchPlayers } from "@/lib/getData";
import { columns } from "@/schemas/managment/players";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Players",
};

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
					apiEndpoint={playerRoute}
				/>
			</div>
		</>
	);
}
