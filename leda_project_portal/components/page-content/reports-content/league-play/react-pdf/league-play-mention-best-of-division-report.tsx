/**
 * LeaguePlayMentionBestOfDivisionReport
 *
 * React-PDF document listing "Best of Division" award mentions for the
 * selected season. Rows are grouped by division using the `groupByDivision`
 * helper and display player name, team, and mention details.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MentionBestOfDivision } from "@/lib/definitions";
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
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
	divisionTitle: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 8,
	},
});

interface MentionBestOfDivisionReportProps {
	data: MentionBestOfDivision[];
	reportDate?: string;
}

function groupByDivision(data: MentionBestOfDivision[]) {
	const map: Record<string, MentionBestOfDivision[]> = {};
	for (const row of data) {
		const division = row.division || "Unknown";
		if (!map[division]) map[division] = [];
		map[division].push(row);
	}
	return map;
}

const LeaguePlayMentionBestOfDivisionReport: React.FC<MentionBestOfDivisionReportProps> = ({
	data,
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
	const divisionNames = Object.keys(divisionMap).sort();
	const ROWS_PER_PAGE = 35;

	// Helper function to chunk data into pages
	const chunkData = (divisionData: MentionBestOfDivision[]) => {
		const chunks: MentionBestOfDivision[][] = [];
		for (let i = 0; i < divisionData.length; i += ROWS_PER_PAGE) {
			chunks.push(divisionData.slice(i, i + ROWS_PER_PAGE));
		}
		return chunks;
	};

	return (
		<Document>
			{divisionNames.map((division) => {
				const divisionData = divisionMap[division];
				const dataChunks = chunkData(divisionData);
				
				return dataChunks.map((chunk, pageIndex) => (
					<Page key={`${division}-${pageIndex}`} size="A4" style={styles.page}>
						<ReportsHeader
							title={`Mentions Best of Division`}
							reportDate={reportDate}
						/>
						<View style={styles.divisionTitle}>
							<Text>{division}</Text>
						</View>
						<View style={styles.table}>
							<View style={styles.tableHeader}>
								<Text style={[styles.cell, styles.tableHeaderText, { width: "20%" }]}>Mention Desc</Text>
								<Text style={[styles.cell, styles.tableHeaderText, { width: "15%" }]}>Player LEDA ID</Text>
								<Text style={[styles.cell, styles.tableHeaderText, { width: "20%" }]}>Player Name</Text>
								<Text style={[styles.cell, styles.tableHeaderText, { width: "20%" }]}>Team Name</Text>
								<Text style={[styles.cell, styles.tableHeaderText, { width: "10%" }]}>Count</Text>
								<Text style={[styles.cell, styles.tableHeaderText, { width: "15%" }, styles.lastCell]}>Hi or Lo</Text>
								
							</View>
							{chunk.map((row, i) => (
								<View style={styles.tableRow} key={i} wrap={false}>
									<Text style={[styles.cell, { width: "20%" }]}>{row.mentionDesc}</Text>
									<Text style={[styles.cell, { width: "15%" }]}>{row.ledaId}</Text>
									<Text style={[styles.cell, { width: "20%" }]}>{row.fullName}</Text>
									<Text style={[styles.cell, { width: "20%" }]}>{row.teamName}</Text>
									<Text style={[styles.cell, { width: "10%" }]}>{row.mentionCount}</Text>
									<Text style={[styles.cell, { width: "15%" }, styles.lastCell]}>{row.mentionBasis}</Text>
								</View>
							))}
						</View>
						<ReportsFooter />
					</Page>
				));
			})}
		</Document>
	);
};

export default LeaguePlayMentionBestOfDivisionReport;
