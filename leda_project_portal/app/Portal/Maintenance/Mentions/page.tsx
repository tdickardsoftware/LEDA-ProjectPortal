/**
 * Mentions maintenance page — server-rendered data table for managing
 * mention records. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { mentionRoute } from "@/lib/apiRoutes";
import { fetchMentions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/mentions";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Mentions",
};

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
