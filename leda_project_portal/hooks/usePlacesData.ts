import { useQuery } from "@tanstack/react-query";
import { placeDataTableRoute } from "@/lib/apiRoutes";
import { PlaceDataTable } from "@/lib/definitions";

export interface PaginatedPlacesResponse {
	data: PlaceDataTable[];
	pagination: {
		page: number;
		pageSize: number;
		totalRecords: number;
		totalPages: number;
	};
}

type SortingStateLike = { id: string; desc: boolean }[];

export function usePlacesData(
	page: number,
	pageSize: number,
	search: string,
	sorting: SortingStateLike = []
) {
	return useQuery<PaginatedPlacesResponse>({
		queryKey: ["places-datatable", page, pageSize, search, sorting],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				search: search,
			});

			if (sorting[0]?.id) {
				params.set("sortBy", sorting[0].id);
				params.set("sortDir", sorting[0].desc ? "desc" : "asc");
			}

			const response = await fetch(`${placeDataTableRoute}?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch places");
			}
			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		placeholderData: (previousData) => previousData,
	});
}
