/**
 * WeekSelector component
 *
 * Searchable combobox for selecting a week within a given season.
 * Fetches the season's date map from the API and builds labelled week
 * entries ("Week N - YYYY-MM-DD").  When `useFinishedWeeksOnly` is true,
 * only weeks whose date is on or before today are shown.  Fires
 * `handleSelect` with the selected week key on change.
 */
"use client";
import React, { useState } from "react";
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
import { seasonRoute } from "@/lib/apiRoutes";
import { useQuery } from "@tanstack/react-query";

// Define the parameters for the SeasonCodeSelector component
interface WeekSelectorProps {
	handleSelect: (value: string) => void;
	seasonCode: string;
	disabled: boolean;
	useFinishedWeeksOnly?: boolean; // <-- new prop
}

// SeasonCodeSelector component definition
const WeekSelector: React.FC<WeekSelectorProps> = ({
	handleSelect,
	seasonCode,
	disabled,
	useFinishedWeeksOnly = false,
}) => {
	const [open, setOpen] = useState(false);
	const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
	const [selectedWeekLabel, setSelectedWeekLabel] =
		useState<string>("Select a Week...");

	const { data: seasonCodes = [] } = useQuery({
		queryKey: ["weeks", seasonCode, useFinishedWeeksOnly],
		queryFn: async () => {
			if (!seasonCode) return [];
			const response = await fetch(seasonRoute + `?seasonCode=${seasonCode}`);
			const data = await response.json();
			const dates = data.dates;
			let formattedDates = Object.entries(dates).map(
				([key, value]) => {
					const weekNumber = key.replace("Date", "");
					return {
						value: key,
						label: `Week ${weekNumber} - ${value}`,
						weekNumber: Number(weekNumber),
					};
				}
			);

			if (useFinishedWeeksOnly) {
				const finishedResp = await fetch(
					`/api/activities/scoresheets?seasonCode=${seasonCode}&countOfFinishedWeeks=true`
				);
				const finishedData = await finishedResp.json();
				const count = Number(
					finishedData.count ||
					finishedData.count_finished_weeks ||
					Object.values(finishedData)[0]
				);
				formattedDates = formattedDates.filter(
					(w) => w.weekNumber <= count
				);
			}
			return formattedDates;
		},
		enabled: !!seasonCode,
	});

	const handleSelectWeek = (value: string, label: string) => {
		// Keep local selection value for UI (e.g., 'Date3'), but send numeric '3' to parent
		setSelectedWeek(value);
		setSelectedWeekLabel(label);
		const weekNum = value.match(/\d+/)?.[0] || value;
		handleSelect(weekNum);
		setOpen(false);
	};

	React.useEffect(() => {
		setSelectedWeek(null);
		setSelectedWeekLabel("Select a Week...");
	}, [seasonCode]);

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled} className="bg-background border-border">
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
						>
							<span className="truncate">
								{selectedWeekLabel}
							</span>
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-background border-border"
						onWheel={(e) => e.stopPropagation()}
					>
						<Command>
							<CommandInput placeholder="Search Week..." />
							<CommandEmpty>No week found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{seasonCodes.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												handleSelectWeek(
													type.value,
													type.label
												);
											}}
											className="hover:bg-secondary"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === selectedWeek
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

export default WeekSelector;