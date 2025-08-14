"use client";

import { useState, useCallback, useEffect, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import WeekSelector from "@/components/ui/week-selector";
import { Input } from "@/components/ui/input";
import ReportDisplay from "../../../ui/report-display";
import { BarAffiliationFeeNotPaid, MentionBestOfDivision, MentionLeaguePlay, MentionPlaque, Ton80, PlayerNoForm, PlayerNotPaid, TeamFeeNotPaid, TopDarter, LeaguePlayWeeklyScoresheets } from "@/lib/definitions";
import { leaguePlayBarAffiliationFeeNotPaidColumns, mentionBestOfDivisionColumns, mentionLeaguePlayColumns, mentionPlaqueColumns, ton80Columns, playerNoFormColumns, playerNotPaidColumns, teamFeeNotPaidColumns, topDarterColumns, weeklyScoresheetsColumns } from "@/lib/report-definitions";
import LeaguePlayBarAffiliationFeeNotPaidReport from "./react-pdf/league-play-bar-affiliation-fee-not-paid";
import LeaguePlayMentionBestOfDivisionReport from "./react-pdf/league-play-mention-best-of-division-report";
import LeaguePlayMentionPlaqueReport from "./react-pdf/league-play-mention-plaque-report";
import LeaguePlayMentionLeaguePlayReport from "./react-pdf/league-play-mention-league-play-report";
import LeaguePlayPlayerNoFormReport from "./react-pdf/league-play-player-no-form-report";
import LeaguePlayPlayerNotPaidReport from "./react-pdf/league-play-player-not-paid-report";
import LeaguePlayTeamFeeNotPaidReport from "./react-pdf/league-play-team-fee-not-paid-report";
import LeaguePlayTopDarterReport from "./react-pdf/league-play-top-darter-report";
import LeaguePlayWeeklyScoresheetsReport from "./react-pdf/league-play-weekly-scoresheets-report";
import LeaguePlayTon80Report from "./react-pdf/league-play-ton80-report";
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
		staleTime: 60 * 1000, // 5 minutes
	});
};

export default function LeaguePlayReportLandingContent() {
    const [seasonCode, setSeasonCode] = useState<string>("");
    const [selectedReport, setSelectedReport] = useState<string>("");
    const [currentSeason, setCurrentSeason] = useState<boolean>(true);
    const [requiresWeek, setRequiresWeek] = useState<boolean>(false);
    const [reportData, setReportData] = useState<unknown[]>([]);
    const [dataFetched, setDataFetched] = useState<boolean>(false);
    const [needsMinimumPoints, setNeedsMinimumPoints] = useState<boolean>(false);
    const [minimumPoints, setMinimumPoints] = useState<number | undefined>(0);
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [minimumPointsInput, setMinimumPointsInput] = useState<string>("0");

    // TanStack Query hook
    const { 
        data: seasonData, 
        error: seasonError,
        isLoading: isSeasonLoading 
    } = useSeasonData(seasonCode);

    // Get season description from query result
    const seasonCodeDesc = seasonData?.desc || "";

    const handleSeasonCodeSelect = useCallback((value: string) => {
        setSeasonCode(value);
    }, []);

    const handleReportSelect = (value: string, requiresWeekFlag?: boolean, minimumPointsFlag?: boolean) => {
        const isSameReport = value === selectedReport;
        setSelectedReport(value);
        setRequiresWeek(!!requiresWeekFlag);
        setNeedsMinimumPoints(!!minimumPointsFlag);
        setSelectedWeek(""); // Reset week when report changes
        if (!isSameReport) {
            setReportData([]); // Clear previous report data only if report changes
            setDataFetched(false); // Reset dataFetched so PDFDownloadLink is not rendered
        }
    };

    const handleDataFetch = useCallback((data: unknown[]) => {
		setReportData(data);
		setDataFetched(true);
	}, []);

    // Debounce minimumPoints input
    useEffect(() => {
        const handler = setTimeout(() => {
            if (minimumPointsInput === "") {
                setMinimumPoints(undefined);
            } else {
                const value = parseFloat(minimumPointsInput);
                setMinimumPoints(isNaN(value) ? undefined : value);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [minimumPointsInput]);

    // Placeholder PDF document for download link
    const renderPDFDownload = () => {
        if (!selectedReport || !seasonCode) return null;

        // Show loading spinner if data is not yet fetched
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

        let document: JSX.Element;
        let fileName: string;
        if (selectedReport.includes("barAffiliationFeeNotPaid")) {
            document = (
                <LeaguePlayBarAffiliationFeeNotPaidReport
                    data={reportData as BarAffiliationFeeNotPaid[]}
                    desc={seasonCodeDesc}
                />
            );
            fileName = `barAffiliationFeeNotPaid-${seasonCode}-${new Date()
            .toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("mentionBestOfDivision")) {
            document = (
                <LeaguePlayMentionBestOfDivisionReport
                    data={reportData as MentionBestOfDivision[]}
                />
            );
            fileName = `mentionBestOfDivision-${seasonCode}-${new Date()
            .toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("mentionPlaque")) {
            document = (
                <LeaguePlayMentionPlaqueReport
                    data={reportData as MentionPlaque[]}
                    desc={seasonCodeDesc}
                    minimumMentions={minimumPoints || 0}
                />
            );
            fileName = `mentionPlaque-${seasonCode}-${new Date()
            .toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("mentionLeaguePlay")) {
            document = (
                <LeaguePlayMentionLeaguePlayReport
                    data={reportData as MentionLeaguePlay[]}
                    desc={seasonCodeDesc}
                />
            );
            fileName = `mentionLeaguePlay-${seasonCode}-${new Date()
            .toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("playerNoForm")) {
            document = (
                <LeaguePlayPlayerNoFormReport
                    data={reportData as PlayerNoForm[]}
                    desc={seasonCodeDesc}
                />
            );
            fileName = `playerNoForm-${seasonCode}-${new Date()
            .toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("playerNotPaid")) {
            document = (
                <LeaguePlayPlayerNotPaidReport
                    data={reportData as PlayerNotPaid[]}
                    desc={seasonCodeDesc}
                />
            );
            fileName = `playerNotPaid-${seasonCode}-${new Date()
            .toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("teamFeeNotPaid")) {
            document = (
                <LeaguePlayTeamFeeNotPaidReport
                    data={reportData as TeamFeeNotPaid[]}
                    desc={seasonCodeDesc}
                />
            );
            fileName = `teamFeeNotPaid-${seasonCode}-${new Date()
                .toLocaleDateString("en-US", {
                    timeZone: "America/New_York",
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("topDarter")) {
            // Extract weekNum from selectedWeek ("DateX" -> "X")
            const weekNum = selectedWeek.replace(/^Date/, "");
            document = (
                <LeaguePlayTopDarterReport
                    data={reportData as TopDarter[]}
                    desc={seasonCodeDesc}
                    minimumPoints={minimumPoints?.toString() || "0"}
                />
            );
            fileName = `topDarter-${seasonCode}-week${weekNum}-${new Date()
                .toLocaleDateString("en-US", {
                    timeZone: "America/New_York",
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("weeklyScoresheets")) {
            // Extract weekNum from selectedWeek ("DateX" -> "X")
            const weekNum = selectedWeek.replace(/^Date/, "");
            document = (
                <LeaguePlayWeeklyScoresheetsReport
                    data={reportData as LeaguePlayWeeklyScoresheets[]}
                    weekNum={weekNum}
                    desc={seasonCodeDesc}
                />
            );
            fileName = `weeklyScoresheets-${seasonCode}-week${weekNum}-${new Date()
                .toLocaleDateString("en-US", {
                    timeZone: "America/New_York",
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, "")}.pdf`;
        } else if (selectedReport.includes("ton80")) {
            // Extract weekNum from selectedWeek ("DateX" -> "X")
            const weekNum = selectedWeek.replace(/^Date/, "");
            document = (
                <LeaguePlayTon80Report
                    data={reportData as Ton80[]}
                    desc={seasonCodeDesc}
                    weekNum={weekNum}
                />
            );
            fileName = `ton80-${seasonCode}-week${weekNum}-${new Date()
                .toLocaleDateString("en-US", {
                    timeZone: "America/New_York",
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                })
                .replace(/\//g, "")}.pdf`;
        } else {
            // Do not render the download link for unsupported reports
            return null;
        }

        // Generate a key that changes when any relevant input changes
        const pdfKey = [
            selectedReport,
            seasonCode,
            selectedWeek,
            minimumPoints,
            reportData.length // also include data length for extra safety
        ].join("|");

        return (
            <PDFDownloadLink
                key={pdfKey}
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

        if (requiresWeek && !selectedWeek) {
            return (
                <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500 text-center">
                        Select a week to continue...
                    </p>
                </div>
            );
        }

        if (needsMinimumPoints && minimumPoints === undefined) {
            return (
                <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500 text-center">
                        Enter minimum points to continue...
                    </p>
                </div>
            );
        }

        if (selectedReport.includes("barAffiliationFeeNotPaid")) {
            return (
                <ReportDisplay<BarAffiliationFeeNotPaid>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
                    columns={leaguePlayBarAffiliationFeeNotPaidColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("mentionBestOfDivision")) {
            return (
                <ReportDisplay<MentionBestOfDivision>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
                    columns={mentionBestOfDivisionColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("mentionPlaque")) {
            return (
                <ReportDisplay<MentionPlaque>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}&minimumMentions=${minimumPoints}`}
                    columns={mentionPlaqueColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("mentionLeaguePlay")) {
            return (
                <ReportDisplay<MentionLeaguePlay>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
                    columns={mentionLeaguePlayColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("ton80")) {
            // Extract just the week number (X) from selectedWeek, which is always in the format "DateX"
            const weekNum = selectedWeek.replace(/^Date/, "");
            return (
                <ReportDisplay<Ton80>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}&weekNum=${weekNum}`}
                    columns={ton80Columns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("playerNoForm")) {
            return (
                <ReportDisplay<PlayerNoForm>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
                    columns={playerNoFormColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("playerNotPaid")) {
            return (
                <ReportDisplay<PlayerNotPaid>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
                    columns={playerNotPaidColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }       

        if (selectedReport.includes("teamFeeNotPaid")) {
            return (
                <ReportDisplay<TeamFeeNotPaid>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}`}
                    columns={teamFeeNotPaidColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("topDarter")) {
            return (
                <ReportDisplay<TopDarter>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}&minimumPoints=${minimumPoints}`}
                    columns={topDarterColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }

        if (selectedReport.includes("weeklyScoresheets")) {
            // Extract just the week number (X) from selectedWeek, which is always in the format "DateX"
            const weekNum = selectedWeek.replace(/^Date/, "");
            return (
                <ReportDisplay<LeaguePlayWeeklyScoresheets>
                    apiRoute={selectedReport + `?seasonCode=${seasonCode}&weekNum=${weekNum}`}
                    columns={weeklyScoresheetsColumns}
                    className="h-full"
                    onDataFetch={handleDataFetch}
                />
            );
        }
    }

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
                                {/* Always render ReportSelector if needsMinimumPoints is true */}
                                {(needsMinimumPoints && seasonCode) ||
                                (!needsMinimumPoints && (
                                    (requiresWeek && seasonCode) ||
                                    (!requiresWeek && seasonCode) ||
                                    (requiresWeek && selectedWeek && seasonCode)
                                ))
                                ? (
                                    <ReportSelector
                                        handleSelect={handleReportSelect}
                                        selectedReport={selectedReport}
                                        type="leaguePlay"
                                        disabled={!seasonCode}
                                    />
                                ) : null}
                            </div>
                            {requiresWeek && (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="week-selector">Week</Label>
                                    <WeekSelector
                                        handleSelect={setSelectedWeek}
                                        seasonCode={seasonCode}
                                        disabled={!seasonCode}
                                        useFinishedWeeksOnly={true}
                                    />
                                </div>
                            )}
                            {needsMinimumPoints ? (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="minimum-points-input">
                                        {selectedReport.includes("mentionPlaque") ? "Minimum Mentions" : "Minimum Points"}
                                    </Label>
                                    <Input
                                        id="minimum-points-input"
                                        placeholder=""
                                        type="number"
                                        value={minimumPointsInput}
                                        onChange={(e) => {
                                            setMinimumPointsInput(e.target.value);
                                        }}
                                        className="bg-white border-gray-200 w-24"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </FolderTabMed>
                {/* Only render download link if all required fields are filled */}
                {selectedReport && seasonCode && seasonCodeDesc &&
                    (!requiresWeek || (requiresWeek && selectedWeek)) &&
                    (!needsMinimumPoints || (needsMinimumPoints && minimumPoints !== undefined) && dataFetched) && (
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
