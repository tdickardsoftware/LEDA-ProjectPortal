"use client";

import { ServerSideDataTable } from "@/components/server-side-datatable";
import { teamRoute } from "@/lib/apiRoutes";
import { columns } from "@/schemas/managment/teams";
import { useTeamsData } from "@/hooks/useTeamsData";
import { Spinner } from "@/components/ui/skeleton";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";

export default function Page() {
	const { page, setPage, search, setSearch } = usePersistedDataTableState(
		"datatable:/Portal/Management/Teams"
	);
	const pageSize = 10;

	const { data, isLoading, error } = useTeamsData(page, pageSize, search);

	if (error) {
		return (
			<div className="container mx-auto py-10">
				<div className="text-center text-red-500">
					Error loading teams: {(error as Error).message}
				</div>
			</div>
		);
	}

	// Show initial loading state
	if (isLoading && !data) {
		return (
			<div className="container mx-auto py-10">
				<div className="flex items-center justify-center min-h-[400px]">
					<Spinner />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<ServerSideDataTable
				columns={columns}
				data={data?.data || []}
				pageName="Teams Page"
				addDialogConfig={{
					form: "TeamAddForm",
					title: "Add Team",
					buttonName: "Add Team +"
				}}
				deleteDialogConfig={{
					buttonName: "Delete Team",
					title: "Delete Team",
					apiEndpoint: teamRoute
				}}
				editDialogConfig={{
					form: "TeamEditForm",
					title: "Edit Team",
					buttonName: "Edit Team"
				}}
				viewLinkConfig={{
					linkName: "View Team",
					parentPage: "Teams"
				}}
				defaultSort="ledaId"
				isLoading={isLoading}
				totalPages={data?.pagination.totalPages || 1}
				currentPage={page}
				onPageChange={setPage}
				onSearchChange={setSearch}
				searchValue={search}
			/>
		</div>
	);
}
