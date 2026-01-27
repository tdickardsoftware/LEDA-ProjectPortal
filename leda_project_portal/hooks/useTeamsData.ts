import { useQuery } from "@tanstack/react-query";
import { teamsDataTableRoute } from "@/lib/apiRoutes";
import { TeamDataTable } from "@/lib/definitions";

export interface PaginatedTeamsResponse {
	data: TeamDataTable[];
	pagination: {
		page: number;
		pageSize: number;
		totalRecords: number;
		totalPages: number;
	};
}

type SortingStateLike = { id: string; desc: boolean }[];

export function useTeamsData(
	page: number,
	pageSize: number,
	search: string,
	sorting: SortingStateLike = []
) {
	return useQuery<PaginatedTeamsResponse>({
		queryKey: ["teams-datatable", page, pageSize, search, sorting],
		queryFn: async () => {
			try {
				const params = new URLSearchParams({
					page: page.toString(),
					pageSize: pageSize.toString(),
					search: search,
				});

				if (sorting[0]?.id) {
					params.set("sortBy", sorting[0].id);
					params.set("sortDir", sorting[0].desc ? "desc" : "asc");
				}

				const response = await fetch(`${teamsDataTableRoute}?${params}`);
				if (!response.ok) {
					// Return empty results on error instead of throwing
					console.warn("Failed to fetch teams, returning empty results");
					return {
						data: [],
						pagination: {
							page: 1,
							pageSize: pageSize,
							totalRecords: 0,
							totalPages: 1,
						},
					};
				}
				return response.json();
			} catch (error) {
				// Catch any network or parsing errors
				console.warn("Error fetching teams:", error);
				return {
					data: [],
					pagination: {
						page: 1,
						pageSize: pageSize,
						totalRecords: 0,
						totalPages: 1,
					},
				};
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData,
	});
}
