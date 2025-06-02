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
import { TrailsHistoryOfWins, TrailsTripEligible, TrailsMembershipHistory, TrailsPointsList, TrailsSavePointsLetter } from "@/lib/definitions";
import { trailsRoute } from "@/lib/apiRoutes";
import {
	historyOfWinsColumns,
	tripEligibleColumns,
	membershipHistoryColumns,
	pointsListColumns,
	savePointsLetterColumns
} from "@/lib/trails-report-definitions";

export default function TrailsReportLandingContent() {
	// State declarations
	const [selectedReport, setSelectedReport] = useState<string>("");

	// Event handlers
	const handleReportSelect = (value: string) => {
		setSelectedReport(value);
	};

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

		if (selectedReport === `${trailsRoute}/reports/membershipList`) {
			return (
				<ReportDisplay<TrailsMembershipHistory>
					apiRoute={selectedReport}
					columns={membershipHistoryColumns}
					className="h-full"
				/>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/pointsList`) {
			return (
				<ReportDisplay<TrailsPointsList>
					apiRoute={selectedReport}
					columns={pointsListColumns}
					className="h-full"
				/>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/savePointsLetter`) {
			return (
				<ReportDisplay<TrailsSavePointsLetter>
					apiRoute={selectedReport}
					columns={savePointsLetterColumns}
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
