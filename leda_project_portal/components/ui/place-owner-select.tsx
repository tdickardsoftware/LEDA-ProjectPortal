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
import { placeOwnerRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

interface FormValues {
	contactId: string;
}

interface PlaceOwnerSelectProps {
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	label: string;
}

export default function PlaceOwnerSelect({
	control,
	name,
	label,
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
							<PlaceOwnerSelectContent />
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

const PlaceOwnerSelectContent: React.FC = () => {
	const formContext = useFormContext<FormValues>();
	const currentValue = formContext ? formContext.watch("contactId") : "";
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [offset, setOffset] = useState(0);
	const [allOwners, setAllOwners] = useState<Array<{ value: string; label: string }>>([]);
	const [selectedDisplay, setSelectedDisplay] = useState<{ value: string; label: string } | null>(null);
	const [hasMore, setHasMore] = useState(true);

	const justClosedRef = React.useRef(false);
	const closeFromTabRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();
	const scrollRef = React.useRef<HTMLDivElement>(null);
	const isFetchingMore = React.useRef(false);

	const focusAdjacentField = React.useCallback((direction: "next" | "prev") => {
		const trigger = popoverTriggerRef.current;
		if (!trigger) return;

		const root = trigger.closest("form") ?? trigger.closest("[role='dialog']") ?? document;
		const focusableSelector =
			"a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

		const focusables = Array.from(
			root.querySelectorAll<HTMLElement>(focusableSelector)
		).filter((el) => {
			if (el.hasAttribute("disabled")) return false;
			if (el.getAttribute("aria-disabled") === "true") return false;
			if (el.tabIndex < 0) return false;
			if (el.offsetParent === null) {
				const style = window.getComputedStyle(el);
				if (style.position !== "fixed") return false;
			}
			return true;
		});

		const index = focusables.indexOf(trigger);
		if (index === -1) return;
		const nextIndex = direction === "next" ? index + 1 : index - 1;
		const nextEl = focusables[nextIndex];
		if (nextEl) nextEl.focus();
	}, []);

	// Debounce search input
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setOffset(0); // Reset offset when search changes
			setAllOwners([]); // Clear existing results
			setHasMore(true); // Reset hasMore flag
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch records based on search and offset
	const { data: owners = [], isLoading, isFetching } = useQuery({
		queryKey: ["placeOwners", debouncedSearch, offset],
		queryFn: async () => {
			const params = new URLSearchParams({
				search: debouncedSearch,
				limit: "50",
				offset: offset.toString(),
			});
			const response = await fetch(`${placeOwnerRoute}?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch place owners");
			}
			const data = await response.json();
			
			// If we got fewer than 50 results, we've reached the end
			if (data.length < 50) {
				setHasMore(false);
			}
			
			const mappedData = data.map((type: { ledaId: string; fullName: string }) => ({
				value: type.ledaId,
				label: type.ledaId + " - " + type.fullName,
			}));
			
			return mappedData;
		},
		staleTime: 0, // Don't cache - always fetch fresh
		enabled: open, // Only fetch when dropdown is open
		refetchOnMount: true, // Refetch when component mounts
	});

	// Append new owners to the list when they arrive
	React.useEffect(() => {
		if (owners.length > 0 && !isFetching) {
			if (offset === 0) {
				// First batch or new search - replace with None/Unknown option
				setAllOwners([
					{ value: "0", label: "0 - None/Unknown" },
					...owners,
				]);
			} else {
				// Subsequent batches - append to existing
				setAllOwners(prev => [...prev, ...owners]);
			}
			isFetchingMore.current = false;
		}
	}, [owners, offset, isFetching]);

	// Handle scroll to load more
	const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;
		
		if (isNearBottom && hasMore && !isFetching && !isFetchingMore.current) {
			isFetchingMore.current = true;
			setOffset(prev => prev + 50);
		}
	}, [hasMore, isFetching]);

	// Handle wheel events to allow smooth scrolling
	const handleWheel = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
		e.stopPropagation();
	}, []);

	// Fetch the selected owner's details if not in current list
	const { data: selectedOwner } = useQuery({
		queryKey: ["placeOwner", currentValue],
		queryFn: async () => {
			if (!currentValue || currentValue === "0") return null;
			// Check if already in list
			if (allOwners.find(o => o.value === currentValue)) return null;
			
			// Fetch specific owner by ID
			const params = new URLSearchParams({
				search: currentValue,
				limit: "1",
				offset: "0",
			});
			const response = await fetch(`${placeOwnerRoute}?${params}`);
			if (!response.ok) return null;
			const data = await response.json();
			if (data.length > 0) {
				return {
					value: data[0].ledaId,
					label: data[0].ledaId + " - " + data[0].fullName,
				};
			}
			return null;
		},
		enabled: !!currentValue && currentValue !== "0",
	});

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: { value: string; label: string }) => {
		formContext.setValue("contactId", type.value);
		setSelectedDisplay(type);
		setOpen(false);
		setSearchQuery(""); // Reset search when selected
		justClosedRef.current = true;
	};

	// Reset search and state when dropdown closes
	React.useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setOffset(0);
			setAllOwners([]);
			setHasMore(true);
		}
	}, [open]);

	// Get display label for selected value
	const getDisplayLabel = () => {
		if (!currentValue) return "Select a place owner...";
		if (currentValue === "0") return "0 - None/Unknown";
		if (selectedDisplay && selectedDisplay.value === currentValue) return selectedDisplay.label;
		
		const found = allOwners.find((type) => type.value === currentValue);
		if (found) return found.label;
		
		if (selectedOwner) return selectedOwner.label;
		
		return `ID: ${currentValue}`;
	};

	// Keep the trigger label stable even when the dropdown closes and clears its results.
	React.useEffect(() => {
		if (!currentValue) {
			setSelectedDisplay(null);
			return;
		}
		if (currentValue === "0") {
			setSelectedDisplay({ value: "0", label: "0 - None/Unknown" });
			return;
		}
		// If we fetched the selected owner label, cache it.
		if (selectedOwner && selectedOwner.value === currentValue) {
			setSelectedDisplay(selectedOwner);
		}
	}, [currentValue, selectedOwner]);

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
							{getDisplayLabel()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-background"
						onKeyDownCapture={(e) => {
							if (e.key === "Tab") {
								closeFromTabRef.current = true;
								e.preventDefault();
								setOpen(false);
								justClosedRef.current = true;
								const direction = e.shiftKey ? "prev" : "next";
								requestAnimationFrame(() => focusAdjacentField(direction));
							}
						}}
						onFocusOutside={() => {
							setOpen(false);
							justClosedRef.current = true;
						}}
						onCloseAutoFocus={(e) => {
							if (closeFromTabRef.current) {
								e.preventDefault();
								closeFromTabRef.current = false;
							}
						}}
					>
						<Command shouldFilter={true}>
							<CommandInput 
								placeholder="Search place owner..." 
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>
							<CommandEmpty>
								{isLoading ? "Searching..." : "No place owner found."}
							</CommandEmpty>
							<CommandGroup>
								<CommandList
									ref={scrollRef}
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onScroll={handleScroll}
									onWheel={handleWheel}
								>
									{allOwners.map((type: { value: string; label: string }) => (
										<CommandItem
											key={type.value}
											value={type.label}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === currentValue
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{type.label}
										</CommandItem>
									))}
									{isFetching && offset > 0 && (
										<div className="p-2 text-xs text-muted-foreground text-center">
											Loading more...
										</div>
									)}
									{!hasMore && allOwners.length > 1 && (
										<div className="p-2 text-xs text-muted-foreground text-center">
											No more results
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