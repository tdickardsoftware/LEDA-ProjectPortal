"use client";

/**
 * TeamLeagueHistory
 *
 * Renders a read-only table of every league season a team has participated in.
 * Data is fetched from `/api/management/team/leagueHistory` via TanStack Query,
 * keyed by `teamData.teamId`. Columns: season, division, subdivision, final
 * standings, and record.
 */

import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type LeagueHistory = {
	seasonCode: string;
	ledaId: number;
	teamLabel: string;
	totalPoints: number;
};

export default function TeamLeagueHistory({ ledaId }: { ledaId: number }) {
	const {
		data: leagueHistory = [],
		isLoading,
		error,
	} = useQuery<LeagueHistory[]>({
		queryKey: ["teamLeagueHistory", ledaId],
		queryFn: async () => {
			const res = await fetch(
				`/api/management/team/leagueHistory?ledaId=${ledaId}`
			);
			if (!res.ok) throw new Error("Failed to fetch league history");
			return await res.json();
		},
	});

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold mb-4">Team League History</h1>
			{isLoading ? (
				<p className="text-muted-foreground italic">
					Loading league history...
				</p>
			) : error ? (
				<p className="text-red-500">
					{(error as Error).message || "Failed to load league history data"}
				</p>
			) : leagueHistory.length === 0 ? (
				<p className="text-muted-foreground">
					No league history found for this team.
				</p>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Season Code</TableHead>
								<TableHead>Team Label</TableHead>
								<TableHead>Total Points</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{leagueHistory.map((entry, idx) => (
								<TableRow key={idx}>
									<TableCell>{entry.seasonCode}</TableCell>
									<TableCell>{entry.teamLabel}</TableCell>
									<TableCell>{entry.totalPoints}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}