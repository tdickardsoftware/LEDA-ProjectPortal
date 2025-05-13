"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { playerRoute } from "@/lib/apiRoutes";
import {
	Tooltip,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";

// Define the player interface
interface Player {
	ledaId: string;
	fullName: string;
	isCaptain: boolean;
	cannotBeCaptain: boolean;
}

interface PlayerSelectorProps {
	setMemberIdList: (memberIdList: string) => void;
	existingJsonList?: string;
}

export default function PlayerSelector({
	setMemberIdList,
	existingJsonList = "{}",
}: PlayerSelectorProps) {
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);
	// State to store the fetched players
	const [players, setPlayers] = useState<Player[]>([]);
	// State to store the selected players
	const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

	// Fetch players from the API endpoint
	useEffect(() => {
		async function loadPlayers() {
			try {
				const response = await fetch(playerRoute);
				const data = await response.json();
				setPlayers(
					data.map(
						(player: {
							ledaId: string;
							fullName: string;
							cannotBeCaptain: boolean;
						}) => ({
							ledaId: player.ledaId,
							fullName: player.fullName,
							cannotBeCaptain: player.cannotBeCaptain,
							isCaptain: false,
						})
					)
				);
			} catch (error) {
				console.error("Failed to fetch players", error);
			}
		}
		loadPlayers();
	}, []);

	// Load existing selected players from JSON list
	useEffect(() => {
		async function loadExistingPlayers() {
			if (existingJsonList) {
				try {
					const parsedList = JSON.parse(existingJsonList);
					const playerEntries = Object.keys(parsedList).map(
						(key) => ({
							ledaId: parsedList[key].ledaId,
							isCaptain: parsedList[key].isCaptain,
						})
					);
					// Fetch cannotBeCaptain for each player
					const updatedPlayers: Player[] = await Promise.all(
						playerEntries.map(async (entry) => {
							let cannotBeCaptain = false;
							try {
								const response = await fetch(
									`${playerRoute}/canBeCaptain?ledaId=${encodeURIComponent(
										entry.ledaId
									)}`
								);
								const data = await response.json();
								cannotBeCaptain = !!data.cannotBeCaptain;
							} catch {
								cannotBeCaptain = false;
							}
							const fullName =
								players.find((p) => p.ledaId === entry.ledaId)
									?.fullName || "";
							return {
								ledaId: entry.ledaId,
								fullName,
								isCaptain: entry.isCaptain,
								cannotBeCaptain,
							};
						})
					);
					setSelectedPlayers(updatedPlayers);
				} catch (error) {
					console.error("Failed to parse existing JSON list", error);
				}
			}
		}
		loadExistingPlayers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [existingJsonList, players]);

	// Filter out selected players from the list
	const availablePlayers = players.filter(
		(player) => !selectedPlayers.some((p) => p.ledaId === player.ledaId)
	);

	// Generate the stringified JSON list
	const generateJsonList = (players: Player[]) => {
		const jsonList = players.reduce((acc, player, index) => {
			acc[`player${index + 1}`] = {
				ledaId: player.ledaId,
				isCaptain: player.isCaptain,
			};
			return acc;
		}, {} as Record<string, { ledaId: string; isCaptain: boolean }>);
		return JSON.stringify(jsonList, null, 2);
	};

	// Handle captain selection
	const handleCaptainSelection = (
		playerId: string,
		event: React.MouseEvent
	) => {
		event.preventDefault();
		const updatedPlayers = selectedPlayers.map((player) =>
			player.ledaId === playerId && !player.cannotBeCaptain
				? { ...player, isCaptain: !player.isCaptain }
				: { ...player, isCaptain: false }
		);
		setSelectedPlayers(updatedPlayers);
		setMemberIdList(generateJsonList(updatedPlayers));
	};

	// Handle player selection
	const handlePlayerSelection = async (player: Player) => {
		try {
			const response = await fetch(
				`${playerRoute}/canBeCaptain?ledaId=${encodeURIComponent(
					player.ledaId
				)}`
			);
			const data = await response.json();
			const cannotBeCaptain = !!data.cannotBeCaptain;

			const updatedPlayer = {
				...player,
				cannotBeCaptain,
				isCaptain: false,
			};
			const updatedPlayers = [...selectedPlayers, updatedPlayer];
			setSelectedPlayers(updatedPlayers);
			setMemberIdList(generateJsonList(updatedPlayers));
			setOpen(false);
		} catch (error) {
			console.error("Failed to check if player can be captain", error);
			// fallback: add player as before, but mark cannotBeCaptain as false
			const updatedPlayer = {
				...player,
				cannotBeCaptain: false,
				isCaptain: false,
			};
			const updatedPlayers = [...selectedPlayers, updatedPlayer];
			setSelectedPlayers(updatedPlayers);
			setMemberIdList(generateJsonList(updatedPlayers));
			setOpen(false);
		}
	};

	// Handle player removal
	const handlePlayerRemoval = (playerId: string) => {
		const updatedPlayers = selectedPlayers.filter(
			(p) => p.ledaId !== playerId
		);
		setSelectedPlayers(updatedPlayers);
		setMemberIdList(generateJsonList(updatedPlayers));
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
						>
							{selectedPlayers.length > 0
								? `${selectedPlayers.length} player(s) selected`
								: "Select players..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search players..." />
							<CommandEmpty>No player found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{availablePlayers.map((player) => (
										<CommandItem
											key={player.ledaId}
											value={player.ledaId}
											onSelect={() =>
												handlePlayerSelection(player)
											}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													selectedPlayers.some(
														(p) =>
															p.ledaId ===
															player.ledaId
													)
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{player.ledaId} - {player.fullName}
										</CommandItem>
									))}
								</CommandList>
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
			{/* Display selected players */}
			<div className="flex flex-col gap-2">
				{selectedPlayers.map((player) => (
					<div
						key={player.ledaId}
						className="flex items-center justify-between gap-2 px-2 py-1 bg-gray-200 rounded"
					>
						<div className="flex items-center gap-2">
							<span>{player.fullName}</span>
							<TooltipProvider>
								<Tooltip>
									{!player.cannotBeCaptain && (
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												type="button"
												onClick={(event) =>
													handleCaptainSelection(
														player.ledaId,
														event
													)
												}
											>
												<Star
													className={cn(
														"h-4 w-4",
														player.isCaptain
															? "text-yellow-500"
															: "text-gray-400"
													)}
												/>
											</Button>
										</TooltipTrigger>
									)}
									<TooltipContent className="bg-white p-2 rounded shadow-lg">
										<p>
											{player.cannotBeCaptain
												? "Cannot be Captain"
												: "Set as Captain"}
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<Button
							variant="ghost"
							size="sm"
							type="button"
							onClick={() => handlePlayerRemoval(player.ledaId)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
