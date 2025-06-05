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

import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { PDFDownloadLink } from "@react-pdf/renderer";
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
import TrailsTripEligibleReport from "./react-pdf/trails-trip-eligible-report";
import TrailsHistoryOfWinsReport from "./react-pdf/trails-history-of-wins-report";
import TrailsMembershipHistoryReport from "./react-pdf/trails-membership-history-report";

export default function TrailsReportLandingContent() {
	// State declarations
	const [selectedReport, setSelectedReport] = useState<string>("");
	const [reportData, setReportData] = useState<unknown[]>([]);
	const [dataFetched, setDataFetched] = useState<boolean>(false);

	// Event handlers
	const handleReportSelect = (value: string) => {
		if (value != selectedReport) {
			setSelectedReport(value);
			setReportData([]); // Clear previous data when selecting new report
			setDataFetched(false); // Reset data fetched state
		}
	};

	const handleDataFetch = useCallback((data: unknown[]) => {
		setReportData(data);
		setDataFetched(true);
	}, []);

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
				<>
					<div className="mb-4">
						
						{dataFetched && (
							<PDFDownloadLink
								document={<TrailsHistoryOfWinsReport data={reportData as TrailsHistoryOfWins[]} />}
								fileName={`historyOfWins-${new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '')}.pdf`}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
							>
								{({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
							</PDFDownloadLink>
						)}
					</div>
					<ReportDisplay<TrailsHistoryOfWins>
						apiRoute={selectedReport}
						columns={historyOfWinsColumns}
						className="h-full"
						onDataFetch={handleDataFetch}
					/>
				</>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/eligibleForTrip`) {
			return (
				<>
					<div className="mb-4">
						{dataFetched && (
							<PDFDownloadLink
								document={<TrailsTripEligibleReport data={reportData as TrailsTripEligible[]} />}
								fileName={`eligibleForTrip-${new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '')}.pdf`}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
							>
								{({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
							</PDFDownloadLink>
						)}
					</div>
					<ReportDisplay<TrailsTripEligible>
						apiRoute={selectedReport}
						columns={tripEligibleColumns}
						className="h-full"
						onDataFetch={handleDataFetch}
					/>
				</>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/membershipList`) {
			return (
				<>
					<div className="mb-4">
						{dataFetched && (
							<PDFDownloadLink
								document={<TrailsMembershipHistoryReport data={reportData as TrailsMembershipHistory[]} />}
								fileName={`membershipHistory-${new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '')}.pdf`}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
							>
								{({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
							</PDFDownloadLink>
						)}
					</div>
					<ReportDisplay<TrailsMembershipHistory>
						apiRoute={selectedReport}
						columns={membershipHistoryColumns}
						className="h-full"
						onDataFetch={handleDataFetch}
					/>
				</>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/pointsList`) {
			return (
				<ReportDisplay<TrailsPointsList>
					apiRoute={selectedReport}
					columns={pointsListColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
				/>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/savePointsLetter`) {
			return (
				<ReportDisplay<TrailsSavePointsLetter>
					apiRoute={selectedReport}
					columns={savePointsLetterColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
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
