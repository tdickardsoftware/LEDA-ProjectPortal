"use client";

/**
 * TeamPlayerTable
 *
 * Renders the game-participation grid for a single team (home or away).
 * Each row = one player; each column = one game (11 total).
 * Cells are toggled by clicking; a Mentions button opens the mention dialog.
 * Temp players are shown with a "(Temp)" badge next to their name.
 *
 * Rows support two reorder mechanisms:
 *  - Native HTML5 drag-and-drop via the GripVertical handle
 *  - Click-to-swap via the ArrowLeftRight icon (appears on row hover or
 *    while the row is the pending swap source)
 */

import { useState, useEffect } from "react";
import { X, GripVertical, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TeamGameData } from "@/lib/weekly-scoresheet-definitions";

// Minimal player shape required by this table — satisfied by both Player and TempPlayer display objects
export interface DisplayPlayer {
	ledaId: number;
	fullName: string;
	isTemp?: boolean;
}

interface TeamPlayerTableProps {
	players: DisplayPlayer[];
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
	const [orderedPlayers, setOrderedPlayers] = useState<DisplayPlayer[]>(players);
	const [draggedId, setDraggedId] = useState<number | null>(null);
	// null  = not in swap mode
	// number = the ledaId of the player awaiting a swap partner
	const [swapPendingId, setSwapPendingId] = useState<number | null>(null);

	// Sync when the set of player IDs changes (new matchup loaded, temp player added/removed).
	// Preserve existing order for IDs that are still present; append newcomers at the end.
	const playersKey = players.map((p) => p.ledaId).join(",");
	useEffect(() => {
		setOrderedPlayers((prev) => {
			const newIdSet = new Set(players.map((p) => p.ledaId));
			const kept = prev.filter((p) => newIdSet.has(p.ledaId));
			const keptIds = new Set(kept.map((p) => p.ledaId));
			const added = players.filter((p) => !keptIds.has(p.ledaId));
			return [...kept, ...added];
		});
		setDraggedId(null);
		setSwapPendingId(null);
	// playersKey is a stable derived string — safe to use instead of the array ref
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playersKey]);

	// Drag-and-drop: swap dragged row with drop target
	const handleDrop = (targetId: number) => {
		if (draggedId === null || draggedId === targetId) {
			setDraggedId(null);
			return;
		}
		setOrderedPlayers((prev) => {
			const next = [...prev];
			const fromIdx = next.findIndex((p) => p.ledaId === draggedId);
			const toIdx = next.findIndex((p) => p.ledaId === targetId);
			if (fromIdx === -1 || toIdx === -1) return prev;
			[next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
			return next;
		});
		setDraggedId(null);
	};

	// Swap-icon click: first click selects source, second click performs the swap
	const handleSwapClick = (playerId: number) => {
		if (swapPendingId === null) {
			setSwapPendingId(playerId);
		} else if (swapPendingId === playerId) {
			// Cancel swap mode
			setSwapPendingId(null);
		} else {
			setOrderedPlayers((prev) => {
				const next = [...prev];
				const aIdx = next.findIndex((p) => p.ledaId === swapPendingId);
				const bIdx = next.findIndex((p) => p.ledaId === playerId);
				if (aIdx === -1 || bIdx === -1) return prev;
				[next[aIdx], next[bIdx]] = [next[bIdx], next[aIdx]];
				return next;
			});
			setSwapPendingId(null);
		}
	};

	const inSwapMode = swapPendingId !== null;

	return (
		<div className="overflow-x-auto">
			{inSwapMode && (
				<p className="mb-2 text-sm text-blue-600 dark:text-blue-400 px-1">
					Swap mode — click another player to swap positions, or click the swap icon again to cancel.
				</p>
			)}
			<Table>
				<TableHeader>
					<TableRow>
						{/* grip column */}
						<TableHead className="w-6 p-0" />
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
					{orderedPlayers.map((player) => {
						const isPending = swapPendingId === player.ledaId;
						const isSwapTarget = inSwapMode && !isPending;

						return (
							<TableRow
								key={player.ledaId}
								draggable
								onDragStart={() => setDraggedId(player.ledaId)}
								onDragOver={(e) => e.preventDefault()}
								onDrop={() => handleDrop(player.ledaId)}
								onDragEnd={() => setDraggedId(null)}
								onClick={() => {
									// Clicking anywhere on a row while in swap mode (and
									// this row is not the source) completes the swap.
									if (isSwapTarget) handleSwapClick(player.ledaId);
								}}
								className={[
									"group transition-opacity",
									draggedId === player.ledaId ? "opacity-40" : "opacity-100",
									isPending ? "ring-2 ring-inset ring-blue-500" : "",
									isSwapTarget ? "cursor-pointer hover:ring-2 hover:ring-inset hover:ring-blue-300" : "",
								].join(" ")}
							>
								{/* Drag handle */}
								<TableCell className="w-6 p-1 cursor-grab active:cursor-grabbing">
									<GripVertical className="h-4 w-4 text-muted-foreground" />
								</TableCell>

								{/* Player name + swap icon */}
								<TableCell className="w-fit">
									<div className="flex items-center gap-2">
										<span>{player.fullName}</span>
										{player.isTemp && (
											<span className="text-xs text-amber-600 border border-amber-400 rounded px-1">
												Temp
											</span>
										)}
										<button
											className={[
												"rounded transition-opacity",
												isPending
													? "opacity-100 text-blue-600 dark:text-blue-400"
													: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground",
											].join(" ")}
											title={isPending ? "Cancel swap" : "Swap player position"}
											onClick={(e) => {
												e.stopPropagation();
												handleSwapClick(player.ledaId);
											}}
										>
											<ArrowLeftRight className="h-4 w-4" />
										</button>
									</div>
								</TableCell>

								{/* Mentions button */}
								<TableCell>
									<Button
										variant="outline"
										className="text-xs px-2 py-1 rounded-md border-border hover:bg-muted"
										onClick={(e) => {
											e.stopPropagation();
											onMentionClick(String(player.ledaId), teamId);
										}}
									>
										<span>Mentions</span>
									</Button>
								</TableCell>

								{/* Game participation cells */}
								{Array.from({ length: 11 }).map((_, i) => {
									const gameKey = `Game ${i + 1}`;
									return (
										<TableCell
											key={i}
											className="text-center cursor-pointer"
											onClick={(e) => {
												e.stopPropagation();
												onGameToggle(teamType, String(player.ledaId), i);
											}}
										>
											<div className="border-2 border-dashed border-border w-8 h-8 mx-auto flex items-center justify-center">
												{gameData[player.ledaId]?.[gameKey] && (
													<X className="h-5 w-5 text-foreground" />
												)}
											</div>
										</TableCell>
									);
								})}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
