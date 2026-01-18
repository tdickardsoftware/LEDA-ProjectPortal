"use client";

import { ServerSideDataTable } from "@/components/server-side-datatable";
import { placeRoute } from "@/lib/apiRoutes";
import { columns } from "@/schemas/managment/places";
import { usePlacesData } from "@/hooks/usePlacesData";
import { Spinner } from "@/components/ui/skeleton";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";

export default function Page() {
	const { page, setPage, search, setSearch } = usePersistedDataTableState(
		"datatable:/Portal/Management/Places"
	);
	const pageSize = 10;

	const { data, isLoading, error } = usePlacesData(page, pageSize, search);

	if (error) {
		return (
			<div className="container mx-auto py-10">
				<div className="text-center text-red-500">
					Error loading places: {(error as Error).message}
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
				pageName="Places Page"
				addDialogConfig={{
					form: "PlaceAddForm",
					title: "Add Place",
					buttonName: "Add Place +"
				}}
				deleteDialogConfig={{
					buttonName: "Delete Place",
					title: "Delete Place",
					apiEndpoint: placeRoute
				}}
				editDialogConfig={{
					form: "PlaceEditForm",
					title: "Edit Place",
					buttonName: "Edit Place"
				}}
				viewLinkConfig={{
					linkName: "View Place",
					parentPage: "Places"
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
