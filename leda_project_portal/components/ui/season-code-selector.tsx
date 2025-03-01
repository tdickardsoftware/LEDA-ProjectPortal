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
import { seasonCodeRoute } from "@/lib/apiRoutes";

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorProps {
	disabled?: boolean;
	handleSelect: (value: string) => void;
	label: string;
}

// SeasonCodeSelector component definition
const SeasonCodeSelector: React.FC<SeasonCodeSelectorProps> = ({
	disabled,
	handleSelect,
}) => {
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);
	// State to store the fetched season codes
	const [seasonCodes, setSeasonCodes] = useState<
		{ value: string; label: string }[]
	>([]);
	// State to store the selected season code
	const [selectedSeasonCode, setSelectedSeasonCode] = useState<string | null>(null);

	// Fetch season codes from the API endpoint
	useEffect(() => {
		async function loadSeasonCodes() {
			try {
				const response = await fetch(seasonCodeRoute);
				const data = await response.json();
				setSeasonCodes(
					data.map((type: { seasonCode: string; desc: string }) => ({
						value: type.seasonCode,
						label: type.seasonCode + " - " + type.desc,
					}))
				);
				setSelectedSeasonCode(data.find((type: { isCurrentSeason: boolean }) => type.isCurrentSeason)?.seasonCode);
			} catch (error) {
				console.error("Failed to fetch season codes", error);
			}
		}
		loadSeasonCodes();
	}, []);

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
							disabled={disabled} // Disable the button if the prop is true
						>
							{selectedSeasonCode
								? seasonCodes.find(
										(type) => type.value === selectedSeasonCode
								  )?.label
								: "Select a season code..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-white"
						onWheel={(e) => e.stopPropagation()}
					>
						<Command>
							<CommandInput placeholder="Search season code..." />
							<CommandEmpty>No season code found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{seasonCodes.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												setSelectedSeasonCode(type.value);
												handleSelect(type.value);
												setOpen(false);
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

export default SeasonCodeSelector;
