/**
 * Hook for fetching paginated, searchable, and sortable place (venue) records
 * for the management data table. Falls back to empty results on network error
 * rather than throwing, keeping the UI functional.
 */
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

/**
 * Fetches a paginated list of places.
 * Only the first sorting entry is forwarded to the API.
 */
export function usePlacesData(
	page: number,
	pageSize: number,
	search: string,
	sorting: SortingStateLike = []
) {
	return useQuery<PaginatedPlacesResponse>({
		queryKey: ["places-datatable", page, pageSize, search, sorting],
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

				const response = await fetch(`${placeDataTableRoute}?${params}`);
				if (!response.ok) {
					// Return empty results on error instead of throwing
					console.warn("Failed to fetch places, returning empty results");
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
				console.warn("Error fetching places:", error);
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
