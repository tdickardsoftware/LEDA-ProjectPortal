"use client";

import { useState, useCallback, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { FolderTabMed } from "@/components/ui/folder-tab";
import ReportSelector from "@/components/ui/report-selector";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SeasonCodeSelector from "@/components/ui/season-code-selector";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import WeekSelector from "@/components/ui/week-selector";
import { Input } from "@/components/ui/input";
import ReportDisplay from "../report-display";
import { BarAffiliationFeeNotPaid, MentionBestOfDivision, MentionLeaguePlay, MentionPlaque } from "@/lib/definitions";
import { leaguePlayBarAffiliationFeeNotPaidColumns, mentionBestOfDivisionColumns, mentionLeaguePlayColumns, mentionPlaqueColumns } from "@/lib/report-definitions";

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

    const handleSeasonCodeSelect = useCallback((value: string) => {
        setSeasonCode(value);
    }, []);

    const handleReportSelect = (value: string, requiresWeekFlag?: boolean, minimumPointsFlag?: boolean) => {
        setSelectedReport(value);
        setRequiresWeek(!!requiresWeekFlag);
        setNeedsMinimumPoints(!!minimumPointsFlag);
        setSelectedWeek(""); // Reset week when report changes
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
        if (!dataFetched || !reportData.length) {
				return null;
        }

        // Replace with actual PDF document/component as needed
        const document = <div />;
        const fileName = `leaguePlayReport-${seasonCode}-${new Date()
            .toLocaleDateString("en-US", {
                timeZone: "America/New_York",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "")}.pdf`;

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
                {selectedReport && seasonCode &&
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
