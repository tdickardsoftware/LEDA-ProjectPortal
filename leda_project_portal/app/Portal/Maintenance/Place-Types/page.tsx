/**
 * Place Types maintenance page — server-rendered data table for managing
 * venue/location category types. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { placeTypeRoute } from "@/lib/apiRoutes";
import { fetchPlaceTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/place_types";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Place Types",
};

export default async function Page() {
	 return (
		 <>
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
		 </>
	 );
}
