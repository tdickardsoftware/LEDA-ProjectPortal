import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/add-dialog-button";
import { divisionRoute } from "@/lib/apiRoutes";
import { fetchDivisions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/divisions";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Divisions",
};

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
					apiEndpoint={divisionRoute}
				/>
			</div>
		</>
	);
}
