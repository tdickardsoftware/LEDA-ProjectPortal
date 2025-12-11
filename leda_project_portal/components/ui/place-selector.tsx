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
import { placeRoute, placeSelectorRoute } from "@/lib/apiRoutes";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

// Define the form values interface
interface FormValues {
	placeId: string;
}

interface DivisionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
}

export default function PlaceSelector({
	control,
	name,
	label,
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
							<DivisionSelectorContent />
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

const DivisionSelectorContent = () => {
	const { watch, setValue } = useFormContext<FormValues>();
	const placeId = watch("placeId");
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");
	const [offset, setOffset] = React.useState(0);
	const [allPlaces, setAllPlaces] = React.useState<{ value: string; label: string }[]>([]);
	const [hasMore, setHasMore] = React.useState(true);

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
			
			const mappedData = data.map((type: { ledaId: string; name: string }) => ({
				value: type.ledaId,
				label: type.ledaId + " - " + type.name,
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
		setValue("placeId", type.value);
		setOpen(false);
		justClosedRef.current = true;
	};

	const displayValue = placeId
		? allPlaces.find((type) => type.value === placeId)?.label || placeId
		: "Select a Place";

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
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
									{allPlaces.map((type: { value: string; label: string }) => (
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
