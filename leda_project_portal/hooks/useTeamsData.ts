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

export function useTeamsData(page: number, pageSize: number, search: string) {
	return useQuery<PaginatedTeamsResponse>({
		queryKey: ["teams-datatable", page, pageSize, search],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				search: search,
			});

			const response = await fetch(`${teamsDataTableRoute}?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch teams");
			}
			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData,
	});
}
