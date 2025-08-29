import { DataTable } from "@/components/datatable";
import { playerRoute } from "@/lib/apiRoutes";
import { fetchPlayers } from "@/lib/getData";
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
					 data={await fetchPlayers()}
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
					 apiEndpoint={playerRoute}
					 defaultSort="ledaId"
					 filter={true}
				 />
			 </div>
		 </>
	 );
}
