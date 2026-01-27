"use client";

import { ServerSideDataTable } from "@/components/server-side-datatable";
import { playerRoute } from "@/lib/apiRoutes";
import { columns } from "@/schemas/managment/players";
import { usePlayersData } from "@/hooks/usePlayersData";
import { Spinner } from "@/components/ui/skeleton";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";

export default function Page() {
	const { page, setPage, search, setSearch, sorting, setSorting } = usePersistedDataTableState(
		"datatable:/Portal/Management/Players"
	);
	const pageSize = 10;

	const { data, isLoading, error } = usePlayersData(page, pageSize, search, sorting);

	if (error) {
		return (
			<div className="container mx-auto py-10">
				<div className="text-center text-red-500">
					Error loading players: {(error as Error).message}
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
				pageName="Players Page"
				stateKey="datatable:/Portal/Management/Players"
				queryKey={["players-datatable"]}
				addDialogConfig={{
					form: "PlayerAddInformationForm",
					title: "Add Player",
					buttonName: "Add Player +"
				}}
				deleteDialogConfig={{
					buttonName: "Delete Player",
					title: "Delete Player",
					apiEndpoint: playerRoute
				}}
				editDialogConfig={{
					form: "PlayerEditInformationForm",
					title: "Edit Player",
					buttonName: "Edit Player"
				}}
				viewLinkConfig={{
					linkName: "View Player",
					parentPage: "Players"
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
