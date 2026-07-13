/**
 * PlaceSelector component
 *
 * Searchable combobox for selecting a place within a React Hook Form context.
 * Fetches the place list from the places selector API endpoint via TanStack
 * Query and writes the chosen `placeId` into the bound form field.
 *
 * Optionally accepts `placeTeamCounts`, a map of placeId -> number of teams
 * currently assigned to that place (e.g. within the roster being edited). When
 * provided, each place option and the selected value show a `PlaceCapacityBadge`
 * with "assigned/total boards" so callers can avoid over-booking a venue.
 */
"use client";

import React, { useState } from "react";
import { Control, useFormContext, FormProvider } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { placeSelectorRoute, placeRoute } from "@/lib/apiRoutes";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { PlaceCapacityBadge } from "@/components/ui/place-capacity-badge";

// Define the form values interface
interface FormValues {
	placeId: string;
}

interface DivisionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
	// Map of placeId -> number of teams currently assigned to that place.
	// When provided, a capacity badge (assigned/total boards) is shown per option.
	placeTeamCounts?: Record<string, number>;
}

export default function PlaceSelector({
	control,
	name,
	label,
	placeTeamCounts,
}: DivisionSelectorProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={() => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<DivisionSelectorContent placeTeamCounts={placeTeamCounts} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

// Utility hook to track last input type (keyboard or mouse)
function useLastInputType() {
	const [lastInputType, setLastInputType] = React.useState<"keyboard" | "mouse" | null>(null);

	React.useEffect(() => {
		const handleKeyDown = () => setLastInputType("keyboard");
		const handleMouseDown = () => setLastInputType("mouse");
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("mousedown", handleMouseDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("mousedown", handleMouseDown);
		};
	}, []);

	return lastInputType;
}

const DivisionSelectorContent = ({
	placeTeamCounts,
}: {
	placeTeamCounts?: Record<string, number>;
}) => {
	const { watch, setValue } = useFormContext<FormValues>();
	const placeId = watch("placeId");
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");
	const [offset, setOffset] = React.useState(0);
	const [allPlaces, setAllPlaces] = React.useState<{ value: string; label: string; numberOfBoards: number }[]>([]);
	const [hasMore, setHasMore] = React.useState(true);
	// Caches the resolved place for the current `placeId` so its label and capacity
	// badge stay visible after the popover closes (allPlaces is cleared on close).
	const [selectedPlaceInfo, setSelectedPlaceInfo] = React.useState<{ value: string; label: string; numberOfBoards: number } | null>(null);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	// Reset search and state when dropdown closes
	React.useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setOffset(0);
			setAllPlaces([]);
			setHasMore(true);
		}
	}, [open]);

	// Debounce search input
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setOffset(0);
			setAllPlaces([]);
			setHasMore(true);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch records based on search and offset
	const { data: places = [], isLoading, isFetching } = useQuery({
		queryKey: ["places", debouncedSearch, offset],
		queryFn: async () => {
			const params = new URLSearchParams({
				search: debouncedSearch,
				limit: "50",
				offset: offset.toString(),
			});
			const response = await fetch(`${placeSelectorRoute}?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch places");
			}
			const data = await response.json();
			
			// If we got fewer than 50 results, we've reached the end
			if (data.length < 50) {
				setHasMore(false);
			}
			
			const mappedData = data.map((type: { ledaId: string; name: string; numberOfBoards: number }) => ({
				value: type.ledaId,
				label: type.ledaId + " - " + type.name,
				numberOfBoards: type.numberOfBoards,
			}));
			
			return mappedData;
		},
		staleTime: 0,
		enabled: open,
		refetchOnMount: true,
	});

	// Append new places to the list when they arrive
	React.useEffect(() => {
		if (places.length > 0 && !isFetching) {
			if (offset === 0) {
				// First batch or new search - replace
				setAllPlaces(places);
			} else {
				// Additional batches - append
				setAllPlaces(prev => [...prev, ...places]);
			}
		}
	}, [places, offset, isFetching]);

	// Resolve and cache the currently selected place whenever it shows up in a
	// fetched batch (covers picking from the list while the dropdown is open).
	React.useEffect(() => {
		if (!placeId) return;
		const match = allPlaces.find((type) => type.value === placeId);
		if (match) setSelectedPlaceInfo(match);
	}, [placeId, allPlaces]);

	// Resolve the selected place's name/board count directly by id as soon as a
	// placeId is present, so the label shows the real name (not just the raw id)
	// as soon as the dialog loads, before the dropdown has ever been opened.
	const { data: resolvedPlace } = useQuery({
		queryKey: ["place-resolve", placeId],
		queryFn: async () => {
			const response = await fetch(`${placeRoute}?ledaId=${placeId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch place");
			}
			return response.json() as Promise<{ ledaId: number; name: string; numberOfBoards: number }>;
		},
		enabled: !!placeId && selectedPlaceInfo?.value !== placeId,
		staleTime: 1000 * 60 * 5,
	});

	React.useEffect(() => {
		if (resolvedPlace?.ledaId != null && String(resolvedPlace.ledaId) === placeId) {
			setSelectedPlaceInfo({
				value: String(resolvedPlace.ledaId),
				label: `${resolvedPlace.ledaId} - ${resolvedPlace.name}`,
				numberOfBoards: resolvedPlace.numberOfBoards,
			});
		}
	}, [resolvedPlace, placeId]);

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

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: { value: string; label: string; numberOfBoards: number }) => {
		setValue("placeId", type.value);
		setSelectedPlaceInfo(type);
		setOpen(false);
		justClosedRef.current = true;
	};

	const selectedPlace = selectedPlaceInfo?.value === placeId ? selectedPlaceInfo : undefined;
	const displayValue = selectedPlace?.label || placeId || "Select a Place";
	const selectedCapacity =
		selectedPlace && placeTeamCounts
			? placeTeamCounts[selectedPlace.value] ?? 0
			: undefined;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2 w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							ref={popoverTriggerRef}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[280px] justify-between"
							onFocus={handleFocus}
							title={displayValue}
						>
							<span className="truncate">{displayValue}</span>
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[340px] p-0 bg-background">
						<Command shouldFilter={true}>
							<CommandInput 
								placeholder="Search places..." 
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>
							<CommandEmpty>
								{isLoading || isFetching ? "Loading..." : "No place found."}
							</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onScroll={handleScroll}
									onWheel={handleWheel}
								>
									{allPlaces.map((type) => (
										<CommandItem
											key={type.value}
											value={type.label}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === placeId
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											<span className="flex-1 truncate" title={type.label}>{type.label}</span>
											{/*
											<PlaceCapacityBadge
												className="ml-2 shrink-0"
												assigned={placeTeamCounts ? placeTeamCounts[type.value] ?? 0 : undefined}
												capacity={type.numberOfBoards}
											/>
											*/}
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
				{/*
				{selectedPlace && (
					<PlaceCapacityBadge
						assigned={selectedCapacity}
						capacity={selectedPlace.numberOfBoards}
					/>
				)}
				*/}
			</div>
		</div>
	);
};
