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
import { rosterRoute } from "@/lib/apiRoutes";
import { useQuery } from "@tanstack/react-query";

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorProps {
	disabled?: boolean;
	handleSelect: (value: string) => void;
	setDisabled?: (value: boolean) => void;
	useCurrentSeason: boolean;
	seasonCode: string;
}

// SeasonCodeSelector component definition
const SeasonCodeSelector: React.FC<SeasonCodeSelectorProps> = ({
	disabled,
	handleSelect,
	setDisabled,
	useCurrentSeason,
	seasonCode,
}) => {
	const [open, setOpen] = useState(false);
	const [selectedSeasonCode, setSelectedSeasonCode] = useState<string | null>(null);

	const { data: seasonCodes = [] } = useQuery({
		queryKey: ["rosterSeasonCodes"],
		queryFn: async () => {
			const response = await fetch(
				`${rosterRoute}/rostersWithData?getSeasonCodeInfo=true`
			);
			const data = await response.json();
			return data.map((type: { seasonCode: string; desc: string; isCurrentSeason?: boolean }) => ({
				value: type.seasonCode,
				label: type.seasonCode + " - " + type.desc,
				isCurrentSeason: type.isCurrentSeason,
			}));
		},
	});

	useEffect(() => {
		if (seasonCodes.length > 0) {
			if (useCurrentSeason) {
				const current = seasonCodes.find((type: { value: string; label: string; isCurrentSeason?: boolean }) => type.isCurrentSeason);
				if (current && current.value !== selectedSeasonCode) {
					setSelectedSeasonCode(current.value);
					handleSelect(current.value);
				}
			}
			if (seasonCodes.find((type: { value: string; label: string; isCurrentSeason?: boolean }) => type.isCurrentSeason)) {
				setDisabled?.(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [seasonCodes, useCurrentSeason, setDisabled, handleSelect, selectedSeasonCode]);

	const handleSelectSeasonCode = (value: string) => {
		setSelectedSeasonCode(value);
		handleSelect(value);
		setOpen(false);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild className="bg-background">
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							disabled={disabled}
						>
							{seasonCode
								? seasonCodes.find(
										(type: { value: string; label: string; isCurrentSeason?: boolean }) => type.value === seasonCode
								  )?.label
								: "Select a season code..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-background"
						onWheel={(e) => e.stopPropagation()}
					>
						<Command>
							<CommandInput placeholder="Search season code..." />
							<CommandEmpty>No season code found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{seasonCodes.map((type: { value: string; label: string; isCurrentSeason?: boolean }) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												handleSelectSeasonCode(type.value);
											}}
											className="hover:bg-secondary"
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