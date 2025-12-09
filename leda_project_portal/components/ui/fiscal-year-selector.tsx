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
import { useQuery } from "@tanstack/react-query";

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
	const [selectedFiscalYear, setSelectedFiscalYear] = useState<string | null>(null);

	type FiscalYearItem = { value: string; label: string };

	const { data: fiscalYears = [] } = useQuery<FiscalYearItem[]>({
		queryKey: ["fiscalYears"],
		queryFn: async () => {
			const response = await fetch(`${seasonRoute}/fiscalYear`);
			const data = await response.json();
			return data.map((item: { fiscalYear: string }) => ({
				value: item.fiscalYear,
				label: item.fiscalYear,
			}));
		},
	});

	useEffect(() => {
		if (fiscalYears.length > 0 && !fiscalYear) {
			setSelectedFiscalYear(fiscalYears[0].value);
			handleSelect(fiscalYears[0].value);
		}
		if (setDisabled) setDisabled(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fiscalYears]);

	const handleSelectFiscalYear = (value: string) => {
		setSelectedFiscalYear(value);
		handleSelect(value);
		setOpen(false);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild className="bg-background border-border">
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
						className="w-[200px] p-0 bg-background border-border"
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
											className="hover:bg-secondary"
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