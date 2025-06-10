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

import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import ReportDisplay from "@/components/page-content/reports-content/report-display";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CaptainsMtgFolderLabels } from "@/lib/definitions";
import { folderLabelsColumns } from "@/lib/trails-report-definitions";

export default function CaptainsMeetingReportLandingContent() {
	// State declarations
	const [seasonCode, setSeasonCode] = useState<string>("");
	const [selectedReport, setSelectedReport] = useState<string>("");
	const [reportData, setReportData] = useState<unknown[]>([]);
	const [dataFetched, setDataFetched] = useState<boolean>(false);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);

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

	// Function to render report content based on selection
	const renderReportContent = () => {
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
						<div className="flex gap-4">
							<SeasonCodeSelector
								disabled={currentSeason}
								handleSelect={handleSeasonCodeSelect}
								setDisabled={setDisabled}
								useCurrentSeason={currentSeason}
								seasonCode={seasonCode}
							/>
							<div className="flex items-center gap-4">
								<Label>Current Season?</Label>
								<Checkbox
									checked={currentSeason}
									onCheckedChange={() =>
										setCurrentSeason(!currentSeason)
									}
								/>
							</div>
						</div>
						<ReportSelector
							handleSelect={handleReportSelect}
							selectedReport={selectedReport}
							type="captainsMeeting"
							disabled={!seasonCode} // Disable until season code is selected
						/>
					</div>
				</FolderTabMed>
				{selectedReport && dataFetched && (
					<FolderTabMed title="Download PDF" className="w-fit">
						<button
							disabled
							className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 shadow cursor-not-allowed"
						>
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
							PDF Coming Soon
						</button>
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
