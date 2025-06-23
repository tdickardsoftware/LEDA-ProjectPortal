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
import { scheduleRoute, teamRoute, trailsRoute } from "@/lib/apiRoutes";

// Static report data organized by type, now with requiresWeek flag
const reportsByType: Record<
	string,
	{ value: string; label: string; requiresWeek?: boolean }[]
> = {
	trails: [
		{
			value: `${trailsRoute}/reports/eligibleForTrip`,
			label: "Eligible For Trip",
		},
		{
			value: `${trailsRoute}/reports/historyOfWins`,
			label: "History of Wins",
		},
		{
			value: `${trailsRoute}/reports/membershipList`,
			label: "Membership List",
		},
		{ value: `${trailsRoute}/reports/pointsList`, label: "Points List" },
		{
			value: `${trailsRoute}/reports/savePointsLetter`,
			label: "Save Points Letter",
		},
	],
	captainsMeeting: [
		{
			value: "/api/activities/roster/reportsFolderLabels",
			label: "Folder Labels",
		},
		{
			value: `${teamRoute}/teamReport`,
			label: "Team Report",
		},
		{
			value: `${scheduleRoute}`,
			label: "Schedules",
		},
	],
	leaguePlay: [
		{
			value: "/api/leaguePlay/someReport",
			label: "Some League Play Report",
			requiresWeek: true, // Example: set to true for a report that needs week selection
		},
		// ...add more leaguePlay reports as needed...
	],
};

// Update props to allow passing requiresWeek up
interface ReportSelectorProps {
	disabled?: boolean;
	handleSelect: (value: string, requiresWeek?: boolean) => void;
	selectedReport: string;
	type: string;
}

// ReportSelector component definition
const ReportSelector: React.FC<ReportSelectorProps> = ({
	disabled,
	handleSelect,
	selectedReport,
	type,
}) => {
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);

	const reports = reportsByType[type] || [];

	const handleSelectReport = (value: string) => {
		const report = reports.find((r) => r.value === value);
		handleSelect(value, report?.requiresWeek ?? false); // Pass requiresWeek up
		setOpen(false);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger
						asChild
						className="bg-white border-gray-200"
					>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							disabled={disabled} // Disable the button if the prop is true
						>
							{selectedReport // Use the selectedReport prop to display the selected report label
								? reports.find(
										(report) =>
											report.value === selectedReport
								  )?.label
								: "Select a report..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-white border-gray-200"
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
													report.value ===
														selectedReport
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
