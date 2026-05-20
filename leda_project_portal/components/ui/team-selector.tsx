/**
 * TeamSelector component
 *
 * Searchable combobox for selecting a team within a React Hook Form context.
 * Fetches the full team list from the team API via TanStack Query, filters
 * out already-selected teams, and writes the chosen `teamLedaId` and
 * `teamName` into the bound form fields.
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
import { teamRoute } from "@/lib/apiRoutes";
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
	teamLedaId: string;
	teamName: string;
}

interface DivisionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
	selectedTeams: string[];
}

export default function TeamSelector({
	control,
	name,
	label,
	selectedTeams,
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
							<DivisionSelectorContent
								selectedTeams={selectedTeams}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

interface DivisionSelectorContentProps {
	selectedTeams: string[];
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

const DivisionSelectorContent: React.FC<DivisionSelectorContentProps> = ({
	selectedTeams,
}) => {
	// Use form context to get watch and setValue functions
	const { watch, setValue } = useFormContext<FormValues>();
	const teamLedaId = watch("teamLedaId");
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	// Debounce search input to avoid filtering on every keystroke
	React.useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Reset search when dropdown closes
	React.useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setDebouncedSearch("");
		}
	}, [open]);

	const { data: teams = [] } = useQuery({
		queryKey: ["teams", selectedTeams],
		queryFn: async () => {
			const response = await fetch(teamRoute);
			const data = await response.json();
			return data
				.filter(
					(type: { ledaId: string }) =>
						!selectedTeams.includes(type.ledaId)
				)
				.map((type: { ledaId: string; teamName: string }) => ({
					value: type.ledaId,
					label: type.ledaId + " - " + type.teamName,
					name: type.teamName,
				}));
		},
	});

	const filteredTeams = React.useMemo(() => {
		if (!debouncedSearch) return teams;
		const lower = debouncedSearch.toLowerCase();
		return teams.filter((type: { value: string; label: string; name: string }) =>
			type.label.toLowerCase().includes(lower)
		);
	}, [teams, debouncedSearch]);

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: { value: string; label: string; name: string }) => {
		setValue("teamLedaId", type.value);
		setValue("teamName", type.name);
		setOpen(false);
		justClosedRef.current = true;
	};

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
							{teamLedaId
								? teams.find(
										(type: { value: string; label: string; name: string }) => type.value === teamLedaId
								  )?.label
								: "Select a Team"}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-background">
						<Command shouldFilter={false}>
							<CommandInput
								placeholder="Search teams..."
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>
							<CommandEmpty>No teams found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
								{filteredTeams.map((type: { value: string; label: string; name: string }) => (
										<CommandItem
											key={type.value}
											value={type.label}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === teamLedaId
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{type.label}
										</CommandItem>
									))}
								</CommandList>
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};