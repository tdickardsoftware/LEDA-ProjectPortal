import { useQuery } from "@tanstack/react-query";
import { seasonDataTableRoute } from "@/lib/apiRoutes";
import { SeasonDataTable } from "@/lib/definitions";

export interface PaginatedSeasonsResponse {
	data: SeasonDataTable[];
	pagination: {
		page: number;
		pageSize: number;
		totalRecords: number;
		totalPages: number;
	};
}

export function useSeasonsData(page: number, pageSize: number, search: string) {
	return useQuery<PaginatedSeasonsResponse>({
		queryKey: ["seasons-datatable", page, pageSize, search],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				search: search,
			});

			const response = await fetch(`${seasonDataTableRoute}?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch seasons");
			}
			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData,
	});
}
