/**
 * Hook that resolves venue/place names for a set of teams.
 * Deduplicates place IDs and fetches names in a single batch request
 * to avoid N+1 API calls on the schedule page.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeamData } from '@/lib/schedule';
import { placeRoute } from '@/lib/apiRoutes';
import { fetchWithSession } from '@/lib/getData';

/**
 * Accepts a map of teams keyed by letter and returns a place-name lookup,
 * a loading flag, and a `getPlaceNameById` helper.
 */
export function usePlaceNames(teams: Record<string, TeamData>) {
	const uniquePlaceIds = useMemo(
		() => [...new Set(Object.values(teams).map(team => team.placeId))],
		[teams]
	);

	const {
		data: placeNames = {},
		isLoading: loading,
	} = useQuery<Record<string, string>>({
		queryKey: ['batchPlaceNames', uniquePlaceIds],
		enabled: uniquePlaceIds.length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes - places don't change often
		queryFn: async () => {
			// Use batch API instead of individual calls
			const response = await fetchWithSession(`${placeRoute}/batch`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					placeIds: uniquePlaceIds,
				}),
			});

			if (!response.ok) {
				throw new Error(`Batch place fetch failed: ${response.status}`);
			}

			const placesMap: Record<string, string> = await response.json();
			return placesMap;
		},
	});

	const getPlaceNameById = (placeId: string): string => {
		return placeNames[placeId] || (loading ? "Loading..." : "Unknown Location");
	};

	return { placeNames, loading, getPlaceNameById };
}