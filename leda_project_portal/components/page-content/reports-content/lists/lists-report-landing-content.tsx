"use client";

import { useState, useCallback, useEffect, JSX } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { Label } from "@/components/ui/label";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Checkbox } from "@/components/ui/checkbox";
import ReportDivisionSelector from "@/components/ui/report-division-selector";
import { seasonRoute, rosterRoute } from "@/lib/apiRoutes";
import { ListsCaptains, RosterDivision } from "@/lib/definitions";
import ReportDisplay from "@/components/ui/report-display";
import { captainsReportColumns } from "@/lib/report-definitions";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ListsReportCaptainsReport from "./react-pdf/lists-report-captains-report";

export default function ListsReportLandingContent() {
	const [selectedReport, setSelectedReport] = useState<string>("");
	const [seasonCode, setSeasonCode] = useState<string>("");
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [seasonCodeDesc, setSeasonCodeDesc] = useState<string>("");
	const [needsDivisionSelector, setNeedsDivisionSelector] = useState<boolean>(false);
	const [allDivisions, setAllDivisions] = useState<boolean>(true);
	const [selectedDivisions, setSelectedDivisions] = useState<string>("");
	const [allDivisionsString, setAllDivisionsString] = useState<string>("");
	const [reportData, setReportData] = useState<unknown[]>([]);
	const [dataFetched, setDataFetched] = useState<boolean>(false);

	const handleSeasonCodeSelect = useCallback(
		async (value: string) => {
			setSeasonCode(value);
			try {
				const season = await (
					await fetch(`${seasonRoute}?seasonCode=${value}`)
				).json();
				setSeasonCodeDesc(season?.desc || "");
			} catch (err) {
				setSeasonCodeDesc("");
				// Optionally log or show an error
				console.error("Failed to fetch season description", err);
			}
		},
		[]
	);

	// Fetch all divisions when seasonCode changes or when allDivisions is toggled to true
	useEffect(() => {
		const fetchAllDivisions = async () => {
			if (!seasonCode || !needsDivisionSelector || !allDivisions) return;
			
			try {
				const response = await fetch(
					`${rosterRoute}/rosterDivision?seasonCode=${seasonCode}`
				);
				if (response.ok) {
					const data: RosterDivision[] = await response.json();
					if (data && data.length > 0) {
						const allDivisionsStr = data.map(d => d.division).join(", ");
						console.log(allDivisionsStr)
						setAllDivisionsString(allDivisionsStr);
					} else {
						setAllDivisionsString("");
					}
				} else {
					console.error("Failed to fetch all divisions");
					setAllDivisionsString("");
				}
			} catch (error) {
				console.error("Error fetching all divisions:", error);
				setAllDivisionsString("");
			}
		};

		fetchAllDivisions();
	}, [seasonCode, needsDivisionSelector, allDivisions]);

	const handleReportSelect = (
		value: string,
		requiresWeek?: boolean,
		minimumPoints?: boolean,
		divisionSelector?: boolean
	) => {
		setSelectedReport(value);
		setNeedsDivisionSelector(!!divisionSelector);
	};

	const handleDataFetch = useCallback((data: unknown[]) => {
		setReportData(data);
		setDataFetched(true);
	}, []);

	const handleDivisionsChange = (divisionsString: string) => {
		setSelectedDivisions(divisionsString);
	};

	// Set the effective divisions string based on whether allDivisions is true or not
	const effectiveDivisionsString = allDivisions ? allDivisionsString : selectedDivisions;

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

		// Add check for division selection when needed
		if (needsDivisionSelector && !allDivisions && !selectedDivisions) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-gray-500 text-center">
						Please select at least one division to continue...
					</p>
				</div>
			);
		}
		
		if (selectedReport.includes("captainReport")) {
			return (
				<ReportDisplay<ListsCaptains>
					apiRoute={selectedReport + `?seasonCode=${seasonCode}&divisions=${effectiveDivisionsString}`}
					columns={captainsReportColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
				/>
			);
		}

		// Here you can use effectiveDivisionsString when making API calls for reports
		// that need division information
		
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-4">
						Work In Progress
					</h2>
					<p className="text-gray-600">
						The selected report is not yet implemented.
					</p>
					{needsDivisionSelector && (
						<p className="text-gray-500 mt-4">
							Selected Divisions: {effectiveDivisionsString || "None"}
						</p>
					)}
				</div>
			</div>
		);
	};

	const renderPDFDownload = () => {
		if (!selectedReport || !seasonCode) return null;
		if (!dataFetched) {
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
		if (!reportData.length) return null;

		let document: JSX.Element | null = null;
		let fileName = "";

		if (selectedReport.includes("captainReport")) {
			document = (
				<ListsReportCaptainsReport
					data={reportData as ListsCaptains[]}
					desc={seasonCodeDesc}
				/>
			);
			fileName = `captains-list-${seasonCode}-${new Date()
				.toLocaleDateString("en-US", {
					timeZone: "America/New_York",
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				})
				.replace(/\//g, "")}.pdf`;
		}

		if (!document) return null;

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
										<Label htmlFor="current-season-checkbox">
											Current Season?
										</Label>
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
									type="lists"
									disabled={!seasonCode}
								/>
							</div>
							{needsDivisionSelector && (
								<div className="flex flex-col gap-1 justify-end">
									<div className="flex items-center gap-4">
										<Label htmlFor="all-divisions-checkbox">
											All Divisions?
										</Label>
										<Checkbox
											id="all-divisions-checkbox"
											checked={allDivisions}
											onCheckedChange={() =>
												setAllDivisions(!allDivisions)
											}
										/>
									</div>
									{!allDivisions && seasonCode && (
										<div className="mt-2">
											<ReportDivisionSelector
												seasonCode={seasonCode}
												onDivisionsChange={handleDivisionsChange}
												disabled={!seasonCode}
											/>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</FolderTabMed>
				{/* Only render download link if all required fields are filled */}
				{selectedReport && seasonCode && seasonCodeDesc &&
					dataFetched &&
					selectedReport.includes("captainReport") && (
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
