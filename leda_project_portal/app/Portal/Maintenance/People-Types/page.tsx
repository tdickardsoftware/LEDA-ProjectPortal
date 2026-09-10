/**
 * People Types maintenance page — server-rendered data table for managing
 * person category types. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { peopleTypeRoute } from "@/lib/apiRoutes";
import { fetchPeopleTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/people_types";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "People Types",
};

export default async function Page() {
	 return (
		 <>
			 <div className="container mx-auto py-10">
				 <DataTable
					 columns={columns}
					 data={await fetchPeopleTypes()}
					 pageName="People Types Page"
					 addDialogConfig={{
						 form: "PeopleTypeAddForm",
						 title: "Add People Type",
						 buttonName: "Add People Type +"
					 }}
					 deleteDialogConfig={{
						 buttonName: "Delete People Type(s)",
						 title: "Delete People Type(s)",
						 apiEndpoint: peopleTypeRoute
					 }}
					 editDialogConfig={{
						 form: "PeopleTypeEditForm",
						 title: "Edit People Type",
						 buttonName: "Edit People Type"
					 }}
					 apiEndpoint={peopleTypeRoute}
				 />
			 </div>
		 </>
	 );
}
