/**
 * Seasons maintenance page — client-side server-paginated data table for managing
 * league season records. Supports add, edit, delete, view, and calendar navigation.
 * Table state (pagination, sorting, search) is persisted across navigation.
 */
"use client";

import { ServerSideDataTable } from "@/components/server-side-datatable";
import { seasonRoute } from "@/lib/apiRoutes";
import { columns } from "@/schemas/maintenance/seasons";
import { useSeasonsData } from "@/hooks/useSeasonsData";
import { Spinner } from "@/components/ui/skeleton";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";

export default function Page() {
	const { page, setPage, pageSize, setPageSize, search, setSearch, sorting, setSorting } = usePersistedDataTableState(
		"datatable:/Portal/Maintenance/Seasons"
	);

	const { data, isLoading } = useSeasonsData(page, pageSize, search, sorting);

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
				stateKey="datatable:/Portal/Maintenance/Seasons"
				queryKey={["seasons-datatable"]}
				pageSize={pageSize}
				onPageSizeChange={setPageSize}
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
