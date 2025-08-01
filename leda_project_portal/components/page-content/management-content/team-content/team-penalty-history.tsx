"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type PenaltyHistory = {
	seasonCode: string;
	weekNum: number;
	team_id: number;
	penaltycode: string;
	points: number;
	notes: string;
	teamlabel: string;
};

export default function TeamPenaltyHistory({ ledaId }: { ledaId: number }) {
	const {
		data: penaltyHistory = [],
		isLoading,
		error,
	} = useQuery<PenaltyHistory[]>({
		queryKey: ["teamPenaltyHistory", ledaId],
		queryFn: async () => {
			const res = await fetch(
				`/api/management/team/penaltyHistory?ledaId=${ledaId}`
			);
			if (!res.ok) throw new Error("Failed to fetch penalty history");
			return await res.json();
		},
	});

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold mb-4">Team Penalty History</h1>
			{isLoading ? (
				<p className="text-gray-500 italic">
					Loading penalty history...
				</p>
			) : error ? (
				<p className="text-red-500">
					{(error as Error).message || "Failed to load penalty history data"}
				</p>
			) : penaltyHistory.length === 0 ? (
				<p className="text-gray-500">
					No penalty history found for this team.
				</p>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Season Code</TableHead>
								<TableHead>Week</TableHead>
								<TableHead>Penalty Code</TableHead>
								<TableHead>Points</TableHead>
								<TableHead>Notes</TableHead>
								<TableHead>Team Label</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{penaltyHistory.map((penalty, idx) => (
								<TableRow key={idx}>
									<TableCell>{penalty.seasonCode}</TableCell>
									<TableCell>{penalty.weekNum}</TableCell>
									<TableCell>{penalty.penaltycode}</TableCell>
									<TableCell>{penalty.points}</TableCell>
									<TableCell>{penalty.notes}</TableCell>
									<TableCell>{penalty.teamlabel}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}