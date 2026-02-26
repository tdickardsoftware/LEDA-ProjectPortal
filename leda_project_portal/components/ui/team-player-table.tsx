"use client";

/**
 * TeamPlayerTable
 *
 * Renders the game-participation grid for a single team (home or away).
 * Each row = one player; each column = one game (11 total).
 * Cells are toggled by clicking; a Mentions button opens the mention dialog.
 */

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Player } from "@/lib/definitions";
import { TeamGameData } from "@/lib/weekly-scoresheet-definitions";

interface TeamPlayerTableProps {
	players: Player[];
	teamType: "home" | "away";
	teamId: string;
	gameData: TeamGameData;
	onGameToggle: (
		teamType: "home" | "away",
		playerId: string,
		gameIndex: number
	) => void;
	onMentionClick: (playerId: string, teamId: string) => void;
}

export default function TeamPlayerTable({
	players,
	teamType,
	teamId,
	gameData,
	onGameToggle,
	onMentionClick,
}: TeamPlayerTableProps) {
	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Player Name</TableHead>
						<TableHead />
						{Array.from({ length: 11 }).map((_, i) => (
							<TableHead key={i} className="text-center">
								Game {i + 1}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{players.map((player) => (
						<TableRow key={player.ledaId}>
							<TableCell className="w-fit flex items-center gap-2">
								<span>{player.fullName}</span>
							</TableCell>
							<TableCell>
								<Button
									variant="outline"
									className="text-xs px-2 py-1 rounded-md border-border hover:bg-muted"
									onClick={() =>
										onMentionClick(
											String(player.ledaId),
											teamId
										)
									}
								>
									<span>Mentions</span>
								</Button>
							</TableCell>
							{Array.from({ length: 11 }).map((_, i) => {
								const gameKey = `Game ${i + 1}`;
								return (
									<TableCell
										key={i}
										className="text-center cursor-pointer"
										onClick={() =>
											onGameToggle(
												teamType,
												String(player.ledaId),
												i
											)
										}
									>
										<div className="border-2 border-dashed border-border w-8 h-8 mx-auto flex items-center justify-center">
											{gameData[player.ledaId]?.[
												gameKey
											] && (
												<X className="h-5 w-5 text-foreground" />
											)}
										</div>
									</TableCell>
								);
							})}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
