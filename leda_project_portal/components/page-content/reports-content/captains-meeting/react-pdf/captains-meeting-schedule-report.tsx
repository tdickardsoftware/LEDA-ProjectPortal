/**
 * CaptainsMeetingScheduleReport
 *
 * React-PDF document that produces the printed schedule handout for the
 * captains meeting. Renders a header with the LEDA logo and season info,
 * followed by per-subdivision tables showing each week’s match pairings.
 *
 * Accepts full `DivisionsData`, `ScheduleData`, and `TeamData` from the
 * schedule module plus `CaptainsMtgSchedulePlaceCaptainSeasonInfo` for
 * place/captain context in the column headers.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from "@react-pdf/renderer";
import { DivisionsData, ScheduleData, TeamData, MatchData } from "@/lib/schedule";
import { CaptainsMtgSchedulePlaceCaptainSeasonInfo } from "@/lib/definitions";

interface CaptainsMeetingScheduleReportProps {
	divisionsData: DivisionsData;
	matchData: ScheduleData;
	gameDates: Record<string, string>;
	seasonCode: string;
	placesData: Record<string, string>;
	seasonInfo: CaptainsMtgSchedulePlaceCaptainSeasonInfo[];
	backupPlaceId?: string | null;
	// Compact (legacy) letter-grid layout by default; full matchup details when true.
	detailedView?: boolean;
}

// Create styles
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 8,
		fontSize: 7,
	},
	header: {
		flexDirection: "row",
		marginBottom: 15,
		alignItems: "center",
	},
	logoContainer: {
		width: 50,
		height: 50,
		marginRight: 20,
		border: "1 solid black",
		padding: 2,
	},
	logo: {
		width: "100%",
		height: "100%",
	},
	headerTitle: {
		flex: 1,
		fontSize: 14,
		fontWeight: "bold",
		textAlign: "center",
	},
	subdivisionTitle: {
		fontSize: 12,
		marginBottom: 5,
		textAlign: "center",
		fontWeight: "bold",
		borderBottom: "1pt solid #000000",
		paddingBottom: 2,
	},
	table: {
		display: "flex",
		width: "100%",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000000",
		fontSize: 6,
	},
	tableRow: {
		flexDirection: "row",
		minHeight: 45,
		wrap: false, // Prevent rows from breaking across pages
	},
	tableColHeader: {
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000000",
		backgroundColor: "#f0f0f0",
		padding: 1,
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 9,
		justifyContent: "center",
		alignItems: "center",
	},
	tableColTeam: {
		width: "20%",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000000",
		padding: 3,
		textAlign: "center",
		fontSize: 8,
	},
	tableCol: {
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000000",
		padding: 1,
		textAlign: "center",
		fontSize: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	matchupBox: {
		fontSize: 7,
		lineHeight: 1.1,
		justifyContent: "center",
		alignItems: "center",
	},
	teamName: {
		fontSize: 9,
		fontWeight: "bold",
		marginBottom: 3,
	},
	gameDate: {
		fontSize: 7,
		color: "#666666",
	},
	byeText: {
		fontSize: 7,
		color: "#999999",
		fontStyle: "italic",
	},
	tableColTeamInfo: {
		width: "18%",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000000",
		padding: 3,
		textAlign: "left",
		fontSize: 7,
		justifyContent: "center",
	},
	tableColMatchup: {
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000000",
		padding: 1,
		textAlign: "center",
		fontSize: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	matchupLetter: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

// Utility function for time conversion
const convertTo12HourFormat = (time24: string): string => {
	if (!time24) return "";
	const [hours, minutes] = time24.split(":").map(Number);
	if (isNaN(hours) || isNaN(minutes)) return time24;
	const period = hours >= 12 ? "PM" : "AM";
	const hours12 = hours % 12 || 12;
	return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const CaptainsMeetingScheduleReport: React.FC<CaptainsMeetingScheduleReportProps> = ({
	divisionsData,
	matchData,
	gameDates,
	seasonCode,
	placesData,
	seasonInfo,
	backupPlaceId,
	detailedView = false,
}) => {
	// Convert gameDates keys (e.g. "Date 1") to the "weekN" format used as
	// matchesData keys in the schedule API, mirroring the conversion in
	// subdivision-scheduler.tsx so lookups succeed instead of returning null.
	const gameDateEntries: [string, string][] = Object.entries(gameDates).map(([key, date]) => {
		const match = key.match(/\d+/);
		const weekNum = match ? match[0] : "1";
		return [`week${weekNum}`, date];
	});

	// Calculate dynamic column width based on number of teams
	const getColumnWidth = (totalColumns: number) => {
		const remainingWidth = 85; // 85% for team columns
		return `${remainingWidth / totalColumns}%`;
	};

	// Calculate dynamic week-column width for the compact (legacy) grid,
	// where the leftmost 18% is reserved for the team info column.
	const getWeekColumnWidth = (totalColumns: number) => {
		const remainingWidth = 82;
		return `${remainingWidth / totalColumns}%`;
	};

	// Get team name by ID
	const getTeamNameById = (teamId: string, teams: Record<string, TeamData>): string => {
		const team = Object.values(teams).find((team) => team.teamId === teamId);
		return team ? team.teamName : "Unknown Team";
	};

	// Get matchup for a team
	const getTeamMatchup = (
		division: string,
		subdivision: string,
		teamLetter: string,
		gameTitle: string
	) => {
		return matchData[division]?.[subdivision]?.[teamLetter]?.matchesData?.[gameTitle] || null;
	};

	// Render matchup cell content
	const renderMatchupContent = (
		matchup: MatchData | null,
		teamData: TeamData,
		teams: Record<string, TeamData>
	) => {
		if (!matchup) {
			return (
				<Text style={styles.byeText}>BYE</Text>
			);
		}

		const opposingTeamName = getTeamNameById(matchup.opposingTeamId, teams);
		
		// Check if opposing team is a BYE
		if (opposingTeamName.toUpperCase().includes('BYE')) {
			return (
				<Text style={styles.byeText}>BYE</Text>
			);
		}
		
		const locationPlaceId = matchup.isAtBackupLocation && backupPlaceId
			? backupPlaceId
			: matchup.home
				? teamData.placeId
				: teams[matchup.opposingTeamLetter]?.placeId || "";
		const placeName = placesData[locationPlaceId] || "TBD";
		const formattedTime = convertTo12HourFormat(matchup.matchTime);

		return (
			<View style={styles.matchupBox}>
				<Text>{matchup.home ? "Home" : "Away"}</Text>
				<Text>VS</Text>
				<Text style={styles.teamName}>{opposingTeamName}</Text>
				<Text>{formattedTime}</Text>
				<Text>@ {placeName}</Text>
			</View>
		);
	};

	// Render matchup cell content for the compact (legacy) letter-grid:
	// home matchups show the opponent's letter uppercase, away matchups show
	// the opponent's letter lowercase, and "X" (the BYE placeholder letter) shows "BYE".
	const renderCompactMatchupContent = (matchup: MatchData | null) => {
		if (!matchup) {
			return <Text style={styles.byeText}>BYE</Text>;
		}

		const isBye = matchup.opposingTeamId === "0" || matchup.opposingTeamLetter.toUpperCase() === "X";
		if (isBye) {
			return <Text style={styles.byeText}>BYE</Text>;
		}

		const matchupCode = matchup.home
			? matchup.opposingTeamLetter.toUpperCase()
			: matchup.opposingTeamLetter.toLowerCase();

		return <Text style={styles.matchupLetter}>{matchupCode}</Text>;
	};

	// Get season description from the season info array with safety check
	const seasonDescription = seasonInfo && seasonInfo.length > 0 ? seasonInfo[0].desc : "Season " + seasonCode;

	// Helper function to chunk game dates for pagination
	const chunkGameDates = (gameDateEntries: [string, string][], maxDatesPerPage: number = 7) => {
		const chunks: [string, string][][] = [];
		for (let i = 0; i < gameDateEntries.length; i += maxDatesPerPage) {
			chunks.push(gameDateEntries.slice(i, i + maxDatesPerPage));
		}
		return chunks;
	};

	return (
		<Document>
			{Object.entries(divisionsData).map(([division, divisionData]) =>
				Object.entries(divisionData.subdivisions).map(([subdivision, teams]) => {
					// Filter out BYE teams
					const teamsArray = Object.entries(teams).filter(([_, teamData]) => 
						!teamData.teamName.toUpperCase().includes('BYE')
					);
					const columnWidth = getColumnWidth(teamsArray.length);
					const gameDateChunks = chunkGameDates(gameDateEntries, detailedView ? 7 : 14);
					const weekColumnWidth = getWeekColumnWidth(
						gameDateChunks[0]?.length || gameDateEntries.length || 1
					);
					
					return gameDateChunks.map((gameDateChunk, chunkIndex) => {
						return (
							<Page
								key={`${division}-${subdivision}-${chunkIndex}`}
								size="A4"
								orientation="landscape"
								style={styles.page}
							>
								<View style={styles.header}>
									<View style={styles.logoContainer}>
										<PDFImage style={styles.logo} src="/leda-reports-logo.png" />
									</View>
									<Text style={styles.headerTitle}>
										Lake Erie Dart Association, Inc. - {seasonDescription}
									</Text>
								</View>
								{detailedView ? (
									<View style={styles.table}>
										{/* Header Row - Teams */}
										<View style={styles.tableRow}>
											<View style={[styles.tableColHeader, { width: "15%" }]}>
												<Text>{division} - {subdivision}</Text>
											</View>
											{teamsArray.map(([teamLetter, teamData]) => {
												const matchingSeasonInfo = seasonInfo.find(
													info => info.teamId.toString() === teamData.teamId && 
													info.division === division && 
													info.subdivision === subdivision
												);
												
												return (
													<View key={teamLetter} style={[styles.tableColTeam, { width: columnWidth }]}>
														<Text style={styles.teamName}>{teamLetter}</Text>
														<Text>{teamData.teamName}</Text>
														{matchingSeasonInfo && (
															<View>
																<Text>{matchingSeasonInfo.placeName}</Text>
																<Text>{matchingSeasonInfo.addressFirstLine}</Text>
																<Text>
																	{matchingSeasonInfo.addressSecondLine}
																	{matchingSeasonInfo.placePhoneNumber && ` - ${matchingSeasonInfo.placePhoneNumber}`}
																</Text>
																{matchingSeasonInfo.captainFullName !== "No Captain" && (
																	<Text>
																		{matchingSeasonInfo.captainFullName}
																		{matchingSeasonInfo.captainPhoneNumber && ` - ${matchingSeasonInfo.captainPhoneNumber}`}
																	</Text>
																)}
															</View>
														)}
													</View>
												);
											})}
										</View>

										{/* Data Rows - Game Dates */}
										{gameDateChunk.map(([gameTitle, date]) => (
											<View key={gameTitle} style={styles.tableRow}>
												<View style={[styles.tableColHeader, { width: "15%" }]}>
													<Text>Week {gameTitle.match(/\d+/)?.[0] ?? ""}</Text>
													<Text style={styles.gameDate}>{date}</Text>
												</View>
												{teamsArray.map(([teamLetter, teamData]) => {
													const matchup = getTeamMatchup(
														division,
														subdivision,
														teamLetter,
														gameTitle
													);
													return (
														<View key={`${gameTitle}-${teamLetter}`} style={[styles.tableCol, { width: columnWidth }]}>
															{renderMatchupContent(matchup, teamData, teams)}
														</View>
													);
												})}
											</View>
										))}
									</View>
								) : (
									<View style={styles.table}>
										{/* Header Row - Weeks */}
										<View style={styles.tableRow}>
											<View style={styles.tableColTeamInfo}>
												<Text style={styles.teamName}>{division} - {subdivision}</Text>
											</View>
											{gameDateChunk.map(([gameTitle, date]) => (
												<View key={gameTitle} style={[styles.tableColHeader, { width: weekColumnWidth }]}>
													<Text>Week {gameTitle.match(/\d+/)?.[0] ?? ""}</Text>
													<Text style={styles.gameDate}>{date}</Text>
												</View>
											))}
										</View>

										{/* Data Rows - Teams */}
										{teamsArray.map(([teamLetter, teamData]) => {
											const matchingSeasonInfo = seasonInfo.find(
												info => info.teamId.toString() === teamData.teamId && 
												info.division === division && 
												info.subdivision === subdivision
											);

											return (
												<View key={teamLetter} style={styles.tableRow}>
													<View style={styles.tableColTeamInfo}>
														<Text style={styles.teamName}>{teamLetter} - {teamData.teamName}</Text>
														{matchingSeasonInfo && (
															<View>
																<Text>{matchingSeasonInfo.placeName}</Text>
																<Text>{matchingSeasonInfo.addressFirstLine}</Text>
																<Text>
																	{matchingSeasonInfo.addressSecondLine}
																	{matchingSeasonInfo.placePhoneNumber && ` - ${matchingSeasonInfo.placePhoneNumber}`}
																</Text>
																{matchingSeasonInfo.captainFullName !== "No Captain" && (
																	<Text>
																		{matchingSeasonInfo.captainFullName}
																		{matchingSeasonInfo.captainPhoneNumber && ` - ${matchingSeasonInfo.captainPhoneNumber}`}
																	</Text>
																)}
															</View>
														)}
													</View>
													{gameDateChunk.map(([gameTitle, date]) => {
														const matchup = getTeamMatchup(
															division,
															subdivision,
															teamLetter,
															gameTitle
														);
														return (
															<View key={`${gameTitle}-${teamLetter}`} style={[styles.tableColMatchup, { width: weekColumnWidth }]}>
															{renderCompactMatchupContent(matchup)}
															</View>
														);
													})}
												</View>
											);
										})}
									</View>
								)}
							</Page>
						);
					});
				})
			)}
		</Document>
	);
};


export default CaptainsMeetingScheduleReport;
