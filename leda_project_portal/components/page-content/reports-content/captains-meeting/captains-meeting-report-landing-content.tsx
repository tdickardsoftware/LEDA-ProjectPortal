"use client";

/**
 * Captains Meeting Report Landing Content Component
 *
 * This component provides a landing page for captains meeting reports, allowing users to:
 * - Select a season code before accessing reports
 * - Select from available captains meeting reports
 * - Navigate to specific report views
 *
 * The component uses similar styling to the trails reports page but focuses
 * specifically on captains meeting report selection functionality.
 */

import { useState, useCallback, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportDisplay from "@/components/ui/report-display";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CaptainsMtgFolderLabels } from "@/lib/definitions";
import { folderLabelsColumns, teamReportColumns } from "@/lib/report-definitions";
import CaptainsMeetingFolderLabelsReport from "./react-pdf/captains-meeting-folder-labels-report";
import { TeamReportTeamPlaceInfo } from "@/lib/definitions";
import CaptainsMeetingTeamReport from "./react-pdf/captains-meeting-team-report";
import CaptainsMeetingScheduleContent from "./captains-meeting-schedule-content";
import CaptainsMeetingScheduleReport from "./react-pdf/captains-meeting-schedule-report";
import { DivisionsData, ScheduleData } from "@/lib/schedule";
import { CaptainsMtgSchedulePlaceCaptainSeasonInfo } from "@/lib/definitions";
import { seasonRoute } from "@/lib/apiRoutes";

// Custom hook for season data
const useSeasonData = (seasonCode: string) => {
	return useQuery({
		queryKey: ['season', seasonCode],
		queryFn: async () => {
			const response = await fetch(`${seasonRoute}?seasonCode=${seasonCode}`);
			if (!response.ok) {
				throw new Error('Failed to fetch season data');
			}
			return response.json();
		},
		enabled: !!seasonCode,
		staleTime: 60 * 1000, // 1 minute
	});
};

export default function CaptainsMeetingReportLandingContent() {
	// State declarations
	const [seasonCode, setSeasonCode] = useState<string>("");
	const [selectedReport, setSelectedReport] = useState<string>("");
	const [reportData, setReportData] = useState<unknown[]>([]);
	const [dataFetched, setDataFetched] = useState<boolean>(false);
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [scheduleData, setScheduleData] = useState<{
		divisionsData: DivisionsData;
		matchData: ScheduleData;
		gameDates: Record<string, string>;
		placesData: Record<string, string>;
		seasonInfo: CaptainsMtgSchedulePlaceCaptainSeasonInfo[];
	} | null>(null);

	// TanStack Query hook
	const { 
		error: seasonError,
		isLoading: isSeasonLoading 
	} = useSeasonData(seasonCode);

	// Event handlers
	const handleSeasonCodeSelect = useCallback((value: string) => {
		setSeasonCode(value);
		// Don't reset selectedReport - keep it selected
		setReportData([]); // Clear data to force re-render
		setDataFetched(false); // Reset data fetched state
	}, []);

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

	const handleScheduleDataReady = useCallback((data: {
		divisionsData: DivisionsData;
		matchData: ScheduleData;
		gameDates: Record<string, string>;
		placesData: Record<string, string>;
		seasonInfo: CaptainsMtgSchedulePlaceCaptainSeasonInfo[];
	}) => {
		setScheduleData(data);
		setDataFetched(true);
	}, []);

	// Function to render PDF download button based on selection
	const renderPDFDownload = () => {
		if (!selectedReport) {
			return null;
		}

		// For schedule reports, check if schedule data is complete
		if (selectedReport.includes("schedule")) {
			if (!scheduleData || !scheduleData.seasonInfo || scheduleData.seasonInfo.length === 0) {
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
		} else {
			// For other reports, check if regular data is fetched and valid
			if (!dataFetched || !reportData || !Array.isArray(reportData) || reportData.length === 0) {
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
		}

		let document: JSX.Element;
		let fileName: string;

		if (selectedReport.includes("schedule") && scheduleData) {
			document = (
				<CaptainsMeetingScheduleReport
					divisionsData={scheduleData.divisionsData}
					matchData={scheduleData.matchData}
					gameDates={scheduleData.gameDates}
					seasonCode={seasonCode}
					placesData={scheduleData.placesData}
					seasonInfo={scheduleData.seasonInfo}
				/>
			);
			fileName = `schedule-${seasonCode}-${new Date()
				.toLocaleDateString("en-US", {
					timeZone: "America/New_York",
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				})
				.replace(/\//g, "")}.pdf`;
		} else if (selectedReport.includes("reportsFolderLabels") && reportData.length) {
			document = (
				<CaptainsMeetingFolderLabelsReport
					data={reportData as CaptainsMtgFolderLabels[]}
					seasonCode={seasonCode}
				/>
			);
			fileName = `captainsMeetingFolderLabels-${seasonCode}-${new Date()
				.toLocaleDateString("en-US", {
					timeZone: "America/New_York",
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				})
				.replace(/\//g, "")}.pdf`;
		} else if (selectedReport.includes("teamReport") && reportData.length) {
			document = (
				<CaptainsMeetingTeamReport
					data={reportData as TeamReportTeamPlaceInfo[]}
					reportDate={new Date().toLocaleDateString("en-US")}
				/>
			);
			fileName = `teamReport-${seasonCode}-${new Date()
				.toLocaleDateString("en-US", {
					timeZone: "America/New_York",
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				})
				.replace(/\//g, "")}.pdf`;
		} else {
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
		// Show loading state for season data when needed
		if (seasonCode && isSeasonLoading) {
			return (
				<div className="flex h-full items-center justify-center">
					<div className="flex items-center gap-2">
						<svg
							className="animate-spin h-5 w-5 text-gray-500"
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
						<p className="text-gray-500">Loading season data...</p>
					</div>
				</div>
			);
		}

		// Show error state for season data
		if (seasonCode && seasonError) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-red-500 text-center">
						Error loading season data. Please try again.
					</p>
				</div>
			);
		}

		if (!seasonCode) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-gray-500 text-center">
						Select a season code to continue...
					</p>
				</div>
			);
		}

		if (!selectedReport) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-gray-500 text-center">
						Select a report to continue...
					</p>
				</div>
			);
		}

		if (selectedReport.includes("schedule")) {
			return (
				<CaptainsMeetingScheduleContent
					seasonCode={seasonCode}
					onDataReady={handleScheduleDataReady}
				/>
			);
		}

		if (selectedReport.includes("reportsFolderLabels")) {
			return (
				<ReportDisplay<CaptainsMtgFolderLabels>
					apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
					columns={folderLabelsColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
				/>
			);
		}

		if (selectedReport.includes("teamReport")) {
			return (
				<ReportDisplay<TeamReportTeamPlaceInfo>
					apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
					columns={teamReportColumns}
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
						Season: <span className="font-medium">{seasonCode}</span>
					</p>
					<p className="text-gray-600">
						Report: <span className="font-medium">{selectedReport}</span>
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
						<div className="flex gap-4 flex-row">
							<div className="flex flex-col gap-1">
								<Label htmlFor="season-code-selector">Season</Label>
								<div className="flex gap-4">
									<SeasonCodeSelector
										disabled={currentSeason}
										handleSelect={handleSeasonCodeSelect}
										useCurrentSeason={currentSeason}
										seasonCode={seasonCode}
									/>
									<div className="flex items-center gap-4">
										<Label htmlFor="current-season-checkbox">Current Season?</Label>
										<Checkbox
											id="current-season-checkbox"
											checked={currentSeason}
											onCheckedChange={() =>
												setCurrentSeason(!currentSeason)
											}
										/>
									</div>
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<Label htmlFor="report-selector">Report</Label>
								<ReportSelector
									handleSelect={handleReportSelect}
									selectedReport={selectedReport}
									type="captainsMeeting"
									disabled={!seasonCode}
								/>
							</div>
						</div>
					</div>
				</FolderTabMed>
				{((selectedReport.includes("schedule") && scheduleData && scheduleData.seasonInfo.length > 0) ||
				  (selectedReport && !selectedReport.includes("schedule") && dataFetched && reportData && Array.isArray(reportData) && reportData.length > 0)) && (
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