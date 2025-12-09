"use client";

import { PlayerMemberInfo } from "@/lib/definitions";
import { trailsPlayerHistoryRoute } from "@/lib/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface TrailsAuditRecord {
	trailsDate: string;
	previousTotalPoints: number;
	totalPoints: number;
	changeBy: number;
	modifyDate: string;
	singlesPlace: number;
	doublesPlace: number;
}

export default function PlayerTrailsHistoryContent({
	playerData,
}: {
	playerData: PlayerMemberInfo;
}) {
	const {
		data: trailsData = [],
		isLoading,
		error,
	} = useQuery<TrailsAuditRecord[]>({
		queryKey: ["playerTrailsHistory", playerData.ledaId],
		queryFn: async () => {
			const results = await fetch(
				`${trailsPlayerHistoryRoute}?ledaId=${playerData.ledaId}`,
				{
					method: "GET",
				}
			);
			if (!results.ok) {
				throw new Error("Failed to fetch trails data");
			}
			return await results.json();
		},
	});

	return (
		<div className="container mx-auto p-6">
			<div>
				<h1 className="text-4xl font-bold mb-4">
					Player Trails History
				</h1>
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-semibold mb-6">
						Player: #{playerData.ledaId} - {playerData.fullName}
					</h2>
				</div>

				{isLoading ? (
					<p className="text-muted-foreground italic">
						Loading trails history...
					</p>
				) : error ? (
					<p className="text-red-500">
						{(error as Error).message || "Failed to load trails history data"}
					</p>
				) : trailsData.length === 0 ? (
					<p className="text-muted-foreground">
						No trails history found for this player.
					</p>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Trails Date</TableHead>
									<TableHead>Singles Place</TableHead>
									<TableHead>Doubles Place</TableHead>
									<TableHead>Previous Points</TableHead>
									<TableHead>Total Points</TableHead>
									<TableHead>Change</TableHead>
									<TableHead>Modified On</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="max-h-[400px] overflow-y-auto">
								{trailsData.map((record, index) => (
									<TableRow key={index}>
										<TableCell>
											{new Date(
												record.trailsDate
											).toLocaleDateString()}
										</TableCell>
										<TableCell>
											{record.singlesPlace}
										</TableCell>
										<TableCell>
											{record.doublesPlace}
										</TableCell>
										<TableCell>
											{record.previousTotalPoints}
										</TableCell>
										<TableCell>
											{record.totalPoints}
										</TableCell>
										<TableCell>
											<span
												className={
													record.changeBy >= 0
														? "text-green-600"
														: "text-red-600"
												}
											>
												{record.changeBy >= 0
													? "+"
													: ""}
												{record.changeBy}
											</span>
										</TableCell>
										<TableCell>
											{new Date(
												record.modifyDate
											).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
}
