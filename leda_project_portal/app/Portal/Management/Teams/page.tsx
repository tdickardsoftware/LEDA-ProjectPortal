"use client";

import { ServerSideDataTable } from "@/components/server-side-datatable";
import { teamRoute } from "@/lib/apiRoutes";
import { columns } from "@/schemas/managment/teams";
import { useTeamsData } from "@/hooks/useTeamsData";
import { Spinner } from "@/components/ui/skeleton";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";

export default function Page() {
	const { page, setPage, pageSize, setPageSize, search, setSearch, sorting, setSorting } = usePersistedDataTableState(
		"datatable:/Portal/Management/Teams"
	);

	const { data, isLoading } = useTeamsData(page, pageSize, search, sorting);

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
				stateKey="datatable:/Portal/Management/Teams"
				queryKey={["teams-datatable"]}
				pageSize={pageSize}
				onPageSizeChange={setPageSize}
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
				sorting={sorting}
				onSortingChange={setSorting}
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
