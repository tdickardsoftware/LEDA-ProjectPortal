/**
 * ListsReportElectionListReport
 *
 * React-PDF document for the annual election ballot. Rows are paginated at
 * `ROWS_PER_PAGE = 35`. Each row contains a candidate name and a blank
 * ballot-tracking column.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ListsElectionList } from "@/lib/definitions";
import ReportsFooter from "@/components/ui/reports-footer";
import ReportsHeader from "@/components/ui/reports-header";

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
		width: "40%",
		fontWeight: "bold",
	},
	absBallotSentColumn: {
		width: "20%",
		fontWeight: "bold",
	},
	absBallotReceivedColumn: {
		width: "20%",
		fontWeight: "bold",
	},
	votedColumn: {
		width: "20%",
		fontWeight: "bold",
	},
	lastCell: {
		borderRight: 0,
	},
	tableHeaderText: {
		fontSize: 9,
		fontWeight: "bold",
	},
});

interface ListsReportElectionListReportProps {
	data: ListsElectionList[];
	desc: string;
	reportDate?: string;
}

const ROWS_PER_PAGE = 35;

const ListsReportElectionListReport: React.FC<ListsReportElectionListReportProps> = ({
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
	const chunkData = (arr: ListsElectionList[], size: number) => {
		const chunks: ListsElectionList[][] = [];
		for (let i = 0; i < arr.length; i += size) {
			chunks.push(arr.slice(i, i + size));
		}
		return chunks;
	};

	const pages = chunkData(data, ROWS_PER_PAGE);

	return (
		<Document>
			{pages.map((pageData, pageIdx) => (
				<Page size="A4" style={styles.page} key={pageIdx}>
					<ReportsHeader
						title="ELECTION LIST"
						reportDate={reportDate}
						subtitle={desc}
					/>
					<View style={styles.table}>
						<View style={styles.tableHeader}>
							<Text style={[styles.cell, styles.fullNameColumn, styles.tableHeaderText]}>
								Full Name
							</Text>
							<Text style={[styles.cell, styles.absBallotSentColumn, styles.tableHeaderText]}>
								Abs Ballot Sent
							</Text>
							<Text style={[styles.cell, styles.absBallotReceivedColumn, styles.tableHeaderText]}>
								Abs Ballot Received
							</Text>
							<Text style={[styles.cell, styles.votedColumn, styles.tableHeaderText, styles.lastCell]}>
								Voted
							</Text>
						</View>
						{pageData.map((row, idx) => (
							<View style={styles.tableRow} key={idx} wrap={false}>
								<Text style={[styles.cell, styles.fullNameColumn]}>
									{row.fullName}
								</Text>
								<Text style={[styles.cell, styles.absBallotSentColumn]}></Text>
								<Text style={[styles.cell, styles.absBallotReceivedColumn]}></Text>
								<Text style={[styles.cell, styles.votedColumn, styles.lastCell]}></Text>
							</View>
						))}
					</View>
					<ReportsFooter />
				</Page>
			))}
		</Document>
	);
};

export default ListsReportElectionListReport;
