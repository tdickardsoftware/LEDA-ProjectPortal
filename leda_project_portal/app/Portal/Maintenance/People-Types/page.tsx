import AlertDialogDelete from "@/components/alert-dialog-delete";
import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import { peopleTypeRoute } from "@/lib/apiRoutes";
import { fetchPeopleTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/people_types";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "People Types",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchPeopleTypes()}
					pageName="People Types Page"
					addDialog={
						<DialogWithButton
							form="PeopleTypeAddForm"
							title="Add People Type"
							buttonName="Add People Type +"
						/>
					}
					deleteDialog={
						<AlertDialogDelete
							buttonName="Delete People Type(s)"
							title="Delete People Type(s)"
							apiEndpoint={peopleTypeRoute}
						/>
					}
					editDialog={
						<DialogWithButton
							form="PeopleTypeEditForm"
							title="Edit People Type"
							buttonName="Edit People Type"
						/>
					}
					apiEndpoint={peopleTypeRoute}
				/>
			</div>
		</>
	);
}
