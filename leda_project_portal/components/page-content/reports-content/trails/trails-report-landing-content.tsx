"use client";

/**
 * Trails Report Landing Content Component
 *
 * This component provides a landing page for trails reports, allowing users to:
 * - Select from available trail reports
 * - Navigate to specific report views
 *
 * The component uses similar styling to the weekly scoresheets page but focuses
 * specifically on report selection functionality.
 */

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import ReportDisplay from "@/components/page-content/reports-content/report-display";
import { TrailsHistoryOfWins, TrailsTripEligible } from "@/lib/definitions";
import { trailsRoute } from "@/lib/apiRoutes";

export default function TrailsReportLandingContent() {
	// State declarations
	const [selectedReport, setSelectedReport] = useState<string>("");

	// Event handlers
	const handleReportSelect = (value: string) => {
		setSelectedReport(value);
		// TODO: Add navigation logic or report generation based on selected report
		console.log("Selected report:", value);
	};

	// Column definitions for historyOfWins report
	const historyOfWinsColumns = [
		{
			key: "ledaId",
			header: "LEDA ID",
			accessor: (row: TrailsHistoryOfWins) => row.ledaId,
			sortable: true,
		},
		{
			key: "fullName",
			header: "Full Name",
			accessor: (row: TrailsHistoryOfWins) => row.fullName,
			sortable: true,
		},
		{
			key: "singlesPlace1",
			header: "Singles 1st",
			accessor: (row: TrailsHistoryOfWins) => row.singlesPlace1 || 0,
			sortable: true,
		},
		{
			key: "singlesPlace2",
			header: "Singles 2nd",
			accessor: (row: TrailsHistoryOfWins) => row.singlesPlace2 || 0,
			sortable: true,
		},
		{
			key: "singlesPlace3",
			header: "Singles 3rd",
			accessor: (row: TrailsHistoryOfWins) => row.singlesPlace3 || 0,
			sortable: true,
		},
		{
			key: "singlesPlace4",
			header: "Singles 4th",
			accessor: (row: TrailsHistoryOfWins) => row.singlesPlace4 || 0,
			sortable: true,
		},
		{
			key: "doublesPlace1",
			header: "Doubles 1st",
			accessor: (row: TrailsHistoryOfWins) => row.doublesPlace1 || 0,
			sortable: true,
		},
		{
			key: "doublesPlace2",
			header: "Doubles 2nd",
			accessor: (row: TrailsHistoryOfWins) => row.doublesPlace2 || 0,
			sortable: true,
		},
		{
			key: "doublesPlace3",
			header: "Doubles 3rd",
			accessor: (row: TrailsHistoryOfWins) => row.doublesPlace3 || 0,
			sortable: true,
		},
		{
			key: "doublesPlace4",
			header: "Doubles 4th",
			accessor: (row: TrailsHistoryOfWins) => row.doublesPlace4 || 0,
			sortable: true,
		},
	];

	// Column definitions for trip eligible report
	const tripEligibleColumns = [
		{
			key: "ledaId",
			header: "LEDA ID",
			accessor: (row: TrailsTripEligible) => row.ledaId,
			sortable: true,
		},
		{
			key: "fullName",
			header: "Full Name",
			accessor: (row: TrailsTripEligible) => row.fullName,
			sortable: true,
		},
		{
			key: "addressFull",
			header: "Address",
			accessor: (row: TrailsTripEligible) => row.addressFull,
			sortable: true,
		},
		{
			key: "totalpoints",
			header: "Total Points",
			accessor: (row: TrailsTripEligible) => row.totalpoints,
			sortable: true,
		},
	];

	// Function to render report content based on selection
	const renderReportContent = () => {
		if (!selectedReport) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-gray-500 text-center">
						Select a report to continue...
					</p>
				</div>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/historyOfWins`) {
			return (
				<ReportDisplay<TrailsHistoryOfWins>
					apiRoute={selectedReport}
					columns={historyOfWinsColumns}
					className="h-full"
				/>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/eligibleForTrip`) {
			return (
				<ReportDisplay<TrailsTripEligible>
					apiRoute={selectedReport}
					columns={tripEligibleColumns}
					className="h-full"
				/>
			);
		}

		// Default fallback for other reports
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-4">
						Report Selected
					</h2>
					<p className="text-gray-600">
						You have selected: <span className="font-medium">{selectedReport}</span>
					</p>
					<p className="text-sm text-gray-500 mt-2">
						Report functionality will be implemented here.
					</p>
				</div>
			</div>
		);
	};

	return (
		<div className="flex flex-col h-full">
			<FolderTabMed title="Report Selection" className="w-fit">
				<div className="flex gap-4">
					<ReportSelector
						handleSelect={handleReportSelect}
						selectedReport={selectedReport}
						type="trails"
					/>
				</div>
			</FolderTabMed>
			<div className="mt-4">
				<Separator
					orientation="horizontal"
					className="bg-gray-400 w-100"
				/>
			</div>
			<div className="flex flex-1 overflow-hidden">
				<div className="flex-1 p-4 overflow-auto">
					{renderReportContent()}
				</div>
			</div>
		</div>
	);
}
