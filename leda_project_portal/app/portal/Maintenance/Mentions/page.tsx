import AlertDialogDelete from "@/components/alert-dialog-delete";
import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-with-button";
import { mentionRoute } from "@/lib/apiRoutes";
import { fetchMentions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/mentions";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mentions",
};

export const dynamic = 'force-dynamic'

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchMentions()}
					pageName="Mentions Page"
					addDialog={
						<DialogWithButton
							form="MentionAddForm"
							title="Add Mention"
							buttonName="Add Mention +"
						/>
					}
					deleteDialog={
						<AlertDialogDelete
							buttonName="Delete Mention(s)"
							title="Delete Mention(s)"
							apiEndpoint={mentionRoute}
						/>
					}
					apiEndpoint={mentionRoute}
				/>
			</div>
		</>
	);
}
