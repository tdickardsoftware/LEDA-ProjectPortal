import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MentionLeaguePlay } from "@/lib/definitions";
import ReportsHeader from "@/components/ui/reports-header";
import ReportsFooter from "@/components/ui/reports-footer";

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 30,
		fontSize: 9,
		fontFamily: "Helvetica",
	},
	divisionHeader: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 8,
	},
	subtitle: {
		fontSize: 10,
		marginBottom: 8,
	},
	playerTable: {
		width: "100%",
		marginBottom: 12,
	},
	playerHeader: {
		flexDirection: "row",
		backgroundColor: "#d3d3d3",
		border: "1 solid #888",
		paddingVertical: 2,
		paddingHorizontal: 2,
	},
	playerRow: {
		flexDirection: "row",
		borderLeft: "1 solid #888",
		borderRight: "1 solid #888",
		borderBottom: "1 solid #ccc",
		paddingVertical: 2,
		paddingHorizontal: 2,
	},
	playerCell: {
		fontSize: 8,
		padding: 2,
		borderRight: "1 solid #ccc",
		minHeight: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	lastCell: {
		borderRight: 0,
	},
	mentionsTable: {
		width: "90%",
		marginLeft: "5%",
		marginBottom: 8,
	},
	mentionsHeader: {
		flexDirection: "row",
		backgroundColor: "#f0f0f0",
		border: "1 solid #bbb",
		paddingVertical: 1,
		paddingHorizontal: 2,
	},
	mentionsRow: {
		flexDirection: "row",
		borderLeft: "1 solid #bbb",
		borderRight: "1 solid #bbb",
		borderBottom: "1 solid #eee",
		paddingVertical: 1,
		paddingHorizontal: 2,
	},
	mentionsCell: {
		fontSize: 8,
		padding: 2,
		borderRight: "1 solid #eee",
		minHeight: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	mentionsDescCol: {
		width: "80%",
	},
	mentionsCountCol: {
		width: "20%",
	},
	mentionsLastCell: {
		borderRight: 0,
	},
});

interface MentionLeaguePlayReportProps {
	data: MentionLeaguePlay[];
	desc: string;
	reportDate?: string;
}

function groupByDivisionInfo(data: MentionLeaguePlay[]) {
	const map: Record<string, MentionLeaguePlay[]> = {};
	for (const row of data) {
		const divisionInfo = row.divisionInfo || "Unknown";
		if (!map[divisionInfo]) map[divisionInfo] = [];
		map[divisionInfo].push(row);
	}
	return map;
}

const LeaguePlayMentionLeaguePlayReport: React.FC<MentionLeaguePlayReportProps> = ({
	data,
	desc,
	reportDate = new Date()
		.toLocaleDateString("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
		.replace(",", ""),
}) => {
	const divisionInfoMap = groupByDivisionInfo(data);
	const divisionInfoNames = Object.keys(divisionInfoMap);

	return (
		<Document>
			{divisionInfoNames.map((divisionInfo) => {
				const rows = divisionInfoMap[divisionInfo];
				// Use the first row for teamName and placeName (assuming all rows in this group are for the same team/place)
				const firstRow = rows[0] || {};
				return (
					<Page key={divisionInfo} size="A4" style={styles.page}>
						<ReportsHeader
							title="Mentions League Play"
							reportDate={reportDate}
							subtitle={desc}
						/>
						<View style={styles.divisionHeader}>
							<Text>
								Division Info: {divisionInfo}
							</Text>
                            <Text>
                                Team: {firstRow.teamName || ""}
                            </Text>
                            <Text>
                                Place: {firstRow.placeName || ""}
                            </Text>
						</View>
						<View style={styles.playerTable}>
							{rows.map((row, i) => (
								<View key={i} wrap={false}>
                                    <View style={styles.playerHeader}>
                                        <Text style={[styles.playerCell, { width: "25%" }]}>Player Name</Text>
                                        <Text style={[styles.playerCell, { width: "25%" }]}>LEDA ID</Text>
                                        <Text style={[styles.playerCell, { width: "25%" }]}>Captain</Text>
                                        <Text style={[styles.playerCell, { width: "25%" }, styles.lastCell]}>Mentions</Text>
                                    </View>
									<View style={styles.playerRow}>
										<Text style={[styles.playerCell, { width: "25%" }]}>{row.fullName}</Text>
										<Text style={[styles.playerCell, { width: "25%" }]}>{row.ledaId}</Text>
										<Text style={[styles.playerCell, { width: "25%" }]}>{row.isCaptain ? "CAPT" : ""}</Text>
										<Text style={[styles.playerCell, { width: "25%" }, styles.lastCell]}>{row.mentionsCount}</Text>
									</View>
									{/* Mentions subtable */}
									<View style={styles.mentionsTable}>
										<View style={styles.mentionsHeader}>
											<Text style={[styles.mentionsCell, styles.mentionsDescCol]}>Mention Description</Text>
											<Text style={[styles.mentionsCell, styles.mentionsCountCol, styles.mentionsLastCell]}>Count</Text>
										</View>
										{Array.isArray(row.mentions) && row.mentions.map((mention, j) => (
											<View style={styles.mentionsRow} key={j}>
												<Text style={[styles.mentionsCell, styles.mentionsDescCol]}>
													{`Week ${mention.weekNum} - ${mention.mentionCode} (${mention.mentionDesc})`}
												</Text>
												<Text style={[styles.mentionsCell, styles.mentionsCountCol, styles.mentionsLastCell]}>
													{mention.count}
												</Text>
											</View>
										))}
									</View>
								</View>
							))}
						</View>
						<ReportsFooter />
					</Page>
				);
			})}
		</Document>
	);
};

export default LeaguePlayMentionLeaguePlayReport;
