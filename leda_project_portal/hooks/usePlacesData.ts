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

export function usePlacesData(page: number, pageSize: number, search: string) {
	return useQuery<PaginatedPlacesResponse>({
		queryKey: ["places-datatable", page, pageSize, search],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				search: search,
			});

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
