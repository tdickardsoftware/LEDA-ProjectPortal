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

type SortingStateLike = { id: string; desc: boolean }[];

export function usePlayersData(
	page: number,
	pageSize: number,
	search: string,
	sorting: SortingStateLike = []
) {
	return useQuery<PaginatedPlayersResponse>({
		queryKey: ["players-datatable", page, pageSize, search, sorting],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				...(search && { search }),
			});

			if (sorting[0]?.id) {
				params.set("sortBy", sorting[0].id);
				params.set("sortDir", sorting[0].desc ? "desc" : "asc");
			}

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
