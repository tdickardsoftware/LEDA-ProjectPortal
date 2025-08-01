"use client";

import { useQuery } from "@tanstack/react-query";
import { Place } from "@/lib/definitions";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type TeamHistory = {
	seasonCode: string;
	teamId: number;
	teamName: string;
	teamLabel: string;
};

export default function PlaceTeamHistoryContent({
	placeData,
}: {
	placeData: Place;
}) {
	const {
		data: teamHistory = [],
		isLoading,
		error,
	} = useQuery<TeamHistory[]>({
		queryKey: ["placeTeamHistory", placeData.ledaId],
		queryFn: async () => {
			const res = await fetch(
				`/api/management/place/teamHistory?ledaId=${placeData.ledaId}`
			);
			if (!res.ok) throw new Error("Failed to fetch team history");
			return await res.json();
		},
	});

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold mb-4">Place Team History</h1>
			<h2 className="text-2xl font-semibold mb-6">
				Place: #{placeData.ledaId} - {placeData.name}
			</h2>
			{isLoading ? (
				<p className="text-gray-500 italic">Loading team history...</p>
			) : error ? (
				<p className="text-red-500">
					{(error as Error).message || "Failed to load team history data"}
				</p>
			) : teamHistory.length === 0 ? (
				<p className="text-gray-500">
					No team history found for this place.
				</p>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Season Code</TableHead>
								<TableHead>Team ID</TableHead>
								<TableHead>Team Name</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{teamHistory.map((team, idx) => (
								<TableRow key={idx}>
									<TableCell>{team.seasonCode}</TableCell>
									<TableCell>{team.teamId}</TableCell>
									<TableCell>{team.teamName}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}