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
import { playerRoute, playerSelectorRoute } from "@/lib/apiRoutes";
import {
	Tooltip,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { useQuery } from "@tanstack/react-query";

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
	onLoadingChange?: (isLoading: boolean) => void;
}

export default function PlayerSelector({
	setMemberIdList,
	existingJsonList = "{}",
	onLoadingChange,
}: PlayerSelectorProps) {
	const [open, setOpen] = useState(false);
	const [isLoadingExisting, setIsLoadingExisting] = useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");
	const [offset, setOffset] = React.useState(0);
	const [allPlayers, setAllPlayers] = React.useState<Player[]>([]);
	const [hasMore, setHasMore] = React.useState(true);

	// Reset search and state when dropdown closes
	React.useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setOffset(0);
			setAllPlayers([]);
			setHasMore(true);
		}
	}, [open]);

	// Debounce search input
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setOffset(0);
			setAllPlayers([]);
			setHasMore(true);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch records based on search and offset
	const { data: players = [], isLoading: isLoadingPlayers, isFetching } = useQuery({
		queryKey: ["players", debouncedSearch, offset],
		queryFn: async () => {
			const params = new URLSearchParams({
				search: debouncedSearch,
				limit: "50",
				offset: offset.toString(),
			});
			const response = await fetch(`${playerSelectorRoute}?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch players");
			}
			const data = await response.json();
			
			// If we got fewer than 50 results, we've reached the end
			if (data.length < 50) {
				setHasMore(false);
			}
			
			return data.map(
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
			);
		},
		staleTime: 0,
		enabled: open,
		refetchOnMount: true,
	});

	// Append new players to the list when they arrive
	React.useEffect(() => {
		if (players.length > 0 && !isFetching) {
			if (offset === 0) {
				// First batch or new search - replace
				setAllPlayers(players);
			} else {
				// Additional batches - append
				setAllPlayers(prev => [...prev, ...players]);
			}
		}
	}, [players, offset, isFetching]);

	// Handle scroll to load more
	const handleScroll = React.useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.currentTarget;
			const scrolledToBottom =
				target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

			if (scrolledToBottom && hasMore && !isFetching) {
				setOffset(prev => prev + 50);
			}
		},
		[hasMore, isFetching]
	);

	const handleWheel = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
		e.stopPropagation();
	}, []);

	const [selectedPlayers, setSelectedPlayers] = useState<
		{ ledaId: string; fullName: string; isCaptain: boolean; cannotBeCaptain: boolean }[]
	>([]);

	// Load existing selected players from JSON list
	useEffect(() => {
		async function loadExistingPlayers() {
			if (existingJsonList && existingJsonList !== "{}") {
				setIsLoadingExisting(true);
				try {
					const parsedList = JSON.parse(existingJsonList);
					const playerEntries = Object.keys(parsedList).map(
						(key) => ({
							ledaId: parsedList[key].ledaId,
							isCaptain: parsedList[key].isCaptain,
						})
					);
					// Fetch full player details for each existing player
					const updatedPlayers: Player[] = await Promise.all(
						playerEntries.map(async (entry) => {
							let cannotBeCaptain = false;
							let fullName = "";
							
							try {
								// Fetch player details including fullName
								const playerResponse = await fetch(
									`${playerSelectorRoute}?search=${encodeURIComponent(
										entry.ledaId
									)}&limit=1`
								);
								if (playerResponse.ok) {
									const playerData = await playerResponse.json();
									if (playerData.length > 0) {
										fullName = playerData[0].fullName;
										cannotBeCaptain = playerData[0].cannotBeCaptain;
									}
								}
								
								// If we didn't get cannotBeCaptain from the selector, try the other endpoint
								if (!fullName) {
									const captainResponse = await fetch(
										`${playerRoute}/canBeCaptain?ledaId=${encodeURIComponent(
											entry.ledaId
										)}`
									);
									const captainData = await captainResponse.json();
									cannotBeCaptain = !!captainData.cannotBeCaptain;
								}
							} catch (error) {
								console.error(`Failed to fetch player ${entry.ledaId}`, error);
								cannotBeCaptain = false;
							}
							
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
				} finally {
					setIsLoadingExisting(false);
				}
			}
		}
		loadExistingPlayers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [existingJsonList]);

	// Report loading state to parent
	useEffect(() => {
		if (onLoadingChange) {
			onLoadingChange(isLoadingPlayers || isLoadingExisting);
		}
	}, [isLoadingPlayers, isLoadingExisting, onLoadingChange]);

	// Filter out selected players from the list
	const availablePlayers = allPlayers.filter(
		(player: Player) => !selectedPlayers.some((p) => p.ledaId === player.ledaId)
	);

	const isLoading = isLoadingPlayers || isLoadingExisting;

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
							disabled={isLoading}
						>
							{isLoading ? (
								"Loading players..."
							) : selectedPlayers.length > 0 ? (
								`${selectedPlayers.length} player(s) selected`
							) : (
								"Select players..."
							)}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-background">
						<Command shouldFilter={true}>
							<CommandInput 
								placeholder="Search players..." 
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>
							<CommandEmpty>
								{isLoadingPlayers || isFetching ? "Loading..." : "No player found."}
							</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									onScroll={handleScroll}
									onWheel={handleWheel}
								>
									{availablePlayers.map((player: Player) => (
										<CommandItem
											key={player.ledaId}
											value={`${player.ledaId} - ${player.fullName}`}
											onSelect={() =>
												handlePlayerSelection(player)
											}
											className="hover:bg-secondary"
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
									{isFetching && (
										<div className="py-2 text-center text-sm text-muted-foreground">
											Loading more...
										</div>
									)}
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
						className="flex items-center justify-between gap-2 px-2 py-1 bg-secondary rounded"
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
															: "text-muted-foreground"
													)}
												/>
											</Button>
										</TooltipTrigger>
									)}
									<TooltipContent className="bg-background p-2 rounded shadow-lg">
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