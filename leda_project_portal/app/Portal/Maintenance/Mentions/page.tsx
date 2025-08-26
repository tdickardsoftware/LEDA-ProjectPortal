import { DataTable } from "@/components/datatable";
import { mentionRoute } from "@/lib/apiRoutes";
import { fetchMentions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/mentions";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mentions",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	return (
		<>
			<div className="container mx-auto py-10">
				<DataTable
					columns={columns}
					data={await fetchMentions()}
					pageName="Mentions Page"
					addDialogConfig={{
						form: "MentionAddForm",
						title: "Add Mention",
						buttonName: "Add Mention +",
					}}
					deleteDialogConfig={{
						buttonName: "Delete Mention(s)",
						title: "Delete Mention(s)",
						apiEndpoint: mentionRoute,
					}}
					editDialogConfig={{
						form: "MentionEditForm",
						title: "Edit Mention",
						buttonName: "Edit Mention",
					}}
					apiEndpoint={mentionRoute}
				/>
			</div>
		</>
	);
}
