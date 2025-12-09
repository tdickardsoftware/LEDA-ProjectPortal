"use client";

import { useState, useCallback, useEffect, useRef, JSX } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { Label } from "@/components/ui/label";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Checkbox } from "@/components/ui/checkbox";
import ReportDivisionSelector from "@/components/ui/report-division-selector";

import { seasonRoute, rosterRoute } from "@/lib/apiRoutes";
import { ListsCaptains, ListsElectionList, ListsMembership, ListsPlaces, ListsTeams, MailingList, RosterDivision } from "@/lib/definitions";
import ReportDisplay from "@/components/ui/report-display";
import { captainsReportColumns, electionListColumns, mailingLabelsColumns, membershipListColumnsFilterByJoinDate, membershipListColumnsFilterBySeason, placesListColumns, teamsListColumns } from "@/lib/report-definitions";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import ListsReportCaptainsReport from "./react-pdf/lists-report-captains-report";
import ListsReportElectionListReport from "./react-pdf/lists-report-election-list-report";
import FiscalYearSelector from "@/components/ui/fiscal-year-selector";
import { Input } from "@/components/ui/input";
import ListsReportMembershipListJoinDateReport from "./react-pdf/lists-report-membership-list-join-date-report";
import ListsReportMembershipListSeasonReport from "./react-pdf/lists-report-membership-list-season-report";
import ListsReportPlacesListJoinDateReport from "./react-pdf/lists-report-places-list-join-date-report";
import ListsReportPlacesListSeasonReport from "./react-pdf/lists-report-places-list-season-report";
import ListsReportTeamsListJoinDateReport from "./react-pdf/lists-report-teams-list-join-date-report";
import ListsReportTeamsListSeasonReport from "./react-pdf/lists-report-teams-list-season-report";
import MailingLabelsImportDialog from "./mailing-labels-import-dialog";
import MailingLabelsAddDialog from "./mailing-labels-add-dialog";
import { Button } from "@/components/ui/button";
import { Import as ImportIcon } from "lucide-react";
import React from "react";
import ListsReportMailingLabels from "./react-pdf/lists-report-mailing-labels";

// Custom hooks for API calls
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

const useRosterDivisions = (seasonCode: string, enabled: boolean) => {
	return useQuery({
		queryKey: ['rosterDivisions', seasonCode],
		queryFn: async () => {
			const response = await fetch(`${rosterRoute}/rosterDivision?seasonCode=${seasonCode}`);
			if (!response.ok) {
				throw new Error('Failed to fetch roster divisions');
			}
			const data: RosterDivision[] = await response.json();
			return data;
		},
		enabled: !!seasonCode && enabled,
		staleTime: 60 * 1000, // 1 minute
	});
};

// SubdivisionRangeSelector component
function SubdivisionRangeSelector({
	min,
	max,
	onChange,
}: {
	min: number;
	max: number;
	onChange: (min: number | undefined, max: number | undefined) => void;
}) {
	const [minValue, setMinValue] = useState<number | undefined>(min);
	const [maxValue, setMaxValue] = useState<number | undefined>(max);

	useEffect(() => {
		onChange(minValue, maxValue);
	}, [minValue, maxValue, onChange]);

	return (
		<div className="flex items-center gap-2">
			<Label htmlFor="subdivision-min" className="text-xs">Subdivision</Label>
			<Input
				id="subdivision-min"
				type="number"
				min={1}
				max={maxValue ?? 99}
				value={minValue === undefined ? "" : minValue}
				onChange={e => {
					const val = e.target.value;
					setMinValue(val === "" ? undefined : Number(val));
				}}
				className="w-14 px-1 py-0.5 text-xs"
			/>
			<span className="text-xs">to</span>
			<Input
				id="subdivision-max"
				type="number"
				min={minValue ?? 1}
				max={99}
				value={maxValue === undefined ? "" : maxValue}
				onChange={e => {
					const val = e.target.value;
					setMaxValue(val === "" ? undefined : Number(val));
				}}
				className="w-14 px-1 py-0.5 text-xs"
			/>
		</div>
	);
}

export default function ListsReportLandingContent() {
	const [selectedReport, setSelectedReport] = useState<string>("");
	const [seasonCode, setSeasonCode] = useState<string>("");
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const prevSeasonCodeRef = useRef<string>("");
	const [needsDivisionSelector, setNeedsDivisionSelector] = useState<boolean>(false);
	const [allDivisions, setAllDivisions] = useState<boolean>(true);
	const [selectedDivisions, setSelectedDivisions] = useState<string>("");
	const [reportData, setReportData] = useState<unknown[]>([]);
	const [dataFetched, setDataFetched] = useState<boolean>(false);
	const [needsFiscalYearSelector, setNeedsFiscalYearSelector] = useState<boolean>(false);
	const [fiscalYear, setFiscalYear] = useState<string>("");
	const [goodStanding, setGoodStanding] = useState<boolean>(true);
	const [badStanding, setBadStanding] = useState<boolean>(false);
	const [lifeMember, setLifeMember] = useState<boolean>(false);
	const [needSeasonCode, setNeedSeasonCode] = useState<boolean>(true);
	const [filterBySeason, setFilterBySeason] = useState<boolean>(true);
	const [filterByJoinDate, setFilterByJoinDate] = useState<boolean>(false);
	const [joinDate, setJoinDate] = useState<Date | null>(null);
	const [subdivisionMin, setSubdivisionMin] = useState<number | undefined>(1);
	const [subdivisionMax, setSubdivisionMax] = useState<number | undefined>(99);
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [mailingLabelsImported, setMailingLabelsImported] = useState(false);
	const [sortByZip, setSortByZip] = useState(false);
	const [sortByName, setSortByName] = useState(true);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const queryClient = useQueryClient();

	// TanStack Query hooks
	const { 
		data: seasonData, 
		error: seasonError,
		isLoading: isSeasonLoading 
	} = useSeasonData(seasonCode);

	const { 
		data: rosterDivisions = [], 
		error: divisionsError,
		isLoading: isDivisionsLoading 
	} = useRosterDivisions(
		seasonCode, 
		allDivisions && (needsDivisionSelector || filterBySeason)
	);

	// Update season description and fiscal year when season data changes
	useEffect(() => {
		if (seasonData) {
			setFiscalYear(seasonData?.fiscalYear || "");
		}
	}, [seasonData]);

	// Calculate all divisions string from query result
	const allDivisionsString = rosterDivisions.length > 0 
		? rosterDivisions.map(d => d.division).join(", ")
		: "";

	const handleFiscalYearSelect = useCallback((value: string) => {
		setFiscalYear(value);
	}, []);

	const handleSeasonCodeSelect = useCallback((value: string) => {
		setSeasonCode(value);
	}, []);

	const handleReportSelect = (
		value: string,
		requiresWeek?: boolean,
		minimumPoints?: boolean,
		divisionSelector?: boolean,
		fiscalYear?: boolean,
		needSeasonCode?: boolean
	) => {
		// Only reset data if the report actually changes
		const isSameReport = value === selectedReport;
		setSelectedReport(value);
		setNeedsDivisionSelector(!!divisionSelector);
		setNeedsFiscalYearSelector(!!fiscalYear);
		setNeedSeasonCode(!!needSeasonCode);
		if (!isSameReport) {
			setReportData([]); // Clear previous report data only if report changes
			setDataFetched(false); // Reset dataFetched so PDFDownloadLink is not rendered
			setFilterByJoinDate(false);
			setFilterBySeason(true);
		}
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

	// Optimized sorting logic for mailingLabels - only compute when we have data
	const sortedMailingLabels = React.useMemo(() => {
		// Early returns to avoid unnecessary processing
		if (!selectedReport.includes("mailingLabels")) return [];
		if (!Array.isArray(reportData) || reportData.length === 0) return [];
		
		const data = reportData as MailingList[];
		
		// Only sort if we actually need to display sorted data
		if (sortByZip) {
			// More efficient zip code extraction and comparison
			return [...data].sort((a, b) => {
				const zipA = a.addressLineTwo?.slice(-5) || "";
				const zipB = b.addressLineTwo?.slice(-5) || "";
				return zipA.localeCompare(zipB);
			});
		}
		
		// Default: sort by name (more efficient)
		return [...data].sort((a, b) => {
			const nameA = a.name || "";
			const nameB = b.name || "";
			return nameA.localeCompare(nameB);
		});
	}, [reportData, selectedReport, sortByZip]);

	// Only sort mailing labels by name after fetching data
	useEffect(() => {
		if (mailingLabelsImported) {
			setSortByZip(false);
		}
	}, [mailingLabelsImported]);

	// Reset data fetched state when seasonCode actually changes to a different value
	useEffect(() => {
		if (seasonCode !== prevSeasonCodeRef.current && prevSeasonCodeRef.current !== "") {
			setDataFetched(false);
			setReportData([]);
		}
		prevSeasonCodeRef.current = seasonCode;
	}, [seasonCode]);

	// Reset data when other key parameters change
	useEffect(() => {
		setDataFetched(false);
		setReportData([]);
	}, [selectedDivisions, allDivisions, subdivisionMin, subdivisionMax, joinDate, goodStanding, badStanding, lifeMember, fiscalYear, filterBySeason, filterByJoinDate]);

	// Reset data when switching between filter types
	useEffect(() => {
		if (filterBySeason !== filterByJoinDate) {
			setDataFetched(false);
			setReportData([]);
		}
	}, [filterBySeason, filterByJoinDate]);

	const renderReportContent = () => {
		// Show loading state for season data when needed
		if (!filterByJoinDate && needSeasonCode && isSeasonLoading) {
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
		if (!filterByJoinDate && needSeasonCode && seasonError) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-red-500 text-center">
						Error loading season data. Please try again.
					</p>
				</div>
			);
		}

		// Only require seasonCode if not filtering by join date
		if (!filterByJoinDate && !seasonCode) {
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

		// Show loading state for divisions
		if (
			needsDivisionSelector &&
			seasonCode &&
			allDivisions &&
			isDivisionsLoading
		) {
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
						<p className="text-gray-500">Loading divisions...</p>
					</div>
				</div>
			);
		}

		// Show error state for divisions
		if (
			needsDivisionSelector &&
			seasonCode &&
			allDivisions &&
			divisionsError
		) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-red-500 text-center">
						Error loading divisions. Please try again.
					</p>
				</div>
			);
		}

		// If divisions are required but there are no divisions available, show a message
		if (
			needsDivisionSelector &&
			seasonCode &&
			allDivisions &&
			(allDivisionsString.trim() === "" || !allDivisionsString)
		) {
			return (
				<div className="flex h-full items-center justify-center">
					<p className="text-gray-500 text-center">
						No divisions available for the selected season.
					</p>
				</div>
			);
		}

		// Require divisions if needed before fetching report data
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
					apiRoute={
						needsDivisionSelector && !allDivisions && !selectedDivisions
							? ""
							: selectedReport + `?seasonCode=${seasonCode}&divisions=${effectiveDivisionsString}`
					}
					columns={captainsReportColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
				/>
			);
		}

		if (selectedReport.includes("electionList")) {
			return (
				<ReportDisplay<ListsElectionList>
					apiRoute={selectedReport + `?fiscalYear=${fiscalYear}&includeBadStanding=${badStanding}&includeGoodStanding=${goodStanding}`}
					columns={electionListColumns}
					className="h-full"
					onDataFetch={handleDataFetch}
				/>
			);
		}

		if (selectedReport.includes("membershipList")) {	
			// Only render the ReportDisplay for join date if joinDate is set (not null/undefined)
			if (filterByJoinDate && !joinDate) {
				return (
					<div className="flex h-full items-center justify-center">
						<p className="text-gray-500 text-center">
							Please select a join date to continue...
						</p>
					</div>
				);
			}
			return (
				<>
					{allDivisionsString.trim() !== "" ? (
						<>
							{filterBySeason && (
								// Only render if divisions are filled out
								(needsDivisionSelector
									? (allDivisions || selectedDivisions)
									: true
								) ? (
									<ReportDisplay<ListsMembership>
										apiRoute={
											selectedReport +
											`?seasonCode=${seasonCode}&divisions=${effectiveDivisionsString}&minSubdivision=${subdivisionMin ?? 1}&maxSubdivision=${subdivisionMax ?? 99}`
										}
										columns={membershipListColumnsFilterBySeason}
										className="h-full"
										onDataFetch={handleDataFetch}
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										<p className="text-gray-500 text-center">
											Please select at least one division to continue...
										</p>
									</div>
								)
							)}
							{filterByJoinDate && joinDate && (
								<ReportDisplay<ListsMembership>
									apiRoute={
										selectedReport +
										`?establishedDate=${encodeURIComponent(joinDate.toISOString())}&goodStanding=${goodStanding}&badStanding=${badStanding}&lifetimeMember=${lifeMember}`
									}
									columns={membershipListColumnsFilterByJoinDate}
									className="h-full"
									onDataFetch={handleDataFetch}
								/>
							)}
						</>
					) : (
						<div className="flex h-full items-center justify-center">
							<p className="text-red-500 text-center">
								No divisions available for the selected season.
							</p>
						</div>
					)}
				</>
			);
		}

		if (selectedReport.includes("placesReport")) {	
			// Only render the ReportDisplay for join date if joinDate is set (not null/undefined)
			if (filterByJoinDate && !joinDate) {
				return (
					<div className="flex h-full items-center justify-center">
						<p className="text-gray-500 text-center">
							Please select a join date to continue...
						</p>
					</div>
				);
			}
			return (
				<>
					{filterBySeason && (
						// Only render if divisions are filled out
						(needsDivisionSelector
							? (allDivisions || selectedDivisions)
							: true
						) ? (
							<ReportDisplay<ListsPlaces>
								apiRoute={
									selectedReport +
									`?seasonCode=${seasonCode}`
								}
								columns={placesListColumns}
								className="h-full"
								onDataFetch={handleDataFetch}
							/>
						) : (
							<div className="flex h-full items-center justify-center">
								<p className="text-gray-500 text-center">
									Please select at least one division to continue...
								</p>
							</div>
						)
					)}
					{filterByJoinDate && joinDate && (
						<ReportDisplay<ListsPlaces>
							apiRoute={
								selectedReport +
								`?establishedDate=${encodeURIComponent(joinDate.toISOString())}&goodStanding=${goodStanding}&badStanding=${badStanding}`
							}
							columns={placesListColumns}
							className="h-full"
							onDataFetch={handleDataFetch}
						/>
					)}
				</>
			);
		}

		if (selectedReport.includes("teamReportLists")) {	
			// Only render the ReportDisplay for join date if joinDate is set (not null/undefined)
			if (filterByJoinDate && !joinDate) {
				return (
					<div className="flex h-full items-center justify-center">
						<p className="text-gray-500 text-center">
							Please select a join date to continue...
						</p>
					</div>
				);
			}
			
			return (
				<>
					{allDivisionsString.trim() !== "" ? (
						<>
							{filterBySeason && (
								// Only render if divisions are filled out
								(needsDivisionSelector
									? (allDivisions || selectedDivisions)
									: true
								) ? (
									<ReportDisplay<ListsTeams>
										apiRoute={
											selectedReport +
											`?seasonCode=${seasonCode}&divisions=${effectiveDivisionsString}&minSubdivision=${subdivisionMin ?? 1}&maxSubdivision=${subdivisionMax ?? 99}`
										}
										columns={teamsListColumns}
										className="h-full"
										onDataFetch={handleDataFetch}
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										<p className="text-gray-500 text-center">
											Please select at least one division to continue...
										</p>
									</div>
								)
							)}
							{filterByJoinDate && joinDate && (
								<ReportDisplay<ListsTeams>
									apiRoute={
										selectedReport +
										`?establishedDate=${encodeURIComponent(joinDate.toISOString())}`
									}
									columns={teamsListColumns}
									className="h-full"
									onDataFetch={handleDataFetch}
								/>
							)}
						</>
					) : (
						<div className="flex h-full items-center justify-center">
							<p className="text-red-500 text-center">
								No divisions available for the selected season.
							</p>
						</div>
					)}
				</>
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
		const seasonCodeDesc = seasonData?.desc || "";

		// Enhanced validation to prevent PDF generation during data fetching
		if (!selectedReport) return null;

		// For mailing labels, we don't need season or join date validation
		const needsSeasonValidation = !selectedReport.includes("mailingLabels") && filterBySeason;
		const needsJoinDateValidation = !selectedReport.includes("mailingLabels") && filterByJoinDate;

		if (
			(needsSeasonValidation && (!seasonCode || !seasonCodeDesc)) ||
			(needsJoinDateValidation && !joinDate)
		) return null;

		// Don't render PDF download while data is being fetched or if no data is available
		if (!dataFetched || !reportData || !Array.isArray(reportData) || reportData.length === 0) {
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
			return null;
		}

		// Additional check for season data loading state
		if (filterBySeason && needSeasonCode && isSeasonLoading) {
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
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span className="text-gray-600">Loading season data...</span>
				</div>
			);
		}

		let document: JSX.Element | null = null;
		let fileName = "";

		// Validate data before creating PDF document
		try {
			if (selectedReport.includes("captainReport")) {
				const captainsData = reportData as ListsCaptains[];
				if (!Array.isArray(captainsData) || captainsData.length === 0) return null;
				
				document = (
					<ListsReportCaptainsReport
						data={captainsData}
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
			} else if (selectedReport.includes("electionList")) {
				const electionData = reportData as ListsElectionList[];
				if (!Array.isArray(electionData) || electionData.length === 0) return null;
				
				document = (
					<ListsReportElectionListReport
						data={electionData}
						desc={`Fiscal Year: ${fiscalYear}`}
					/>
				);
				fileName = `election-list-${fiscalYear}-${new Date()
					.toLocaleDateString("en-US", {
						timeZone: "America/New_York",
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "")}.pdf`;
			} else if (selectedReport.includes("membershipList")) {
				const membershipData = reportData as ListsMembership[];
				if (!Array.isArray(membershipData) || membershipData.length === 0) return null;
				
				if (filterByJoinDate) {
					if (!joinDate) return null; // Additional validation for joinDate
					document = (
						<ListsReportMembershipListJoinDateReport
							data={membershipData}
							desc={`Established Date: ${joinDate.toLocaleDateString("en-US", {
								timeZone: "America/New_York",
								month: "2-digit",
								day: "2-digit",
								year: "numeric",
							})}`}
						/>
					);
					fileName = `membership-list-established-date-${joinDate.toISOString().split("T")[0]}-${new Date()
						.toLocaleDateString("en-US", {
							timeZone: "America/New_York",
							month: "2-digit",
							day: "2-digit",
							year: "numeric",
						})
						.replace(/\//g, "")}.pdf`;
				} else {
					document = (
						<ListsReportMembershipListSeasonReport
							data={membershipData}
							desc={seasonCodeDesc}
						/>
					);
					fileName = `membership-list-season-${seasonCode}-${new Date()
						.toLocaleDateString("en-US", {
							timeZone: "America/New_York",
							month: "2-digit",
							day: "2-digit",
							year: "numeric",
						})
						.replace(/\//g, "")}.pdf`;
				}
			} else if (selectedReport.includes("placesReport")) {
				const placesData = reportData as ListsPlaces[];
				if (!Array.isArray(placesData) || placesData.length === 0) return null;
				
				if (filterByJoinDate) {
					if (!joinDate) return null; // Additional validation for joinDate
					document = (
						<ListsReportPlacesListJoinDateReport
							data={placesData}
							desc={`Established Date: ${joinDate.toLocaleDateString("en-US", {
								timeZone: "America/New_York",
								month: "2-digit",
								day: "2-digit",
								year: "numeric",
							})}`}
						/>
					);
					fileName = `places-list-established-date-${joinDate.toISOString().split("T")[0]}-${new Date()
						.toLocaleDateString("en-US", {
							timeZone: "America/New_York",
							month: "2-digit",
							day: "2-digit",
							year: "numeric",
						})
						.replace(/\//g, "")}.pdf`;
				} else {
					document = (
						<ListsReportPlacesListSeasonReport
							data={placesData}
							desc={seasonCodeDesc}
						/>
					);
					fileName = `places-list-season-${seasonCode}-${new Date()
						.toLocaleDateString("en-US", {
							timeZone: "America/New_York",
							month: "2-digit",
							day: "2-digit",
							year: "numeric",
						})
						.replace(/\//g, "")}.pdf`;
				}
			} else if (selectedReport.includes("teamReportLists")) {
				const teamsData = reportData as ListsTeams[];
				if (!Array.isArray(teamsData) || teamsData.length === 0) return null;
				
				if (filterByJoinDate) {
					if (!joinDate) return null; // Additional validation for joinDate
					document = (
						<ListsReportTeamsListJoinDateReport
							data={teamsData}
							desc={`Established Date: ${joinDate.toLocaleDateString("en-US", {
								timeZone: "America/New_York",
								month: "2-digit",
								day: "2-digit",
								year: "numeric",
							})}`}
						/>
					);
					fileName = `teams-list-established-date-${joinDate.toISOString().split("T")[0]}-${new Date()
						.toLocaleDateString("en-US", {
							timeZone: "America/New_York",
							month: "2-digit",
							day: "2-digit",
							year: "numeric",
						})
						.replace(/\//g, "")}.pdf`;
				} else {
					document = (
						<ListsReportTeamsListSeasonReport
							data={teamsData}
							desc={seasonCodeDesc}
						/>
					);
					fileName = `teams-list-season-${seasonCode}-${new Date()
						.toLocaleDateString("en-US", {
							timeZone: "America/New_York",
							month: "2-digit",
							day: "2-digit",
							year: "numeric",
						})
						.replace(/\//g, "")}.pdf`;
				}
			} else if (selectedReport.includes("mailingLabels")) {
				const mailingData = sortedMailingLabels as MailingList[];
				if (!Array.isArray(mailingData) || mailingData.length === 0) return null;
				
				document = (
					<ListsReportMailingLabels
						data={mailingData}
					/>
				);
				fileName = `mailing-labels-${new Date()
					.toLocaleDateString("en-US", {
						timeZone: "America/New_York",
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "")}.pdf`;
			}
		} catch (error) {
			console.error("Error generating PDF document:", error);
			return null;
		}

		if (!document) return null;

		// For mailing labels, use manual download for better performance
		if (selectedReport.includes("mailingLabels")) {
			return (
				<button
					onClick={() => handleManualPDFDownload(document, fileName)}
					disabled={isGeneratingPDF}
					className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-black shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 transition-colors"
				>
					{isGeneratingPDF ? (
						<>
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
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
				</button>
			);
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

	const handleImportSuccess = () => {
		setMailingLabelsImported(true);
		queryClient.invalidateQueries({ queryKey: [selectedReport] });
	};

	// Manual PDF download handler for better performance
	const handleManualPDFDownload = async (pdfDocument: JSX.Element, fileName: string) => {
		setIsGeneratingPDF(true);
		try {
			const blob = await pdf(pdfDocument).toBlob();
			const url = URL.createObjectURL(blob);
			const link = window.document.createElement('a');
			link.href = url;
			link.download = fileName;
			link.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	// Function to compute player and place ledaIds only when needed
	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between">
				<FolderTabMed title="Report Selection" className="w-fit">
					<div className="flex gap-6">
						<div className="flex gap-4 flex-row">
							{needSeasonCode && (
								<div className="flex flex-col gap-1">
									<Label htmlFor="season-code-selector">Season</Label>
									<div className="flex flex-col gap-1">
										<SeasonCodeSelector
											disabled={currentSeason}
											handleSelect={handleSeasonCodeSelect}
											useCurrentSeason={currentSeason}
											seasonCode={seasonCode}
										/>
										<div className="flex items-center gap-2 mt-2">
											<Checkbox
												id="current-season-checkbox"
												checked={currentSeason}
												onCheckedChange={() =>
													setCurrentSeason(!currentSeason)
												}
											/>
											<Label htmlFor="current-season-checkbox">
												Current Season?
											</Label>
										</div>
									</div>
								</div>
							)}
							{needsFiscalYearSelector && (
								<div className="flex flex-col gap-1">
									<Label htmlFor="fiscal-year-selector">Fiscal Year</Label>
									<FiscalYearSelector
										disabled={currentSeason}
										handleSelect={handleFiscalYearSelect}
										fiscalYear={fiscalYear}
									/>
								</div>
							)}
							<div className="flex flex-col gap-1">
								<Label htmlFor="report-selector">Report</Label>
								<div className="flex items-center gap-2">
									<ReportSelector
										handleSelect={handleReportSelect}
										selectedReport={selectedReport}
										type="lists"
										disabled={needSeasonCode ? !seasonCode : false}
									/>
									{selectedReport.includes("mailingLabels") && (
										<>
											<Button
												variant="outline"
												size="default"
												className="hover:bg-gray-100 border-gray-300 text-gray-700"
												onClick={() => setImportDialogOpen(true)}
											>
												<ImportIcon className="mr-2 h-4 w-4" />
												Import
											</Button>
											<MailingLabelsAddDialog
												onAddSuccess={() => {
													setMailingLabelsImported(true);
												}}
											/>
											{importDialogOpen && (
												<MailingLabelsImportDialog
													open={importDialogOpen}
													onOpenChange={setImportDialogOpen}
													onImportSuccess={handleImportSuccess}
												/>
											)}
											{/* Sorting checkboxes next to Add button */}
											<div className="flex items-center gap-4 ml-4">
												<Checkbox
													id="sort-by-name-checkbox"
													checked={sortByName}
													onCheckedChange={() => {
														setSortByName(true);
														setSortByZip(false);
													}}
												/>
												<Label htmlFor="sort-by-name-checkbox">Sort by Name</Label>
												<Checkbox
													id="sort-by-zip-checkbox"
													checked={sortByZip}
													onCheckedChange={() => {
														setSortByZip(true);
														setSortByName(false);
													}}
												/>
												<Label htmlFor="sort-by-zip-checkbox">Sort by Zip Code</Label>
											</div>
										</>
									)}
								</div>
								{needsFiscalYearSelector && (
									<div className="flex flex-row gap-6 mt-2">
										<div className="flex items-center gap-2">
											<Checkbox
												id="good-standing-checkbox"
												checked={goodStanding}
												onCheckedChange={() => setGoodStanding(!goodStanding)}
											/>
											<Label htmlFor="good-standing-checkbox">Good Standing</Label>
										</div>
										<div className="flex items-center gap-2">
											<Checkbox
											id="bad-standing-checkbox"
												checked={badStanding}
												onCheckedChange={() => setBadStanding(!badStanding)}
											/>
											<Label htmlFor="bad-standing-checkbox">Bad Standing</Label>
										</div>
									</div>
								)}
								{(!needSeasonCode && !selectedReport.includes("mailingLabels")) && (
									<div className="flex flex-row gap-6 mt-2">
										<div className="flex items-center gap-2">
											<Checkbox
												id="filter-by-season-checkbox"
												checked={filterBySeason}
												onCheckedChange={() => {
													setFilterBySeason(true);
													setFilterByJoinDate(false);
													setJoinDate(null); // Clear join date when switching to season filter
												}}
											/>
											<Label htmlFor="filter-by-season-checkbox">Filter By Season</Label>
										</div>
										<div className="flex items-center gap-2">
											<Checkbox
												id="filter-by-join-date-checkbox"
												checked={filterByJoinDate}
												onCheckedChange={() => {
													setFilterByJoinDate(true);
													setFilterBySeason(false);
													setSeasonCode(""); // Clear season code when switching to join date filter
												}}
											/>
											<Label htmlFor="filter-by-join-date-checkbox">Filter By Established Date</Label>
										</div>
									</div>
								)}
							</div>
							{(needsDivisionSelector && (!selectedReport.includes("membershipList") || !selectedReport.includes("placesReport") || !selectedReport.includes("teamReportLists"))) && (
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
							{(filterBySeason && (selectedReport.includes("membershipList") || selectedReport.includes("placesReport") || selectedReport.includes("teamReportLists"))) && (
								<>
									<div className="flex flex-col gap-1">
										<Label htmlFor="season-code-selector">Season</Label>
										<div className="flex flex-col gap-1">
											<SeasonCodeSelector
												disabled={currentSeason}
												handleSelect={handleSeasonCodeSelect}
												useCurrentSeason={currentSeason}
												seasonCode={seasonCode}
											/>
											<div className="flex items-center gap-2 mt-2">
												<Checkbox
													id="current-season-checkbox"
													checked={currentSeason}
													onCheckedChange={() =>
														setCurrentSeason(!currentSeason)
													}
												/>
												<Label htmlFor="current-season-checkbox">
													Current Season?
												</Label>
											</div>
										</div>
									</div>
									{!selectedReport.includes("placesReport") && (
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-4">
												<Checkbox
													id="all-divisions-checkbox"
													checked={allDivisions}
													onCheckedChange={() =>
														setAllDivisions(!allDivisions)
													}
												/>
												<Label htmlFor="all-divisions-checkbox">
													All Divisions?
												</Label>
											</div>
											<div className="flex items-center gap-4">
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
											<div className="flex items-center gap-4 mt-2">
												<SubdivisionRangeSelector
													min={subdivisionMin ?? 1}
													max={subdivisionMax ?? 99}
													onChange={(min, max) => {
														setSubdivisionMin(min);
														setSubdivisionMax(max);
													}}
												/>
											</div>
										</div>
									)}
								</>
							)}
							{(filterByJoinDate && (selectedReport.includes("membershipList") || selectedReport.includes("placesReport") || selectedReport.includes("teamReportLists"))) && (
								<>
									<div className="flex flex-col gap-1">
										<Label htmlFor="join-date-selector">Join Date</Label>
										<div className="flex gap-4 items-center">
											<Input
												type="date"
												id="join-date-selector"
												className="border rounded px-2 py-1 text-sm border-gray-200"
												value={
													joinDate
														? new Date(
																joinDate.toLocaleString("en-US", {
																	timeZone: "America/New_York",
																})
														)
																.toISOString()
																.split("T")[0]
														: ""
												}
												onChange={e => {
													const value = e.target.value;
													if (value) {
														const [year, month, day] = value.split("-");
														const estDate = new Date(
															Date.UTC(
																Number(year),
																Number(month) - 1,
																Number(day),
																5, 0, 0
															)
														);
														setJoinDate(estDate);
													} else {
														setJoinDate(null);
													}
												}}
												placeholder="Pick a date"
											/>
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<div className="flex flex-col gap-1">
											<div className="flex flex-col gap-2">
												{!selectedReport.includes("teamReportLists") && (
													<>
														<div className="flex items-center gap-2">
															<Checkbox
																id="good-standing-checkbox"
																checked={goodStanding}
																onCheckedChange={() => setGoodStanding(!goodStanding)}
															/>
															<Label htmlFor="good-standing-checkbox">Good Standing</Label>
														</div>
														<div className="flex items-center gap-2">
															<Checkbox
																id="bad-standing-checkbox"
																checked={badStanding}
																onCheckedChange={() => setBadStanding(!badStanding)}
															/>
															<Label htmlFor="bad-standing-checkbox">Bad Standing</Label>
														</div>
														{selectedReport.includes("membershipList") && (
															<div className="flex items-center gap-2">
																<Checkbox
																	id="life-time-member-checkbox"
																	checked={lifeMember}
																	onCheckedChange={() => setLifeMember(!lifeMember)}
																/>
																<Label htmlFor="life-time-member-checkbox">Life Time Member</Label>
															</div>
														)}
													</>
												)} 
											</div>
										</div>
									</div>
								</>
							)}
						</div>
						
					</div>
				</FolderTabMed>
				{/* Only render download link if all required fields are filled and there is data */}
				{selectedReport &&
					dataFetched &&
					reportData.length > 0 &&
					(
						(
							// For season filter, require seasonCode and seasonCodeDesc
							filterBySeason && seasonCode && seasonData?.desc
						) ||
						(
							// For join date filter, require joinDate
							filterByJoinDate && joinDate
						) ||
						(
							// For mailing labels, no additional requirements needed
							selectedReport.includes("mailingLabels")
						)
					) && (
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
					{selectedReport.includes("mailingLabels")
						? <ReportDisplay<MailingList>
							apiRoute={selectedReport}
							columns={mailingLabelsColumns}
							className="h-full"
							onDataFetch={handleDataFetch}
							mailingLabelsImported={mailingLabelsImported}
							// Only use sortedMailingLabels when we have actual data to prevent circular dependency
							{...(reportData.length > 0 ? { dataOverride: sortedMailingLabels as MailingList[] } : {})}
						/>
						: renderReportContent()
					}
				</div>
			</div>
		</div>
	);
}