import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MentionPlaque } from "@/lib/definitions";
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
	// Subtable for mentions
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

interface MentionPlaqueReportProps {
	data: MentionPlaque[];
	minimumMentions: number;
    desc: string;
	reportDate?: string;
}

function groupByDivision(data: MentionPlaque[]) {
	const map: Record<string, MentionPlaque[]> = {};
	for (const row of data) {
		const division = row.division || "Unknown";
		if (!map[division]) map[division] = [];
		map[division].push(row);
	}
	return map;
}

const LeaguePlayMentionPlaqueReport: React.FC<MentionPlaqueReportProps> = ({
	data,
	minimumMentions,
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
	const divisionMap = groupByDivision(data);
	const divisionNames = Object.keys(divisionMap);

	return (
		<Document>
			{divisionNames.map((division) => (
				<Page key={division} size="A4" style={styles.page}>
					<ReportsHeader
						title="Mentions For Plaque"
						reportDate={reportDate}
                        subtitle={desc}
					/>
					<View style={styles.divisionHeader}>
						<Text>
							Division: {division}
						</Text>
					</View>
					<View style={styles.subtitle}>
						<Text>
							Minimum Mentions Required: {minimumMentions}
						</Text>
					</View>
					{divisionMap[division].map((row, i) => (
						<View key={i} wrap={false}>
							<View style={styles.playerTable}>
								{/* Table Header for each player/subtable */}
								<View style={styles.playerHeader}>
									<Text style={[styles.playerCell, { width: "25%" }]}>Player Name</Text>
									<Text style={[styles.playerCell, { width: "13%" }]}>LEDA ID</Text>
									<Text style={[styles.playerCell, { width: "13%" }]}>Division Info</Text>
									<Text style={[styles.playerCell, { width: "13%" }]}>Total Mentions</Text>
									<Text style={[styles.playerCell, { width: "18%" }]}>Team Name</Text>
									<Text style={[styles.playerCell, { width: "18%" }, styles.lastCell]}>Division</Text>
								</View>
								<View style={styles.playerRow}>
									<Text style={[styles.playerCell, { width: "25%" }]}>{row.fullName}</Text>
									<Text style={[styles.playerCell, { width: "13%" }]}>{row.ledaId}</Text>
									<Text style={[styles.playerCell, { width: "13%" }]}>{row.divisionInfo}</Text>
									<Text style={[styles.playerCell, { width: "13%" }]}>{row.mentionsCount}</Text>
									<Text style={[styles.playerCell, { width: "18%" }]}>{row.teamName}</Text>
									<Text style={[styles.playerCell, { width: "18%" }, styles.lastCell]}>{row.division}</Text>
								</View>
								{/* Mentions subtable */}
								<View style={styles.mentionsTable}>
									<View style={styles.mentionsHeader}>
										<Text style={[styles.mentionsCell, styles.mentionsDescCol]}>Mention Description</Text>
										<Text style={[styles.mentionsCell, styles.mentionsCountCol, styles.mentionsLastCell]}>Count</Text>
									</View>
									{Array.isArray(row.mentions) && row.mentions.map((mention, j) => (
										<View style={styles.mentionsRow} key={j}>
											<Text style={[styles.mentionsCell, styles.mentionsDescCol]}>{mention.mentionDesc}</Text>
											<Text style={[styles.mentionsCell, styles.mentionsCountCol, styles.mentionsLastCell]}>{mention.count}</Text>
										</View>
									))}
								</View>
							</View>
						</View>
					))}
					<ReportsFooter />
				</Page>
			))}
		</Document>
	);
};

export default LeaguePlayMentionPlaqueReport;
