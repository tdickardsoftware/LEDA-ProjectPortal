import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { LeaguePlayWeeklyScoresheets } from "@/lib/definitions";
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
	subdivisionHeader: {
		fontSize: 11,
		fontWeight: "bold",
		marginBottom: 4,
		marginTop: 4,
	},
	table: {
		width: "100%",
		marginBottom: 16,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#d3d3d3",
		border: "1 solid #888",
		paddingVertical: 2,
		paddingHorizontal: 2,
	},
	tableRow: {
		flexDirection: "row",
		borderLeft: "1 solid #888",
		borderRight: "1 solid #888",
		borderBottom: "1 solid #ccc",
		paddingVertical: 2,
		paddingHorizontal: 2,
	},
	cell: {
		fontSize: 8,
		padding: 2,
		borderRight: "1 solid #ccc",
		minHeight: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	divisionInfoColumn: {
		width: "15%",
	},
	placeNameColumn: {
		width: "18%",
	},
	teamNameColumn: {
		width: "18%",
	},
	prevTotalPointsColumn: {
		width: "10%",
	},
	pointsScoredColumn: {
		width: "10%",
	},
	previousPenaltyPointsColumn: {
		width: "10%",
	},
	penaltyPointsColumn: {
		width: "10%",
	},
	totalPointsColumn: {
		width: "9%",
	},
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface LeaguePlayWeeklyScoresheetsReportProps {
	data: LeaguePlayWeeklyScoresheets[];
	weekNum: string;
	desc: string;
	reportDate?: string;
}

function groupByDivisionAndSubdivision(data: LeaguePlayWeeklyScoresheets[]) {
	const map: Record<string, Record<string, LeaguePlayWeeklyScoresheets[]>> = {};
	for (const row of data) {
		const division = row.division || "Unknown";
		const subdivision = row.subdivision || "Unknown";
		if (!map[division]) map[division] = {};
		if (!map[division][subdivision]) map[division][subdivision] = [];
		map[division][subdivision].push(row);
	}
	return map;
}

const LeaguePlayWeeklyScoresheetsReport: React.FC<LeaguePlayWeeklyScoresheetsReportProps> = ({
	data,
	weekNum,
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
	const divisionMap = groupByDivisionAndSubdivision(data);
	const divisionNames = Object.keys(divisionMap);

	return (
		<Document>
			{divisionNames.map((division) => {
				const subdivisionMap = divisionMap[division];
				const subdivisionNames = Object.keys(subdivisionMap);
				return (
					<Page key={division} size="A4" style={styles.page}>
						<ReportsHeader
							title="Weekly Scoresheets"
							reportDate={reportDate}
							subtitle={`Week #${weekNum} - ${desc}`}
						/>
						<View style={styles.divisionHeader}>
							<Text>{division}</Text>
						</View>
						{subdivisionNames.map((subdivision) => (
							<View key={subdivision} wrap={false}>
								<View style={styles.subdivisionHeader}>
									<Text>
										{subdivision.startsWith("Subdivision")
											? `${division} ${subdivision.replace("Subdivision", "").trim()}`
											: `${division} ${subdivision}`}
									</Text>
								</View>
								<View style={styles.table}>
									<View style={styles.tableHeader}>
										<Text style={[styles.cell, styles.divisionInfoColumn, styles.tableHeaderText]}>
											Division Info
										</Text>
										<Text style={[styles.cell, styles.placeNameColumn, styles.tableHeaderText]}>
											Place Name
										</Text>
										<Text style={[styles.cell, styles.teamNameColumn, styles.tableHeaderText]}>
											Team Name
										</Text>
										<Text style={[styles.cell, styles.prevTotalPointsColumn, styles.tableHeaderText]}>
											PrP
										</Text>
										<Text style={[styles.cell, styles.pointsScoredColumn, styles.tableHeaderText]}>
											PS
										</Text>
										<Text style={[styles.cell, styles.previousPenaltyPointsColumn, styles.tableHeaderText]}>
											PrPP
										</Text>
										<Text style={[styles.cell, styles.penaltyPointsColumn, styles.tableHeaderText]}>
											PP
										</Text>
										<Text style={[styles.cell, styles.totalPointsColumn, styles.tableHeaderText, styles.lastCell]}>
											TP
										</Text>
									</View>
									{subdivisionMap[subdivision].map((row, idx) => (
										<View style={styles.tableRow} key={idx} wrap={false}>
											<Text style={[styles.cell, styles.divisionInfoColumn]}>
												{row.divisionInfo}
											</Text>
											<Text style={[styles.cell, styles.placeNameColumn]}>
												{row.placeName}
											</Text>
											<Text style={[styles.cell, styles.teamNameColumn]}>
												{row.teamName}
											</Text>
											<Text style={[styles.cell, styles.prevTotalPointsColumn]}>
												{row.prevTotalPoints}
											</Text>
											<Text style={[styles.cell, styles.pointsScoredColumn]}>
												{row.pointsScored}
											</Text>
											<Text style={[styles.cell, styles.previousPenaltyPointsColumn]}>
												{row.previousPenaltyPoints}
											</Text>
											<Text style={[styles.cell, styles.penaltyPointsColumn]}>
												{row.penaltyPoints}
											</Text>
											<Text style={[styles.cell, styles.totalPointsColumn, styles.lastCell]}>
												{row.totalPoints}
											</Text>
										</View>
									))}
								</View>
							</View>
						))}
						<ReportsFooter />
					</Page>
				);
			})}
		</Document>
	);
};

export default LeaguePlayWeeklyScoresheetsReport;
