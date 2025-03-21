"use client";
import React, { useEffect, useState } from "react";
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

// Define the parameters for the SeasonCodeSelector component
interface WeekSelectorProps {
	handleSelect: (value: string) => void;
	seasonCode: string;
    disabled: boolean;
}

// SeasonCodeSelector component definition
const WeekSelector: React.FC<WeekSelectorProps> = ({
	handleSelect,
	seasonCode,
    disabled,
}) => {
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);
	// State to store the fetched season codes
	const [seasonCodes, setSeasonCodes] = useState<
		{ value: string; label: string }[]
	>([]);
	// State to store the selected season code
	const [selectedSeasonCode, setSelectedSeasonCode] = useState<string | null>(null);

	const handleSelectSeasonCode = (value: string) => {
		setSelectedSeasonCode(value);
		handleSelect(value); // Update the parent component's state
		setOpen(false);
	}

	useEffect(() => {
		async function loadSeasonCodes() {
			try {
				const response = await fetch(seasonRoute+`?seasonCode=${seasonCode}`);
				const data = await response.json();
                const dates = data.dates;
                
                const formattedDates = Object.entries(dates).map(([key, value]) => {
                    // Extract the week number from the key (e.g., "Date1" -> "1")
                    const weekNumber = key.replace("Date", "");
                    return {
                        value: key,
                        label: `Week ${weekNumber} - ${value}`
                    };
                });
                
				setSeasonCodes(formattedDates);
			} catch (error) {
				console.error("Failed to fetch season codes", error);
			}
		}
		loadSeasonCodes();
	}, [seasonCode]);

	// Update selectedSeasonCode when seasonCode prop changes
	useEffect(() => {
		setSelectedSeasonCode(seasonCode);
	}, [seasonCode]);

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							>
							<span className="truncate">
								{selectedSeasonCode 
									? seasonCodes.find(
											(type) => type.value === selectedSeasonCode
									)?.label
									: "Select a Week..."}
							</span>
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-white"
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
												handleSelectSeasonCode(type.value);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === selectedSeasonCode
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
