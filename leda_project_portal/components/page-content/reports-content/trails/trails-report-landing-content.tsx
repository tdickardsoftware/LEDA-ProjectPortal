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

import { useState, useCallback, JSX } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportDisplay from "@/components/ui/report-display";
import {
	TrailsHistoryOfWins,
	TrailsTripEligible,
	TrailsMembershipHistory,
	TrailsPointsList,
	TrailsSavePointsLetter,
} from "@/lib/definitions";
import { trailsRoute } from "@/lib/apiRoutes";
import {
	historyOfWinsColumns,
	tripEligibleColumns,
	membershipHistoryColumns,
	pointsListColumns,
	savePointsLetterColumns,
} from "@/lib/report-definitions";
import TrailsTripEligibleReport from "./react-pdf/trails-trip-eligible-report";
import TrailsHistoryOfWinsReport from "./react-pdf/trails-history-of-wins-report";
import TrailsMembershipHistoryReport from "./react-pdf/trails-membership-history-report";
import TrailsPointsListReport from "./react-pdf/trails-points-list-report";
import TrailsSavePointsLetterReport from "./react-pdf/trails-save-points-letter-report";
import { Label } from "@/components/ui/label";

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

	// Function to render PDF download button based on selection
	const renderPDFDownload = () => {
		if (!selectedReport || !dataFetched || !reportData.length) {
			return (
				<div className="flex items-center justify-center h-full px-4 py-2">
					<svg
						className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span className="text-gray-600">Loading data...</span>
				</div>
			);
		}

		let document: JSX.Element;
		let fileName: string;

		switch (selectedReport) {
			case `${trailsRoute}/reports/historyOfWins`:
				document = (
					<TrailsHistoryOfWinsReport
						data={reportData as TrailsHistoryOfWins[]}
					/>
				);
				fileName = `historyOfWins-${new Date()
					.toLocaleDateString("en-US", {
						timeZone: "America/New_York",
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "")}.pdf`;
				break;
			case `${trailsRoute}/reports/eligibleForTrip`:
				document = (
					<TrailsTripEligibleReport
						data={reportData as TrailsTripEligible[]}
					/>
				);
				fileName = `eligibleForTrip-${new Date()
					.toLocaleDateString("en-US", {
						timeZone: "America/New_York",
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "")}.pdf`;
				break;
			case `${trailsRoute}/reports/membershipList`:
				document = (
					<TrailsMembershipHistoryReport
						data={reportData as TrailsMembershipHistory[]}
					/>
				);
				fileName = `membershipHistory-${new Date()
					.toLocaleDateString("en-US", {
						timeZone: "America/New_York",
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "")}.pdf`;
				break;
			case `${trailsRoute}/reports/pointsList`:
				document = (
					<TrailsPointsListReport
						data={reportData as TrailsPointsList[]}
					/>
				);
				fileName = `pointsList-${new Date()
					.toLocaleDateString("en-US", {
						timeZone: "America/New_York",
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "")}.pdf`;
				break;
			case `${trailsRoute}/reports/savePointsLetter`:
				document = (
					<TrailsSavePointsLetterReport
						data={reportData as TrailsSavePointsLetter[]}
					/>
				);
				fileName = `savePointsLetter-${new Date()
					.toLocaleDateString("en-US", {
						timeZone: "America/New_York",
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "")}.pdf`;
				break;
			default:
				return null;
		}

		return (
			<PDFDownloadLink
				document={document}
				fileName={fileName}
				className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-black shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 transition-colors"
			>
				{({ loading }) => (
					<>
						{loading ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Generating PDF...
							</>
						) : (
							<>
								<svg
									className="mr-2 h-4 w-4"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
									/>
								</svg>
								Download PDF
							</>
						)}
					</>
				)}
			</PDFDownloadLink>
		);
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
					onDataFetch={handleDataFetch}
				/>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/eligibleForTrip`) {
			return (
				<ReportDisplay<TrailsTripEligible>
					apiRoute={selectedReport}
					columns={tripEligibleColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
				/>
			);
		}

		if (selectedReport === `${trailsRoute}/reports/membershipList`) {
			return (
				<ReportDisplay<TrailsMembershipHistory>
					apiRoute={selectedReport}
					columns={membershipHistoryColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
				/>
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
						You have selected:{" "}
						<span className="font-medium">{selectedReport}</span>
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
			<div className="flex justify-between">
				<FolderTabMed title="Report Selection" className="w-fit">
					<div className="flex gap-6">
						<div className="flex flex-col gap-1">
							<Label htmlFor="report-selector">Report</Label>
							<ReportSelector
								handleSelect={handleReportSelect}
								selectedReport={selectedReport}
								type="trails"
							/>
						</div>
					</div>
				</FolderTabMed>
				{selectedReport && dataFetched && reportData.length > 0 && (
					<FolderTabMed title="Download PDF" className="w-fit">
						{renderPDFDownload()}
					</FolderTabMed>
				)}
			</div>
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
