"use client";

import { weeklyScoresheetsRoute } from "@/lib/apiRoutes";
import {
	MentionPlayerHistory,
	PlayerMemberInfo,
	TopDarterTotals,
	WeeklyTopDarterScores,
} from "@/lib/definitions";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PlayerTDPHistorySidenav from "./player-tdp-history-sidenav";

export default function PlayerTDPHistoryContent({
	playerData,
}: {
	playerData: PlayerMemberInfo;
}) {
	// --- TanStack Query: Fetch TDP Season Code Data ---
	const {
		data: TDPSeasonCodeData = [],
	} = useQuery<TopDarterTotals[]>({
		queryKey: ["tdpSeasonCodeData", playerData.ledaId],
		queryFn: async () => {
			const results = await fetch(
				weeklyScoresheetsRoute +
					"/playerPoints?viewPlayerTopDarterPoints=true&ledaId=" +
					playerData.ledaId,
				{
					method: "GET",
				}
			);
			if (!results.ok) {
				throw new Error("Failed to fetch TDP data");
			}
			return await results.json();
		},
	});

	const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
	const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
	const [selectedGame, setSelectedGame] = useState<string | null>(null);

	// --- TanStack Query: Fetch TDP Weekly Scores Data for all seasons ---
	const {
		data: TDPWeeklyScoresData = {},
	} = useQuery<{
		[seasonCode: string]: {
			[teamName: string]: {
				teamId: number;
				weekData: {
					[weekNum: number]: {
						totalPoints: number;
						gameName: string;
						changeBy: number;
						prevTotalPoints: number;
						teamLedaId: number;
					};
				};
			};
		};
	}>({
		queryKey: ["tdpWeeklyScoresData", playerData.ledaId, TDPSeasonCodeData.map(s => s.seasonCode).join(",")],
		enabled: !!TDPSeasonCodeData && TDPSeasonCodeData.length > 0,
		queryFn: async () => {
			const structuredData: {
				[seasonCode: string]: {
					[teamName: string]: {
						teamId: number;
						weekData: {
							[weekNum: number]: {
								totalPoints: number;
								gameName: string;
								changeBy: number;
								prevTotalPoints: number;
								teamLedaId: number;
							};
						};
					};
				};
			} = {};
			for (const seasonData of TDPSeasonCodeData) {
				const seasonCode = seasonData.seasonCode;
				if (!structuredData[seasonCode]) {
					structuredData[seasonCode] = {};
				}
				const results = await fetch(
					weeklyScoresheetsRoute +
						"/playerPoints?getSeasonWeekPoints=true&seasonCode=" +
						seasonCode +
						"&ledaId=" +
						playerData.ledaId,
					{
						method: "GET",
					}
				);
				if (!results.ok) {
					throw new Error("Failed to fetch TDP data");
				}
				const weeklyData = await results.json();
				weeklyData.forEach((weeklyScore: WeeklyTopDarterScores) => {
					const {
						teamName: rawTeamName,
						teamLedaId,
						weekNum,
						totalPoints,
						gameName,
						changeBy,
						prevTotalPoints,
					} = weeklyScore;
					const teamName =
						rawTeamName && rawTeamName !== "undefined"
							? rawTeamName
							: `Team ${teamLedaId || "Unknown"}`;

					if (!structuredData[seasonCode][teamName]) {
						structuredData[seasonCode][teamName] = {
							teamId: teamLedaId,
							weekData: {},
						};
					}

					structuredData[seasonCode][teamName].weekData[weekNum] = {
						totalPoints,
						gameName: gameName || `Game ${weekNum}`,
						changeBy,
						prevTotalPoints,
						teamLedaId,
					};
				});
			}
			return structuredData;
		},
	});

	// --- TanStack Query: Fetch Player Mentions ---
	const [mentionParams, setMentionParams] = useState<{
		seasonCode?: string;
		teamId?: number;
		weekNum?: number;
	} | null>(null);

	const {
		data: mentionData = { mentions: [], loading: false },
		isFetching: mentionLoading,
	} = useQuery<{
		mentions: MentionPlayerHistory[];
		loading: boolean;
	}>({
		queryKey: [
			"playerMentions",
			playerData.ledaId,
			mentionParams?.seasonCode,
			mentionParams?.teamId,
			mentionParams?.weekNum,
		],
		enabled: !!mentionParams?.seasonCode && !!mentionParams?.teamId,
		queryFn: async () => {
			let url = `/api/maintenance/mention/mentionHistory?ledaId=${playerData.ledaId}&seasonCode=${mentionParams?.seasonCode}&teamId=${mentionParams?.teamId}`;
			if (mentionParams?.weekNum !== undefined) {
				url += `&weekNum=${mentionParams.weekNum}`;
			}
			const results = await fetch(url);
			if (!results.ok) {
				throw new Error("Failed to fetch mention data");
			}
			const data = await results.json();
			return { mentions: data, loading: false };
		},
	});

	// Set initial selectedSeason when TDPSeasonCodeData loads
	useEffect(() => {
		if (TDPSeasonCodeData.length > 0 && !selectedSeason) {
			setSelectedSeason(TDPSeasonCodeData[0].seasonCode);
		}
	}, [TDPSeasonCodeData, selectedSeason]);

	// Handle team selection
	const handleTeamSelect = (seasonCode: string, teamName: string) => {
		setSelectedSeason(seasonCode);
		setSelectedTeam(teamName);
		setSelectedGame(null); // Reset game selection when team changes

		const teamId = TDPWeeklyScoresData[seasonCode]?.[teamName]?.teamId;
		if (teamId) {
			setMentionParams({ seasonCode, teamId });
		}
	};

	// Handle game selection
	const handleGameSelect = (
		seasonCode: string,
		teamName: string,
		weekNum: string
	) => {
		setSelectedSeason(seasonCode);
		setSelectedTeam(teamName);
		setSelectedGame(weekNum);

		const teamId = TDPWeeklyScoresData[seasonCode]?.[teamName]?.teamId;
		const weekNumInt = parseInt(weekNum, 10);

		if (teamId) {
			setMentionParams({ seasonCode, teamId, weekNum: weekNumInt });
		}
	};

	// Get the details of the selected season
	const selectedSeasonData = selectedSeason
		? TDPSeasonCodeData.find((tdp) => tdp.seasonCode === selectedSeason)
		: null;

	// Get the selected team data if available
	const selectedTeamData =
		selectedSeason && selectedTeam && TDPWeeklyScoresData[selectedSeason]
			? TDPWeeklyScoresData[selectedSeason][selectedTeam]
			: null;

	// Get the selected game data if available
	const selectedGameData =
		selectedTeamData && selectedGame
			? selectedTeamData.weekData[parseInt(selectedGame, 10)]
			: null;

	// Calculate the total points from the last week for the selected team
	const calculateTeamTotalPoints = (teamData: typeof selectedTeamData) => {
		if (
			!teamData ||
			!teamData.weekData ||
			Object.keys(teamData.weekData).length === 0
		) {
			return 0;
		}
		// Find the highest week number
		const lastWeekNum = Math.max(
			...Object.keys(teamData.weekData).map((w) => parseInt(w, 10))
		);
		// Return the total points from the last week
		return teamData.weekData[lastWeekNum]?.totalPoints || 0;
	};

	// Calculate base points (total points minus mention points)
	interface WeekDataType {
		totalPoints: number;
		gameName: string;
		changeBy: number;
		prevTotalPoints: number;
		teamLedaId: number;
	}

	const calculateBasePoints = (weekData: WeekDataType | null | undefined) => {
		if (
			!weekData ||
			!mentionData.mentions ||
			mentionData.mentions.length === 0
		) {
			return weekData?.totalPoints || 0;
		}
		// Sum all mention points for this week
		const mentionPointsTotal = mentionData.mentions.reduce(
			(sum, mention) => {
				return sum + Number(mention.mentionPoints);
			},
			0
		);
		// Subtract mention points from total points
		return weekData.totalPoints - mentionPointsTotal;
	};

	const teamTotalPoints = selectedTeamData
		? calculateTeamTotalPoints(selectedTeamData)
		: 0;
	const basePoints = selectedGameData
		? calculateBasePoints(selectedGameData)
		: 0;

	// Format date for display
	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	return (
		<div className="flex h-full flex-col">
			{/* Sidenav Component */}
			<div className="flex flex-1 p-6">
				{/* Sidenav */}
				<div className="mr-8">
					<PlayerTDPHistorySidenav
						tdpData={TDPSeasonCodeData}
						weeklyScoresData={TDPWeeklyScoresData}
						onSeasonSelect={setSelectedSeason}
						onTeamSelect={handleTeamSelect}
						onGameSelect={handleGameSelect}
					/>
				</div>
				{/* Main content area */}
				<div className="flex-1">
					{selectedSeasonData && !selectedTeam ? (
						<div className="p-6 border rounded-lg shadow-sm bg-background">
							<h2 className="text-2xl font-semibold mb-4">
								Season: {selectedSeasonData.seasonCode}
							</h2>
							{/* Add more details about the selected season here as needed */}
						</div>
					) : selectedTeamData && !selectedGame ? (
						<div className="p-6 border rounded-lg shadow-sm bg-background">
							<h2 className="text-2xl font-semibold mb-4">
								{selectedTeam} - {teamTotalPoints} pts
							</h2>
							<div className="mt-4">
								<div className="flex justify-between items-center p-4 border rounded-md bg-muted">
									<div>
										<h4 className="text-lg font-medium">
											{selectedTeam} Season Summary
										</h4>
										<p className="text-muted-foreground">
											Season: {selectedSeason}
										</p>
										<p className="text-muted-foreground mt-1">
											Base Points:{" "}
											{teamTotalPoints -
												(mentionData.mentions
													? mentionData.mentions.reduce(
															(sum, mention) =>
																sum +
															Number(mention.mentionPoints),
															0
													  )
													: 0)}{" "}
											pts
										</p>
										<p className="text-muted-foreground mt-2">
											Mention Points:{" "}
											{mentionData.mentions
												? mentionData.mentions.reduce(
														(sum, mention) =>
															sum +
														Number(mention.mentionPoints),
														0
												  )
												: 0}{" "}
											pts
										</p>
									</div>
									<div className="text-right">
										<span className="text-xl font-bold text-blue-600">
											Total: {teamTotalPoints} pts
										</span>
									</div>
								</div>
							</div>
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3">
									Mentions for this season
								</h3>
								{mentionLoading ? (
									<p className="text-muted-foreground">
										Loading mentions...
									</p>
								) : mentionData.mentions &&
								  mentionData.mentions.length > 0 ? (
									<div className="space-y-3">
										{mentionData.mentions
											.sort((a, b) => {
												// Sort by week number first, then by date
												if (a.weekNum !== b.weekNum) {
													return (
														b.weekNum - a.weekNum
													);
												}
												return (
													(b.creationDate
														? new Date(
																b.creationDate
														  ).getTime()
														: 0) -
													(a.creationDate
														? new Date(
																a.creationDate
														  ).getTime()
														: 0)
												);
											})
											.map((mention, index) => (
												<div
													key={index}
													className="p-3 border rounded-md bg-muted"
												>
													<div className="flex justify-between items-start">
														<div>
															<h4 className="font-medium">
																{
																	mention.mentionDesc
																}
															</h4>
															<p className="text-sm text-muted-foreground">
																Week{" "}
																{
																	mention.weekNum
																}{" "}
																• Code:{" "}
																{
																	mention.mentionCode
																}
																{mention.count >
																	1 &&
																	` • Count: ${mention.count}`}
															</p>
															{mention.notes && (
																<p className="text-sm mt-1 italic text-muted-foreground">
																	{
																		mention.notes
																	}
																</p>
															)}
															<p className="text-xs text-muted-foreground mt-1">
																{formatDate(
																	typeof mention.creationDate ===
																		"string"
																		? mention.creationDate
																		: mention.creationDate?.toISOString()
																)}
															</p>
														</div>
														<span
															className={`font-bold px-2 py-1 rounded-md ${
																mention.mentionPoints >
																0
																	? "bg-green-100 text-green-700"
																	: mention.mentionPoints <
																	  0
																	? "bg-red-100 text-red-700"
																	: "bg-muted text-foreground"
															}`}
														>
															{mention.mentionPoints >
															0
																? "+"
																: ""}
																{mention.mentionPoints}{" "}
															pts
														</span>
													</div>
												</div>
											))}
									</div>
								) : (
									<p className="text-muted-foreground">
										No mentions found for this season.
									</p>
								)}
							</div>
							<p className="text-muted-foreground mt-6">
								Select a game from the sidebar to view detailed
								weekly information.
							</p>
						</div>
					) : selectedGameData ? (
						<div className="p-6 border rounded-lg shadow-sm bg-background">
							<h2 className="text-2xl font-semibold mb-4">
								{selectedTeam} - {selectedGameData.gameName}
							</h2>
							<div className="mt-4">
								<div className="flex justify-between items-center p-4 border rounded-md bg-muted">
									<div>
										<h4 className="text-lg font-medium">
											{selectedGameData.gameName}
										</h4>
										<p className="text-muted-foreground">
											Season: {selectedSeason}
										</p>
										<p className="text-muted-foreground mt-1">
											Base Points: {basePoints} pts
										</p>
										<p className="text-muted-foreground mt-2">
											Mention Points:{" "}
											{mentionData.mentions
												? mentionData.mentions.reduce(
														(sum, mention) =>
															sum +
														Number(mention.mentionPoints),
														0
												  )
												: 0}{" "}
											pts
										</p>
									</div>
									<div className="text-right">
										<span
											className={`text-xl font-bold ${
												selectedGameData.changeBy >= 0
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{selectedGameData.changeBy >= 0
												? "+"
												: ""}
											{selectedGameData.changeBy} pts
										</span>
										<p className="text-sm text-muted-foreground">
											Total:{" "}
											{selectedGameData.totalPoints}{" "}
											(Previous:{" "}
											{selectedGameData.prevTotalPoints})
										</p>
									</div>
								</div>
							</div>
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3">
									Week {selectedGame} Mentions
								</h3>
								{mentionLoading ? (
									<p className="text-muted-foreground">
										Loading mentions...
									</p>
								) : mentionData.mentions &&
								  mentionData.mentions.length > 0 ? (
									<div className="space-y-3">
										{mentionData.mentions.map(
											(mention, index) => (
												<div
													key={index}
													className="p-3 border rounded-md bg-muted"
												>
													<div className="flex justify-between items-start">
														<div>
															<h4 className="font-medium">
																{
																	mention.mentionDesc
																}
															</h4>
															<p className="text-sm text-muted-foreground">
																Code:{" "}
																{
																	mention.mentionCode
																}
																{mention.count >
																	1 &&
																	` • Count: ${mention.count}`}
															</p>
															{mention.notes && (
																<p className="text-sm mt-1 italic text-muted-foreground">
																	{
																		mention.notes
																	}
																</p>
															)}
															<p className="text-xs text-muted-foreground mt-1">
																{formatDate(
																	typeof mention.creationDate ===
																		"string"
																		? mention.creationDate
																		: mention.creationDate?.toISOString()
																)}
															</p>
														</div>
														<span
															className={`font-bold px-2 py-1 rounded-md ${
																mention.mentionPoints >
																0
																	? "bg-green-100 text-green-700"
																	: mention.mentionPoints <
																	  0
																	? "bg-red-100 text-red-700"
																	: "bg-muted text-foreground"
															}`}
														>
															{mention.mentionPoints >
															0
																? "+"
																: ""}
																{mention.mentionPoints}{" "}
															pts
														</span>
													</div>
												</div>
											)
										)}
									</div>
								) : (
									<p className="text-muted-foreground">
										No mentions found for this week.
									</p>
								)}
							</div>
						</div>
					) : (
						<p className="text-muted-foreground">
							Select a season, team, or game to view details
						</p>
					)}
				</div>
			</div>
		</div>
	);
}