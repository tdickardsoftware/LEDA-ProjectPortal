/**
 * PlayerSelect (single) component
 *
 * Searchable single-player combobox within a React Hook Form context.
 * Fetches the player list from the single-player selector API endpoint.
 * Highlights players with existing trails date data (shown with a star icon)
 * and writes the selected `ledaId` and `fullName` into the bound form fields.
 */
"use client";

import React, { useState } from "react";
import { Control, FormProvider, useFormContext } from "react-hook-form";
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
import { playerRoute, singlePlayerSelectorRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { TrailsDateData } from "@/lib/definitions";
import { useQuery } from "@tanstack/react-query";

interface FormValues {
	ledaId: number;
	fullName: string;
}

interface PlaceOwnerSelectProps {
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	label: string;
	trailsDateData: TrailsDateData[];
	disabled?: boolean;
}

export default function PlayerSelect({
	control,
	name,
	label,
	trailsDateData,
	disabled,
}: PlaceOwnerSelectProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={() => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<PlaceOwnerSelectContent
								trailsDateData={trailsDateData}
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

interface PlaceOwnerSelectContentProps {
	trailsDateData: TrailsDateData[];
	disabled?: boolean;
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

const PlaceOwnerSelectContent: React.FC<PlaceOwnerSelectContentProps> = ({
	trailsDateData,
	disabled,
}) => {
	const formContext = useFormContext<FormValues>();
	const currentValue = formContext ? formContext.watch("ledaId") : "";
	const currentFullName = formContext ? formContext.watch("fullName") : "";
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");
	const [offset, setOffset] = React.useState(0);
	const [allPlayers, setAllPlayers] = React.useState<{ value: string; label: string }[]>([]);
	const [hasMore, setHasMore] = React.useState(true);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

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
	const { data: players = [], isLoading, isFetching } = useQuery({
		queryKey: ["players", trailsDateData, debouncedSearch, offset],
		queryFn: async () => {
			const params = new URLSearchParams({
				search: debouncedSearch,
				limit: "50",
				offset: offset.toString(),
			});
			const response = await fetch(`${singlePlayerSelectorRoute}?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch players");
			}
			const data = await response.json();
			
			// Filter out players already in trailsDateData
			const filteredData = data.filter(
				(type: { ledaId: string }) =>
					!trailsDateData.some(
						(trail) => Number(trail.ledaId) === Number(type.ledaId)
					)
			);
			
			// If we got fewer than 50 results, we've reached the end
			if (data.length < 50) {
				setHasMore(false);
			}
			
			return filteredData.map(
				(type: { ledaId: string; fullName: string }) => ({
					value: type.ledaId,
					label: type.ledaId + " - " + type.fullName,
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

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: { value: string; label: string }) => {
		formContext.setValue("ledaId", Number(type.value));
		formContext.setValue("fullName", type.label.split(" - ")[1]);
		setOpen(false);
		justClosedRef.current = true;
	};

	const displayValue = currentValue
		? currentFullName
			? `${currentValue} - ${currentFullName}`
			: `${currentValue}`
		: "Select a player...";

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							ref={popoverTriggerRef}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							onFocus={handleFocus}
						>
							{displayValue}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-background">
						<Command shouldFilter={true}>
							<CommandInput 
								placeholder="Search Player..." 
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>
							<CommandEmpty>
								{isLoading || isFetching ? "Loading..." : "No player found."}
							</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onScroll={handleScroll}
									onWheel={handleWheel}
								>
									{allPlayers.map((type: { value: string; label: string }) => (
										<CommandItem
											key={type.value}
											value={type.label}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === String(currentValue)
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{type.label}
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
		</div>
	);
};
