/**
 * ReportSelector component
 *
 * Searchable combobox for choosing a report to generate.  Reports are
 * organised into static type groups (Trails, Captains Meeting, League Play,
 * etc.) and each entry carries metadata flags that control which additional
 * selectors (week, fiscal year, season code, division, minimum points) are
 * shown by the parent.  The selected report config is surfaced via the
 * `onReportSelect` callback.
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
import { mentionRoute, placeRoute, playerRoute, scheduleRoute, teamRoute, trailsRoute, weeklyScoresheetsRoute } from "@/lib/apiRoutes";

// Static report data organized by type, now with requiresWeek flag
const reportsByType: Record<
	string,
	{ value: string; label: string; requiresWeek?: boolean; minimumPoints?: boolean; divisionSelector?: boolean; fiscalYear?: boolean; needSeasonCode?: boolean }[]
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
		{ 
			value: `${trailsRoute}/reports/pointsList`, 
			label: "Points List" 
		},
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
			value: `${placeRoute}/barAffiliationFeeNotPaid`,
			label: "Bar - Affiliation Fee Not Paid",
		},
		{
			value: `${mentionRoute}/mentionBestOfDivision`,
			label: "Mentions - Best of Division"
		},
		{
			value: `${mentionRoute}/mentionPlaque`,
			label: "Mentions - For Plaques",
			minimumPoints: true
		},
		{
			value: `${mentionRoute}/mentionLeaguePlay`,
			label: "Mentions - League Play"
		},
		{
			value: `${mentionRoute}/ton80`,
			label: "Mentions - Ton 80 Weekly League",
			requiresWeek: true,
		},
		{
			value: `${playerRoute}/playerNoForm`,
			label: "Players - No Form",
		},
		{
			value: `${playerRoute}/playerNotPaid`,
			label: "Players - Not Paid",
		},
		{
			value: `${teamRoute}/teamFeeNotPaid`,
			label: "Teams - Roster Fee Not Paid",
		},
		{
			value: `${weeklyScoresheetsRoute}/topDarter`,
			label: "Scoresheets - Top Darter Report",
			minimumPoints: true,
		},
		{
			value: `${weeklyScoresheetsRoute}/weeklyScoresheets`,
			label: "Scoresheets - Weekly Scoresheets",
			requiresWeek: true,
		}
	],
	lists: [
		{
			value: `${playerRoute}/captainReport`,
			label: "Captains List",
			divisionSelector: true,
		},
		{
			value: `${playerRoute}/electionList`,
			label: "Election List",
			fiscalYear: true,
		},
		{
			value: `/api/reports/mailingLabels`,
			label: "Mailing Labels",
			needSeasonCode: false,
		},
		{
			value: `${playerRoute}/membershipList`,
			label: "Members List",
			needSeasonCode: false,
		},
		{
			value: `${placeRoute}/placesReport`,
			label: "Places List",
			needSeasonCode: false,
		},
		{
			value: `${teamRoute}/teamReportLists`,
			label: "Team List",
			needSeasonCode: false,
		}
	]
};

// Update props to allow passing requiresWeek up
interface ReportSelectorProps {
	disabled?: boolean;
	handleSelect: (value: string, requiresWeek?: boolean, minimumPoints?: boolean, divisionSelector?: boolean, fiscalYear?: boolean, needSeasonCode?: boolean) => void;
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
		handleSelect(value, report?.requiresWeek ?? false, report?.minimumPoints ?? false, report?.divisionSelector ?? false, report?.fiscalYear ?? false, report?.needSeasonCode ?? true); // Pass requiresWeek and minimumPoints up
		setOpen(false);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger
						asChild
						className="bg-background border-border"
					>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] pr-8 relative flex items-center justify-between"
							disabled={disabled} // Disable the button if the prop is true
						>
							<span className="truncate block w-full text-left">
								{selectedReport
									? reports.find(
											(report) =>
												report.value === selectedReport
										)?.label
									: "Select a report..."}
							</span>
							<ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 pointer-events-none" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-background border-border"
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
											className="hover:bg-secondary"
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
