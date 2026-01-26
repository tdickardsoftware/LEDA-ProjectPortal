"use client";

import { ServerSideDataTable } from "@/components/server-side-datatable";
import { seasonRoute } from "@/lib/apiRoutes";
import { columns } from "@/schemas/maintenance/seasons";
import { useSeasonsData } from "@/hooks/useSeasonsData";
import { Spinner } from "@/components/ui/skeleton";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";

export default function Page() {
	const { page, setPage, search, setSearch, sorting, setSorting } = usePersistedDataTableState(
		"datatable:/Portal/Maintenance/Seasons"
	);
	const pageSize = 10;

	const { data, isLoading, error } = useSeasonsData(page, pageSize, search, sorting);

	if (error) {
		return (
			<div className="container mx-auto py-10">
				<div className="text-center text-red-500">
					Error loading seasons: {(error as Error).message}
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
				pageName="Seasons Page"
				addDialogConfig={{
					form: "SeasonAddForm",
					title: "Add Season",
					buttonName: "Add Season +"
				}}
				deleteDialogConfig={{
					buttonName: "Delete Season(s)",
					title: "Delete Season(s)",
					apiEndpoint: seasonRoute
				}}
				editDialogConfig={{
					form: "SeasonEditForm",
					title: "Edit Season",
					buttonName: "Edit Season"
				}}
				viewLinkConfig={{
					linkName: "View Season",
					parentPage: "Seasons"
				}}
				customLink={{
					buttonName: "View Calendar",
					link: "/Maintenance/Seasons/Calendar"
				}}
				isLoading={isLoading}
				sorting={sorting}
				onSortingChange={setSorting}
				totalPages={data?.pagination.totalPages || 1}
				currentPage={page}
				onPageChange={setPage}
				onSearchChange={setSearch}
				searchValue={search}
			/>
		</div>
	);
}
