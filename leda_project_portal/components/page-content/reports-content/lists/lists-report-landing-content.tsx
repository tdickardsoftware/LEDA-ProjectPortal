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
import { ListsCaptains, ListsElectionList, ListsMembership, ListsPlaces, ListsTeams, RosterDivision } from "@/lib/definitions";
import ReportDisplay from "@/components/ui/report-display";
import { captainsReportColumns, electionListColumns, membershipListColumnsFilterByJoinDate, membershipListColumnsFilterBySeason, placesListColumns, teamsListColumns } from "@/lib/report-definitions";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ListsReportCaptainsReport from "./react-pdf/lists-report-captains-report";
import ListsReportElectionListReport from "./react-pdf/lists-report-election-list-report";
import FiscalYearSelector from "@/components/ui/fiscal-year-selector";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
// TO DO
// [ ] - Implement that for join date implement good standing and bad standing filtering, also add honorary members filtering
// [ ] - For  Season Filtering, add subdivision filtering and division filtering
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
	const [seasonCodeDesc, setSeasonCodeDesc] = useState<string>("");
	const [needsDivisionSelector, setNeedsDivisionSelector] = useState<boolean>(false);
	const [allDivisions, setAllDivisions] = useState<boolean>(true);
	const [selectedDivisions, setSelectedDivisions] = useState<string>("");
	const [allDivisionsString, setAllDivisionsString] = useState<string>("");
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

	const handleFiscalYearSelect = useCallback((value: string) => {
		setFiscalYear(value);
	}, []);

	const handleSeasonCodeSelect = useCallback(
		async (value: string) => {
			setSeasonCode(value);
			try {
				const season = await (
					await fetch(`${seasonRoute}?seasonCode=${value}`)
				).json();
				setSeasonCodeDesc(season?.desc || "");
				setFiscalYear(season?.fiscalYear || "");
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
			// Fetch if either needsDivisionSelector or filterBySeason is true
			if (!seasonCode || !allDivisions || (!needsDivisionSelector && !filterBySeason)) return;

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
	}, [seasonCode, needsDivisionSelector, allDivisions, filterBySeason]);

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

	const renderReportContent = () => {
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
		} else if (selectedReport.includes("electionList")) {
			document = (
				<ListsReportElectionListReport
					data={reportData as ListsElectionList[]}
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
								<ReportSelector
									handleSelect={handleReportSelect}
									selectedReport={selectedReport}
									type="lists"
									disabled={needSeasonCode ? !seasonCode : false}
								/>
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
								{!needSeasonCode && (
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
				{selectedReport && seasonCode && seasonCodeDesc &&
					dataFetched &&
					reportData.length > 0 &&
					(selectedReport.includes("captainReport") || selectedReport.includes("electionList")) && (
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