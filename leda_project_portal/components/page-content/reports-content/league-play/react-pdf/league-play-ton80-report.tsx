/**
 * LeaguePlayTon80Report
 *
 * React-PDF document listing all Ton80 (180) and Ton71 (171) achievements
 * recorded during the selected season. Columns: player name, score
 * value, team, week number, and date.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Ton80 } from "@/lib/definitions";
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
	fullNameColumn: {
		width: "33%",
	},
	t71Column: {
		width: "33%",
	},
	t80Column: {
		width: "33%",
	},
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface Ton80ReportProps {
	data: Ton80[];
	desc: string;
	weekNum: string;
	reportDate?: string;
}

const LeaguePlayTon80Report: React.FC<Ton80ReportProps> = ({
	data,
	desc,
	weekNum,
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
	const ROWS_PER_PAGE = 35;

	// Helper function to chunk data into pages
	const chunkData = (data: Ton80[]) => {
		const chunks: Ton80[][] = [];
		for (let i = 0; i < data.length; i += ROWS_PER_PAGE) {
			chunks.push(data.slice(i, i + ROWS_PER_PAGE));
		}
		return chunks;
	};

	const dataChunks = chunkData(data);

	return (
		<Document>
			{dataChunks.map((chunk, pageIndex) => (
				<Page key={pageIndex} size="A4" style={styles.page}>
					<ReportsHeader
						title="Ton80 Report"
						reportDate={reportDate}
						subtitle={`${desc} - Through Week #${weekNum}`}
					/>
					<View style={styles.table}>
						<View style={styles.tableHeader}>
							<Text style={[styles.cell, styles.fullNameColumn, styles.tableHeaderText]}>Player Name</Text>
							<Text style={[styles.cell, styles.t71Column, styles.tableHeaderText]}>T71 Cumulative</Text>
							<Text style={[styles.cell, styles.t80Column, styles.tableHeaderText, styles.lastCell]}>T80 Cumulative</Text>
						</View>
						{chunk.map((row, idx) => (
							<View style={styles.tableRow} key={idx} wrap={false}>
								<Text style={[styles.cell, styles.fullNameColumn]}>{row.fullName}</Text>
								<Text style={[styles.cell, styles.t71Column]}>{row.t71Cumulative}</Text>
								<Text style={[styles.cell, styles.t80Column, styles.lastCell]}>{row.t80Cumulative}</Text>
							</View>
						))}
					</View>
					<ReportsFooter />
				</Page>
			))}
		</Document>
	);
};

export default LeaguePlayTon80Report;
