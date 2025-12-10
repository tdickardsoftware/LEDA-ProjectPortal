import { DataTable } from "@/components/datatable";
import { playerRoute, playersDataTableRoute } from "@/lib/apiRoutes";
import { fetchPlayers, fetchPlayersDataTable } from "@/lib/getData";
import { columns } from "@/schemas/managment/players";
import { Metadata } from "next";

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
					 data={await fetchPlayersDataTable()}
					 pageName="Players Page"
					 addDialogConfig={{
						 form: "PlayerAddInformationForm",
						 title: "Add Player",
						 buttonName: "Add Player +"
					 }}
					 deleteDialogConfig={{
						 buttonName: "Delete Player",
						 title: "Delete Player",
						 apiEndpoint: playerRoute
					 }}
					 editDialogConfig={{
						 form: "PlayerEditInformationForm",
						 title: "Edit Player",
						 buttonName: "Edit Player"
					 }}
					 viewLinkConfig={{
						 linkName: "View Player",
						 parentPage: "Players"
					 }}
					 apiEndpoint={playersDataTableRoute}
					 defaultSort="ledaId"
					 filter={true}
				 />
			 </div>
		 </>
	 );
}
