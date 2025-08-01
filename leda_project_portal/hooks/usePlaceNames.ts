import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeamData, PlaceApiResponse } from '@/lib/schedule';
import { placeRoute } from '@/lib/apiRoutes';

export function usePlaceNames(teams: Record<string, TeamData>) {
	const uniquePlaceIds = useMemo(
		() => [...new Set(Object.values(teams).map(team => team.placeId))],
		[teams]
	);

	const {
		data: placeNames = {},
		isLoading: loading,
	} = useQuery<Record<string, string>>({
		queryKey: ['placeNames', uniquePlaceIds],
		enabled: uniquePlaceIds.length > 0,
		queryFn: async () => {
			const placePromises = uniquePlaceIds.map(async (placeId): Promise<[string, string]> => {
				try {
					const response = await fetch(`${placeRoute}?ledaId=${placeId}`);
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					const data: PlaceApiResponse = await response.json();
					return [placeId, data.name || "Unknown Location"];
				} catch (error) {
					console.error(`Error fetching place ${placeId}:`, error);
					return [placeId, "Error loading location"];
				}
			});
			const placeResults = await Promise.all(placePromises);
			return Object.fromEntries(placeResults);
		},
	});

	const getPlaceNameById = (placeId: string): string => {
		return placeNames[placeId] || (loading ? "Loading..." : "Unknown Location");
	};

	return { placeNames, loading, getPlaceNameById };
}