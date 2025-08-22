import { DataTable } from "@/components/datatable";
import { seasonRoute } from "@/lib/apiRoutes";
import { fetchSeasons } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/seasons";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Seasons",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	 return (
		 <>
			 <div className="container mx-auto py-10">
				 <DataTable
					 columns={columns}
					 data={await fetchSeasons()}
					 pageName="Seasons Page"
					 addDialogConfig={{
						 form: "SeasonAddForm",
						 title: "Add Season",
						 buttonName: "Add Season +"
					 }}
					 deleteDialogConfig={{
						 buttonName: "Delete Season(s)",
						 title: "Delete Season(s)",
						 apiEndpoint: seasonRoute
					 }}
					 editDialogConfig={{
						 form: "SeasonEditForm",
						 title: "Edit Season",
						 buttonName: "Edit Season"
					 }}
					 viewLinkConfig={{
						 linkName: "View Season",
						 parentPage: "Seasons"
					 }}
					 apiEndpoint={seasonRoute}
				 />
			 </div>
		 </>
	 );
}
