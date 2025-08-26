import { DataTable } from "@/components/datatable";
import { divisionRoute } from "@/lib/apiRoutes";
import { fetchDivisions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/divisions";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Divisions",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchDivisions()}
					pageName="Divisions Page"
					addDialogConfig={{
						form: "DivisionAddForm",
						title: "Add Division",
						buttonName: "Add Division +",
					}}
					deleteDialogConfig={{
						buttonName: "Delete Division(s)",
						title: "Delete Division(s)",
						apiEndpoint: divisionRoute,
					}}
					apiEndpoint={divisionRoute}
				/>
			</div>
		</>
	);
}
