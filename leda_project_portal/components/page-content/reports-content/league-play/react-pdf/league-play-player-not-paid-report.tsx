/**
 * LeaguePlayPlayerNotPaidReport
 *
 * React-PDF document listing players whose league dues are unpaid for the
 * selected season. Renders a simple table: player name, team, division.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PlayerNotPaid } from "@/lib/definitions";
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
	seasonCodeColumn: {
		width: "25%",
		fontWeight: "bold",
	},
	ledaIdColumn: {
		width: "25%",
		fontWeight: "bold",
	},
	fullNameColumn: {
		width: "50%",
	},
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface PlayerNotPaidReportProps {
	data: PlayerNotPaid[];
	desc: string;
	reportDate?: string;
}

const LeaguePlayPlayerNotPaidReport: React.FC<PlayerNotPaidReportProps> = ({
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
	const ROWS_PER_PAGE = 35;

	// Helper function to chunk data into pages
	const chunkData = (data: PlayerNotPaid[]) => {
		const chunks: PlayerNotPaid[][] = [];
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
						title="Players Not Paid"
						reportDate={reportDate}
						subtitle={desc}
					/>
					<View style={styles.table}>
						<View style={styles.tableHeader}>
							<Text style={[styles.cell, styles.ledaIdColumn, styles.tableHeaderText]}>
								Player LEDA ID
							</Text>
							<Text style={[styles.cell, styles.fullNameColumn, styles.tableHeaderText, styles.lastCell]}>
								Full Name
							</Text>
						</View>
						{chunk.map((row, idx) => (
							<View style={styles.tableRow} key={idx} wrap={false}>
								<Text style={[styles.cell, styles.ledaIdColumn]}>
									{row.ledaId}
								</Text>
								<Text style={[styles.cell, styles.fullNameColumn, styles.lastCell]}>
									{row.fullName}
								</Text>
							</View>
						))}
					</View>
					<ReportsFooter />
				</Page>
			))}
		</Document>
	);
};

export default LeaguePlayPlayerNotPaidReport;
