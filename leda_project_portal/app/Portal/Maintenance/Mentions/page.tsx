/**
 * Mentions maintenance page — server-rendered data table for managing
 * mention records. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { mentionRoute } from "@/lib/apiRoutes";
import { fetchMentions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/mentions";
import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Mentions",
};

async function MentionsTable() {
	return (
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
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<MentionsTable />
		</Suspense>
	);
}
