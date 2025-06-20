import { useState, useEffect } from 'react';
import { TeamData, PlaceApiResponse } from '@/lib/schedule';
import { placeRoute } from '@/lib/apiRoutes';

export function usePlaceNames(teams: Record<string, TeamData>) {
	const [placeNames, setPlaceNames] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchPlaceNames = async () => {
			const uniquePlaceIds = [...new Set(Object.values(teams).map(team => team.placeId))];
			
			if (uniquePlaceIds.length === 0) return;

			setLoading(true);
			
			try {
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
				const placeData = Object.fromEntries(placeResults);
				setPlaceNames(placeData);
			} catch (error) {
				console.error("Error fetching place names:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPlaceNames();
	}, [teams]);

	const getPlaceNameById = (placeId: string): string => {
		return placeNames[placeId] || (loading ? "Loading..." : "Unknown Location");
	};

	return { placeNames, loading, getPlaceNameById };
}
