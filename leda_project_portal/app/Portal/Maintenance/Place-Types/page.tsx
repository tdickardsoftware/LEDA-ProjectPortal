/**
 * Place Types maintenance page — server-rendered data table for managing
 * venue/location category types. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { placeTypeRoute } from "@/lib/apiRoutes";
import { fetchPlaceTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/place_types";
import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Place Types",
};

async function PlaceTypesTable() {
	return (
		<div className="container mx-auto py-10">
			<DataTable
				columns={columns}
				data={await fetchPlaceTypes()}
				pageName="Place Types Page"
				addDialogConfig={{
					form: "PlaceTypeAddForm",
					title: "Add Place Type",
					buttonName: "Add Place Type +"
				}}
				deleteDialogConfig={{
					buttonName: "Delete Place Type(s)",
					title: "Delete Place Type(s)",
					apiEndpoint: placeTypeRoute
				}}
				editDialogConfig={{
					form: "PlaceTypeEditForm",
					title: "Edit Place Type",
					buttonName: "Edit Place Type"
				}}
				apiEndpoint={placeTypeRoute}
			/>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<PlaceTypesTable />
		</Suspense>
	);
}
