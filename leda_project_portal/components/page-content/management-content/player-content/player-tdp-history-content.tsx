"use client";

import { weeklyScoresheetsRoute } from "@/lib/apiRoutes";
import {
	MentionPlayerHistory,
	PlayerMemberInfo,
	TopDarterTotals,
	WeeklyTopDarterScores,
} from "@/lib/definitions";
import { useCallback, useEffect, useState } from "react";
import PlayerTDPHistorySidenav from "./player-tdp-history-sidenav";

export default function PlayerTDPHistoryContent({
	playerData,
}: {
	playerData: PlayerMemberInfo;
}) {
	const [TDPSeasonCodeData, setTDPSeasonCodeData] = useState<
		TopDarterTotals[]
	>([]);
	const [TDPWeeklyScoresData, setTDPWeeklyScoresData] = useState<{
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
	}>({});
	const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
	const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
	const [selectedGame, setSelectedGame] = useState<string | null>(null);
	const [mentionData, setMentionData] = useState<{
		seasonCode?: string;
		teamId?: number;
		weekNum?: number;
		mentions: MentionPlayerHistory[];
		loading: boolean;
	}>({ mentions: [], loading: false });

	const getTDPSeasonCodeData = useCallback(async () => {
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
		const data = await results.json();
		return data;
	}, [playerData.ledaId]);

	const getTDPWeeklyScoresData = useCallback(
		async (seasonCode: string) => {
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
			const data = await results.json();

			// Log the raw API response to verify `changeBy`
			console.log("Weekly scores API response:", data);

			return data;
		},
		[playerData.ledaId]
	);

	const getPlayerMentions = useCallback(
		async (seasonCode: string, teamId: number, weekNum?: number) => {
			try {
				let url = `/api/maintenance/mention/mentionHistory?ledaId=${playerData.ledaId}&seasonCode=${seasonCode}&teamId=${teamId}`;
				if (weekNum !== undefined) {
					url += `&weekNum=${weekNum}`;
				}

				const results = await fetch(url);
				if (!results.ok) {
					throw new Error("Failed to fetch mention data");
				}
				const data = await results.json();
				return data;
			} catch (err) {
				console.error("Error fetching mentions:", err);
				return [];
			}
		},
		[playerData.ledaId]
	);

	useEffect(() => {
		const fetchTDPSeasonCodeData = async () => {
			try {
				const data = await getTDPSeasonCodeData();
				setTDPSeasonCodeData(data);

				// Only set selectedSeason on initial load if it's not already set
				if (data.length > 0 && !selectedSeason) {
					setSelectedSeason(data[0].seasonCode);
				}
			} catch (err) {
				console.error(err);
			}
		};

		fetchTDPSeasonCodeData();
	}, [getTDPSeasonCodeData, selectedSeason]);

	useEffect(() => {
		if (!selectedSeason) return; // Ensure a season is selected before fetching weekly scores

		const fetchTDPWeeklyScoresData = async () => {
			try {
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

					const weeklyData = await getTDPWeeklyScoresData(seasonCode);

					// Log the weekly data to verify `changeBy`
					console.log(
						`Weekly data for season ${seasonCode}:`,
						weeklyData
					);

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

						structuredData[seasonCode][teamName].weekData[weekNum] =
							{
								totalPoints,
								gameName: gameName || `Game ${weekNum}`,
								changeBy, // Ensure `changeBy` is mapped correctly
								prevTotalPoints,
								teamLedaId,
							};
					});
				}

				console.log("Structured data:", structuredData);
				setTDPWeeklyScoresData(structuredData);
			} catch (err) {
				console.error("Failed to fetch weekly scores:", err);
				setTDPWeeklyScoresData({});
			}
		};

		fetchTDPWeeklyScoresData();
	}, [selectedSeason, getTDPWeeklyScoresData, TDPSeasonCodeData]);

	// Handle team selection
	const handleTeamSelect = (seasonCode: string, teamName: string) => {
		setSelectedSeason(seasonCode);
		setSelectedTeam(teamName);
		setSelectedGame(null); // Reset game selection when team changes

		// Get the teamId from the weekly scores data
		const teamId = TDPWeeklyScoresData[seasonCode]?.[teamName]?.teamId;

		if (teamId) {
			// Show loading state
			setMentionData((prev) => ({ ...prev, loading: true }));

			// Fetch mentions for this player, season and team
			getPlayerMentions(seasonCode, teamId).then((mentions) => {
				setMentionData({
					seasonCode,
					teamId,
					mentions,
					loading: false,
				});
			});
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
			// Show loading state
			setMentionData((prev) => ({ ...prev, loading: true }));

			// Fetch mentions for this specific week
			getPlayerMentions(seasonCode, teamId, weekNumInt).then(
				(mentions) => {
					setMentionData({
						seasonCode,
						teamId,
						weekNum: weekNumInt,
						mentions,
						loading: false,
					});
				}
			);
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
				return sum + mention.mentionPoints * (mention.count || 1);
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
						<div className="p-6 border rounded-lg shadow-sm bg-white">
							<h2 className="text-2xl font-semibold mb-4">
								Season: {selectedSeasonData.seasonCode}
							</h2>
							{/* Add more details about the selected season here as needed */}
						</div>
					) : selectedTeamData && !selectedGame ? (
						<div className="p-6 border rounded-lg shadow-sm bg-white">
							<h2 className="text-2xl font-semibold mb-4">
								{selectedTeam} - {teamTotalPoints} pts
							</h2>

							{/* Add point summary similar to game view */}
							<div className="mt-4">
								<div className="flex justify-between items-center p-4 border rounded-md bg-gray-50">
									<div>
										<h4 className="text-lg font-medium">
											{selectedTeam} Season Summary
										</h4>
										<p className="text-gray-600">
											Season: {selectedSeason}
										</p>
										{/* Calculate base points (total points minus mention points) */}
										<p className="text-gray-600 mt-1">
											Base Points:{" "}
											{teamTotalPoints -
												mentionData.mentions.reduce(
													(sum, mention) =>
														sum +
														mention.mentionPoints *
															(mention.count ||
																1),
													0
												)}{" "}
											pts
										</p>
										<p className="text-gray-600 mt-2">
											Mention Points:{" "}
											{mentionData.mentions.reduce(
												(sum, mention) =>
													sum +
													mention.mentionPoints *
														(mention.count || 1),
												0
											)}{" "}
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

							{/* Season mentions section with improved styling */}
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3">
									Mentions for this season
								</h3>
								{mentionData.loading ? (
									<p className="text-gray-500">
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
													className="p-3 border rounded-md bg-gray-50"
												>
													<div className="flex justify-between items-start">
														<div>
															<h4 className="font-medium">
																{
																	mention.mentionDesc
																}
															</h4>
															<p className="text-sm text-gray-600">
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
																<p className="text-sm mt-1 italic text-gray-500">
																	{
																		mention.notes
																	}
																</p>
															)}
															<p className="text-xs text-gray-500 mt-1">
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
																	: "bg-gray-100 text-gray-700"
															}`}
														>
															{mention.mentionPoints >
															0
																? "+"
																: ""}
															{mention.mentionPoints *
																(mention.count ||
																	1)}{" "}
															pts
														</span>
													</div>
												</div>
											))}
									</div>
								) : (
									<p className="text-gray-500">
										No mentions found for this season.
									</p>
								)}
							</div>

							<p className="text-gray-600 mt-6">
								Select a game from the sidebar to view detailed
								weekly information.
							</p>
						</div>
					) : selectedGameData ? (
						<div className="p-6 border rounded-lg shadow-sm bg-white">
							<h2 className="text-2xl font-semibold mb-4">
								{selectedTeam} - {selectedGameData.gameName}
							</h2>

							{/* Game details */}
							<div className="mt-4">
								<div className="flex justify-between items-center p-4 border rounded-md bg-gray-50">
									<div>
										<h4 className="text-lg font-medium">
											{selectedGameData.gameName}
										</h4>
										<p className="text-gray-600">
											Season: {selectedSeason}
										</p>
										<p className="text-gray-600 mt-1">
											Base Points: {basePoints} pts
										</p>
										<p className="text-gray-600 mt-2">
											Mention Points:{" "}
											{mentionData.mentions.reduce(
												(sum, mention) =>
													sum +
													mention.mentionPoints *
														(mention.count || 1),
												0
											)}{" "}
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
										<p className="text-sm text-gray-600">
											Total:{" "}
											{selectedGameData.totalPoints}{" "}
											(Previous:{" "}
											{selectedGameData.prevTotalPoints})
										</p>
									</div>
								</div>
							</div>

							{/* Weekly mentions section */}
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3">
									Week {selectedGame} Mentions
								</h3>
								{mentionData.loading ? (
									<p className="text-gray-500">
										Loading mentions...
									</p>
								) : mentionData.mentions &&
								  mentionData.mentions.length > 0 ? (
									<div className="space-y-3">
										{mentionData.mentions.map(
											(mention, index) => (
												<div
													key={index}
													className="p-3 border rounded-md bg-gray-50"
												>
													<div className="flex justify-between items-start">
														<div>
															<h4 className="font-medium">
																{
																	mention.mentionDesc
																}
															</h4>
															<p className="text-sm text-gray-600">
																Code:{" "}
																{
																	mention.mentionCode
																}
																{mention.count >
																	1 &&
																	` • Count: ${mention.count}`}
															</p>
															{mention.notes && (
																<p className="text-sm mt-1 italic text-gray-500">
																	{
																		mention.notes
																	}
																</p>
															)}
															<p className="text-xs text-gray-500 mt-1">
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
																	: "bg-gray-100 text-gray-700"
															}`}
														>
															{mention.mentionPoints >
															0
																? "+"
																: ""}
															{mention.mentionPoints *
																(mention.count ||
																	1)}{" "}
															pts
														</span>
													</div>
												</div>
											)
										)}
									</div>
								) : (
									<p className="text-gray-500">
										No mentions found for this week.
									</p>
								)}
							</div>
						</div>
					) : (
						<p className="text-gray-500">
							Select a season, team, or game to view details
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
