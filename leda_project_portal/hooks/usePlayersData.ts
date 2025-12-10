import { useQuery } from "@tanstack/react-query";
import { PlayerDataTable } from "@/lib/definitions";

interface PaginatedPlayersResponse {
	data: PlayerDataTable[];
	pagination: {
		page: number;
		pageSize: number;
		totalRecords: number;
		totalPages: number;
	};
}

export function usePlayersData(page: number, pageSize: number, search: string) {
	return useQuery<PaginatedPlayersResponse>({
		queryKey: ["players-datatable", page, pageSize, search],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				...(search && { search }),
			});

			const response = await fetch(`/api/management/player/datatable?${params}`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch players");
			}

			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep previous data while fetching new
	});
}
