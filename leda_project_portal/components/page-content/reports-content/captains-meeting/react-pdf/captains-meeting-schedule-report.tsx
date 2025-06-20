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
		padding: 1,
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
}) => {
	const gameDateEntries = Object.entries(gameDates);

	// Calculate dynamic column width based on number of game dates
	const getColumnWidth = (totalColumns: number) => {
		const remainingWidth = 80; // 80% for game columns (reduced from 85% to give more space to team column)
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
		const locationPlaceId = matchup.home
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

	// Get season description from the season info array with safety check
	const seasonDescription = seasonInfo && seasonInfo.length > 0 ? seasonInfo[0].desc : "Season " + seasonCode;

	return (
		<Document>
			{Object.entries(divisionsData).map(([division, divisionData]) =>
				Object.entries(divisionData.subdivisions).map(([subdivision, teams]) => {
					const columnWidth = getColumnWidth(gameDateEntries.length);
					
					return (
						<Page
							key={`${division}-${subdivision}`}
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
							<View style={styles.table}>
								{/* Header Row */}
								<View style={styles.tableRow}>
									<View style={[styles.tableColHeader, { width: "20%" }]}>
										<Text>{division} - {subdivision}</Text>
									</View>
									{gameDateEntries.map(([gameTitle, date]) => (
										<View key={gameTitle} style={[styles.tableColHeader, { width: columnWidth }]}>
											<Text>{gameTitle.replace(/(\d+)/, " $1")}</Text>
											<Text style={styles.gameDate}>{date}</Text>
										</View>
									))}
								</View>

								{/* Data Rows */}
								{Object.entries(teams).map(([teamLetter, teamData]) => (
									<View key={teamLetter} style={styles.tableRow}>
										<View style={styles.tableColTeam}>
											<Text style={styles.teamName}>{teamLetter}</Text>
											<Text>{teamData.teamName}</Text>
											{(() => {
												const matchingSeasonInfo = seasonInfo.find(
													info => info.teamId.toString() === teamData.teamId && 
													info.division === division && 
													info.subdivision === subdivision
												);
												
												if (matchingSeasonInfo) {
													return (
														<View>
															<Text>{matchingSeasonInfo.placeName}</Text>
															<Text>{matchingSeasonInfo.addressFirstLine}</Text>
															<Text>
																{matchingSeasonInfo.addressSecondLine} - 
																{matchingSeasonInfo.placePhoneNumber && ` ${matchingSeasonInfo.placePhoneNumber}`}
															</Text>
															{matchingSeasonInfo.captainFullName !== "No Captain" && (
																<Text>
																	{matchingSeasonInfo.captainFullName} -
																	{matchingSeasonInfo.captainPhoneNumber && ` ${matchingSeasonInfo.captainPhoneNumber}`}
																</Text>
															)}
														</View>
													);
												}
												return null;
											})()}
										</View>
										{gameDateEntries.map(([gameTitle]) => {
											const matchup = getTeamMatchup(
												division,
												subdivision,
												teamLetter,
												gameTitle
											);
											return (
												<View key={`${teamLetter}-${gameTitle}`} style={[styles.tableCol, { width: columnWidth }]}>
													{renderMatchupContent(matchup, teamData, teams)}
												</View>
											);
										})}
									</View>
								))}
							</View>
						</Page>
					);
				})
			)}
		</Document>
	);
};


export default CaptainsMeetingScheduleReport;
