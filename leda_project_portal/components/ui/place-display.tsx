"use client";

/**
 * PlaceDisplay
 *
 * Read-only display of a place's name and board capacity, resolved by
 * ledaId. Useful for showing a previously-selected place (e.g. a season's
 * backup location) without rendering the full PlaceSelector combobox.
 */

import { useQuery } from "@tanstack/react-query";
import { placeRoute } from "@/lib/apiRoutes";
import { PlaceCapacityBadge } from "@/components/ui/place-capacity-badge";

export default function PlaceDisplay({
	placeId,
	emptyText = "Not set",
	assigned,
	showCapacity = true,
}: {
	placeId?: string | null;
	emptyText?: string;
	// Number of teams currently assigned to this place, shown as an
	// "assigned/total boards" ratio badge. Omit for a plain total.
	assigned?: number;
	// Set to false to render just the name, with no board capacity badge.
	showCapacity?: boolean;
}) {
	const { data: place, isLoading } = useQuery({
		queryKey: ["place-resolve", placeId],
		queryFn: async () => {
			const response = await fetch(`${placeRoute}?ledaId=${placeId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch place");
			}
			return response.json() as Promise<{ ledaId: number; name: string; numberOfBoards: number }>;
		},
		enabled: !!placeId,
		staleTime: 1000 * 60 * 5,
	});

	if (!placeId) {
		return <p className="text-sm text-muted-foreground">{emptyText}</p>;
	}

	if (isLoading || !place) {
		return <p className="text-sm text-muted-foreground">Loading...</p>;
	}

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium">{place.ledaId} - {place.name}</span>
			{showCapacity && (
				<PlaceCapacityBadge assigned={assigned} capacity={place.numberOfBoards} />
			)}
		</div>
	);
}
