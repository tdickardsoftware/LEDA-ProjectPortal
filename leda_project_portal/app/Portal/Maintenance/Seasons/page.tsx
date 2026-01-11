"use client";

import { ServerSideDataTable } from "@/components/server-side-datatable";
import { seasonRoute } from "@/lib/apiRoutes";
import { columns } from "@/schemas/maintenance/seasons";
import { useSeasonsData } from "@/hooks/useSeasonsData";
import { useState } from "react";
import { Spinner } from "@/components/ui/skeleton";

export default function Page() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const pageSize = 10;

	const { data, isLoading, error } = useSeasonsData(page, pageSize, search);

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
				totalPages={data?.pagination.totalPages || 1}
				currentPage={page}
				onPageChange={setPage}
				onSearchChange={setSearch}
				searchValue={search}
			/>
		</div>
	);
}
