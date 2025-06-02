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
import { trailsRoute } from "@/lib/apiRoutes";

// Define the parameters for the ReportSelector component
interface ReportSelectorProps {
	disabled?: boolean;
	handleSelect: (value: string) => void;
	selectedReport: string;
    type: string;
}

// Static report data organized by type
const reportsByType: Record<string, { value: string; label: string }[]> = {
	trails: [
		{ value: `${trailsRoute}/reports/eligibleForTrip`, label: "Eligible For Trip" },
		{ value: `${trailsRoute}/reports/historyOfWins`, label: "History of Wins" },
		{ value: `${trailsRoute}/reports/membershipList`, label: "Membership List" },
        { value: `${trailsRoute}/reports/pointsList`, label: "Points List"},
		{ value: `${trailsRoute}/reports/savePointsLetter`, label: "Save Points Letter" },
	],
};

// ReportSelector component definition
const ReportSelector: React.FC<ReportSelectorProps> = ({
	disabled,
	handleSelect,
	selectedReport,
    type,
}) => {
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);

	// Get reports for the specified type
	const reports = reportsByType[type] || [];

	const handleSelectReport = (value: string) => {
		handleSelect(value); // Update the parent component's state
		setOpen(false);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild className="bg-white">
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							disabled={disabled} // Disable the button if the prop is true
						>
							{selectedReport // Use the selectedReport prop to display the selected report label
								? reports.find(
										(report) => report.value === selectedReport
								  )?.label
								: "Select a report..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-white"
						onWheel={(e) => e.stopPropagation()}
					>
						<Command>
							<CommandInput placeholder="Search report..." />
							<CommandEmpty>No report found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{reports.map((report) => (
										<CommandItem
											key={report.value}
											value={report.value}
											onSelect={() => {
												handleSelectReport(
													report.value
												);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													report.value === selectedReport
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{report.label}
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

export default ReportSelector;
