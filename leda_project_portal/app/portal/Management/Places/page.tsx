import AlertDialogDelete from "@/components/alert-dialog-delete";
import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import { placeRoute } from "@/lib/apiRoutes";
import { fetchPlaces } from "@/lib/getData";
import { columns } from "@/schemas/managment/places";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Places",
};

export const dynamic = 'force-dynamic'

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchPlaces()}
					pageName="Places Page"
					addDialog={
						<DialogWithButton
							form="PlaceAddForm"
							title="Add Place"
							buttonName="Add Place +"
						/>
					}
					deleteDialog={
						<AlertDialogDelete
							buttonName="Delete Place"
							title="Delete Place"
							tables={[
								"leda_place_info",
							]}
							targetColumn="ledaId"
							apiEndpoint={placeRoute}
						/>
					}
					apiEndpoint={placeRoute}
				/>
			</div>
		</>
	);
}
