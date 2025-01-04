import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/add-dialog-button";
import { seasonRoute } from "@/lib/apiRoutes";
import { fetchSeasons } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/seasons";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Seasons",
};

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchSeasons()}
					pageName="Seasons Page"
					addDialog={
						<DialogWithButton
							form="SeasonAddForm"
							title="Add Season"
							buttonName="Add Season +"
						/>
					}
					apiEndpoint={seasonRoute}
				/>
			</div>
		</>
	);
}
