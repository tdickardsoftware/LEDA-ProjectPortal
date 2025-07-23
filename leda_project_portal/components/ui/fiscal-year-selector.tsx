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

interface FiscalYearSelectorProps {
	disabled?: boolean;
	handleSelect: (value: string) => void;
	setDisabled?: (value: boolean) => void;
	fiscalYear: string;
}

const FiscalYearSelector: React.FC<FiscalYearSelectorProps> = ({
	disabled,
	handleSelect,
	setDisabled,
	fiscalYear,
}) => {
	const [open, setOpen] = useState(false);
	const [fiscalYears, setFiscalYears] = useState<{ value: string; label: string }[]>([]);
	const [selectedFiscalYear, setSelectedFiscalYear] = useState<string | null>(null);

	const handleSelectFiscalYear = (value: string) => {
		setSelectedFiscalYear(value);
		handleSelect(value);
		setOpen(false);
	};

	useEffect(() => {
		async function loadFiscalYears() {
			try {
				const response = await fetch(`${seasonRoute}/fiscalYear`);
				const data = await response.json();
				setFiscalYears(
					data.map((item: { fiscalYear: string }) => ({
						value: item.fiscalYear,
						label: item.fiscalYear,
					}))
				);
				if (data.length > 0 && !fiscalYear) {
					setSelectedFiscalYear(data[0].fiscalYear);
					handleSelect(data[0].fiscalYear);
				}
				if (setDisabled) setDisabled(false);
			} catch (error) {
				console.error("Failed to fetch fiscal years", error);
			}
		}
		loadFiscalYears();
	}, [setDisabled, handleSelect, fiscalYear]);

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild className="bg-white border-gray-200">
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							disabled={disabled}
						>
							{fiscalYear
								? fiscalYears.find((item) => item.value === fiscalYear)?.label
								: "Select a fiscal year..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-white border-gray-200"
						onWheel={(e) => e.stopPropagation()}
					>
						<Command>
							<CommandInput placeholder="Search fiscal year..." />
							<CommandEmpty>No fiscal year found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{fiscalYears.map((item) => (
										<CommandItem
											key={item.value}
											value={item.value}
											onSelect={() => {
												handleSelectFiscalYear(item.value);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													item.value === selectedFiscalYear
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{item.label}
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

export default FiscalYearSelector;
